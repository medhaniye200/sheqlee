import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import logo from "../../assets/settings-alt2.png";
import dashboard from "../../assets/DashBoard/dashboard.png";
import jobs from "../../assets/DashBoard/jobs.png";
import companies from "../../assets/DashBoard/company.png";
import freelancers from "../../assets/DashBoard/freelancers.png";
import categories from "../../assets/DashBoard/categories.png";
import tags from "../../assets/DashBoard/tag.png";
import bell from "../../assets/DashBoard/bell.png";
import feedback from "../../assets/jobPosts/feedback@2x.png";
import settings from "../../assets/DashBoard/settings.png";
import users from "../../assets/DashBoard/users.png";
import { records } from "../../services/recordService";

const links = [
  ["/dashboard", "Dashboard", dashboard], ["/side-bar/job-posts", "Job Posts", jobs],
  ["/side-bar/companies", "Companies", companies], ["/side-bar/freelancers", "Freelancers", freelancers],
  ["/admin/categories", "Categories", categories], ["/admin/tags", "Tags", tags],
  ["/admin/subscribers", "Subscribers", bell], ["/admin/notifications", "Notifications", bell],
  ["/admin/feedbacks", "Feedback", feedback], ["/admin/system-config", "System Config", settings],
  ["/admin/users", "Users", users],
];

export default function ControlBoard({ user, onLogout }) {
  const location = useLocation();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const expanded = menu === location.key;
  const profile = records.profiles.find(user.id);

  return <div className="board">
    <header className="topbar">
      <Link to="/dashboard">Sheqlee Control Board</Link>
      <button className="menu-toggle" aria-expanded={expanded} aria-controls="sidebar"
        onClick={() => setMenu(expanded ? null : location.key)}>Menu</button>
    </header>
    <aside id="sidebar" className={expanded ? "sidebar expanded" : "sidebar"}>
      <Link to="/dashboard" className="board-logo"><img src={logo} alt="Sheqlee dashboard" /></Link>
      <div className="account">
        <NavLink to="/admin/profile" onClick={() => setMenu(null)}>{profile?.name || user.name}</NavLink>
        <button type="button" onClick={() => { try { onLogout(); } catch (failure) { setError(failure.message); } }}>
          <FiLogOut aria-hidden="true" /> Log out
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <nav aria-label="Main navigation">
        {links.filter(([, label]) => label !== "Users" || user.role !== "User").map(([path, label, icon]) =>
          <NavLink key={path} to={path} onClick={() => setMenu(null)}><img src={icon} alt="" />{label}</NavLink>
        )}
      </nav>
    </aside>
    <main className="workspace"><Outlet /></main>
  </div>;
}
