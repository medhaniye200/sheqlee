import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { modules } from "../constants/modules";
import { records } from "../services/recordService";
import { auth } from "../services/authService";
import { useCollection } from "../hooks/useCollection";
import { queryRecords } from "../utils/queryRecords";
import RecordForm from "../components/common/RecordForm";

const empty = {};
const dateLabel = (date) => new Date(date).toLocaleDateString();

export default function CollectionPage({ module, user, scope = empty, heading, initialEditor = null, onUserChange }) {
  const schema = modules[module];
  const service = records[module];
  const { id } = useParams();
  const { value, warning, refresh } = useCollection(module);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [dates, setDates] = useState({});
  const [sort, setSort] = useState({ sort: "createdAt", descending: true });
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState(initialEditor === "add" ? {} : null);
  const [detail, setDetail] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState(null);
  const confirmation = useRef(null);
  const details = useRef(null);
  const canEdit = auth.canEdit(user, module);
  const relations = Object.fromEntries(schema.fields.filter((field) => field.relation)
    .map(({ key, relation }) => [key, Object.fromEntries(records[relation].all().map((item) => [item.id, item.name || item.title]))]));
  const display = (record, key) => relations[key]?.[record[key]] || record[key];
  const baseFilters = id ? { ...scope, [module === "applicants" ? "job" : "category"]: id } : scope;
  const result = queryRecords(value, { search, filters: { ...filters, ...baseFilters }, ...dates, ...sort, page, display });
  const fields = schema.fields.filter(({ multiline }) => !multiline);
  const relatedCount = (key, field, rowId, status) => records[key].all().filter((item) =>
    item[field] === rowId && (!status || item.status === status)).length;

  function finish(text) {
    refresh();
    setMessage({ text });
    if (module === "users") onUserChange?.();
  }

  function save(input) {
    service.save(input, editor.id);
    setEditor(null);
    finish(schema.singular + " saved.");
  }

  function remove() {
    try {
      if (module === "users" && deleting.id === user.id) throw new Error("You cannot delete your signed-in account.");
      service.remove(deleting.id);
      finish(schema.singular + " deleted.");
    } catch (failure) {
      setMessage({ error: true, text: failure.message });
    }
    confirmation.current.close();
  }

  return <section>
    <div className="section-header">
      <h1>{heading || schema.label}{id && module === "applicants" ? " · " + (records.jobs.find(id)?.title || "Unknown job") : ""}</h1>
      {module === "jobs" && !id && <Link to="/side-bar/job-posts/applicants">All applicants</Link>}
      {id && <Link to={module === "applicants" ? "/side-bar/job-posts" : "/admin/categories"}>Back to {module === "applicants" ? "job posts" : "categories"}</Link>}
      {canEdit && <button className="primary" onClick={() => setEditor({})}>Add {schema.singular}</button>}
    </div>
    {warning && <p role="alert">{warning}</p>}
    {message && <p role={message.error ? "alert" : "status"}>{message.text}</p>}
    <div className="filters">
      <label>Search<input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
      {schema.fields.filter(({ key, choices, relation }) => !baseFilters[key] && (choices || relation)).map(({ key, label, choices }) =>
        <label key={key}>{label}<select value={filters[key] || ""} onChange={(event) => {
          setFilters({ ...filters, [key]: event.target.value }); setPage(1);
        }}>
          <option value="">All</option>
          {(choices?.map((choice) => [choice, choice]) || Object.entries(relations[key])).map(([value, label]) =>
            <option key={value} value={value}>{label}</option>)}
        </select></label>
      )}
      {["from", "to"].map((key) => <label key={key}>{key === "from" ? "Created from" : "Created to"}
        <input type="date" value={dates[key] || ""} onChange={(event) => { setDates({ ...dates, [key]: event.target.value }); setPage(1); }} />
      </label>)}
    </div>
    {result.total === 0 ? <p className="empty">No records match this view.</p> :
      <div className="table-scroll" tabIndex={0} role="region" aria-label={schema.label + " table"}>
        <table>
          <thead><tr>
            {[{ key: "id", label: "ID" }, ...fields, { key: "createdAt", label: "Created" }].map(({ key, label }) =>
              <th key={key} scope="col" aria-sort={sort.sort === key ? (sort.descending ? "descending" : "ascending") : undefined}>
                <button onClick={() => { setSort({ sort: key, descending: sort.sort === key && !sort.descending }); setPage(1); }}>
                  {label}{sort.sort === key ? (sort.descending ? " ↓" : " ↑") : ""}
                </button>
              </th>)}
            <th scope="col">Actions</th>
          </tr></thead>
          <tbody>{result.items.map((record) => <tr key={record.id}>
            <td title={record.id}>{record.id.length > 18 ? record.id.slice(0, 15) + "…" : record.id}</td>
            {fields.map(({ key, type }) => <td key={key}>
              {type === "url" && /^https?:\/\//i.test(record[key]) ? <a href={record[key]} target="_blank" rel="noreferrer">Open link</a> : display(record, key) || "—"}
            </td>)}
            <td>{dateLabel(record.createdAt)}</td>
            <td><div className="actions">
              <button onClick={() => { setDetail(record); details.current.showModal(); }}>View</button>
              {module === "jobs" && <Link to={"/side-bar/job-posts/applicants/" + record.id}>Applicants ({relatedCount("applicants", "job", record.id)})</Link>}
              {module === "categories" && <Link to={"/admin/categories/jobs/" + record.id}>Jobs ({relatedCount("jobs", "category", record.id)})</Link>}
              {canEdit && <><button onClick={() => setEditor(record)}>Edit</button><button onClick={() => { setDeleting(record); confirmation.current.showModal(); }}>Delete</button></>}
            </div></td>
          </tr>)}</tbody>
        </table>
      </div>}
    {result.total > 0 && <div className="pagination">
      <button disabled={result.page === 1} onClick={() => setPage(result.page - 1)}>Previous</button>
      <span>Page {result.page} of {result.pages} · {result.total} records</span>
      <button disabled={result.page === result.pages} onClick={() => setPage(result.page + 1)}>Next</button>
    </div>}
    {canEdit && editor && <RecordForm schema={schema} record={editor.id ? editor : null} defaults={baseFilters} onClose={() => setEditor(null)} onSave={save} />}
    <dialog ref={confirmation} aria-labelledby="delete-title">
      <h2 id="delete-title">Delete {schema.singular}?</h2>
      <p>{deleting?.name || deleting?.title || deleting?.question || deleting?.id}</p>
      <div className="actions"><button autoFocus onClick={() => confirmation.current.close()}>Cancel</button><button className="danger" onClick={remove}>Delete</button></div>
    </dialog>
    <dialog ref={details} aria-labelledby="details-title">
      <h2 id="details-title">{schema.singular} details</h2>
      {detail && <dl>{[{ key: "id", label: "ID" }, ...schema.fields, { key: "updatedAt", label: "Last updated" }].map(({ key, label }) =>
        <div key={key}><dt>{label}</dt><dd>{key === "updatedAt" ? dateLabel(detail[key]) : display(detail, key) || "—"}</dd></div>
      )}</dl>}
      <button onClick={() => details.current.close()}>Close</button>
    </dialog>
  </section>;
}

