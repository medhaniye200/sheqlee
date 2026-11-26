import { useState } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../hooks/useCollection";

const views = {
  "job-posts": ["jobs", "Job Posts", "/side-bar/job-posts", ["Open", "Draft", "Closed"]],
  companies: ["companies", "Companies", "/side-bar/companies", ["Active", "Suspended", "Deleted"]],
  freelancers: ["freelancers", "Freelancers", "/side-bar/freelancers", ["Active", "Suspended", "Deleted"]],
  "email-alerts": ["subscribers", "Email Alerts", "/admin/subscribers", ["Active", "Unsubscribed"]],
};

export default function Dashboard({ view }) {
  const [module, label, path, statuses] = views[view];
  const { value, warning } = useCollection(module);
  const [period, setPeriod] = useState("");
  const months = [...new Set(value.map((item) => item.createdAt.slice(0, 7)))].sort().reverse();
  const filtered = value.filter((item) => !period || item.createdAt.startsWith(period));
  const metrics = [["Total", filtered.length], ...statuses.map((status) =>
    [status, filtered.filter((item) => item.status === status).length])];
  return <section>
    <div className="section-header"><h1>{label} dashboard</h1><Link to={path}>Manage {label.toLowerCase()}</Link></div>
    {warning && <p role="alert">{warning}</p>}
    <div className="filters"><label>Registration month<select value={period} onChange={(event) => setPeriod(event.target.value)}>
      <option value="">All time</option>
      {months.map((month) => <option key={month}>{month}</option>)}
    </select></label></div>
    <div className="metrics">{metrics.map(([title, count]) => <article key={title}><h2>{title}</h2><strong>{count}</strong></article>)}</div>
  </section>;
}
