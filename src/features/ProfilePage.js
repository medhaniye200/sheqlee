import { useRef, useState } from "react";
import RecordForm from "../components/common/RecordForm";
import { modules } from "../constants/modules";
import { useCollection } from "../hooks/useCollection";
import { records } from "../services/recordService";

export default function ProfilePage({ user, onProfileChange }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const confirmation = useRef(null);
  const { value, warning, refresh } = useCollection("profiles");
  const saved = value.find((profile) => profile.id === user.id);
  const current = saved || { name: user.name, email: user.email, phone: user.phone };

  function finish(text) {
    setMessage({ text });
    refresh();
    onProfileChange();
  }

  function save(input) {
    records.profiles.save(input, saved?.id, user.id);
    setEditing(false);
    finish("Profile saved.");
  }

  function remove() {
    try {
      records.profiles.remove(saved.id);
      finish("Profile reset to the account details.");
    } catch (failure) {
      setMessage({ error: true, text: failure.message });
    }
    confirmation.current.close();
  }

  return <section>
    <h1>Profile</h1>
    {warning && <p role="alert">{warning}</p>}
    {message && <p role={message.error ? "alert" : "status"}>{message.text}</p>}
    <dl className="profile-details">
      <dt>Name</dt><dd>{current.name}</dd><dt>Contact email</dt><dd>{current.email}</dd>
      <dt>Phone</dt><dd>{current.phone || "—"}</dd><dt>Role</dt><dd>{user.role}</dd>
    </dl>
    <div className="actions">
      <button className="primary" onClick={() => setEditing(true)}>Edit profile</button>
      {saved && <button onClick={() => confirmation.current.showModal()}>Reset profile</button>}
    </div>
    {editing && <RecordForm schema={modules.profiles} record={current} defaults={{}} onSave={save} onClose={() => setEditing(false)} />}
    <dialog ref={confirmation} aria-labelledby="profile-reset-title">
      <h2 id="profile-reset-title">Reset profile?</h2>
      <p>Your saved profile details will be removed and the account details will be shown.</p>
      <div className="actions">
        <button autoFocus onClick={() => confirmation.current.close()}>Cancel</button>
        <button className="danger" onClick={remove}>Reset profile</button>
      </div>
    </dialog>
  </section>;
}
