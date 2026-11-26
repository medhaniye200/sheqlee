import { useRef, useState, useEffect } from "react";
import { records } from "../../services/recordService";

export default function RecordForm({ schema, record, defaults, onSave, onClose }) {
  const dialog = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const editor = dialog.current;
    editor.showModal();
    return () => editor.close();
  }, []);

  function submit(event) {
    event.preventDefault();
    try {
      onSave(Object.fromEntries(new FormData(event.currentTarget)));
    } catch (failure) {
      setError(failure.message);
    }
  }

  return <dialog ref={dialog} aria-labelledby="editor-title" onCancel={onClose}>
    <h2 id="editor-title">{record ? "Edit" : "Add"} {schema.singular}</h2>
    <form onSubmit={submit} className="record-form">
      {schema.fields.map(({ key, label, optional, choices, relation, type, multiline }) => {
        const value = record?.[key] ?? defaults[key] ?? "";
        const options = relation
          ? records[relation].all().map((item) => [item.id, item.name || item.title])
          : choices?.map((choice) => [choice, choice]);
        return <label key={key}>{label}
          {options ? <select name={key} defaultValue={value} required={!optional}>
            <option value="">{optional ? "None" : "Select " + label.toLowerCase()}</option>
            {options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select> : multiline
            ? <textarea name={key} defaultValue={value} required={!optional} maxLength={5000} rows={4} />
            : <input name={key} type={type || "text"} defaultValue={value} required={!optional} maxLength={250} />}
        </label>;
      })}
      {error && <p role="alert">{error}</p>}
      <div className="actions"><button className="primary">Save</button><button type="button" onClick={onClose}>Cancel</button></div>
    </form>
  </dialog>;
}

