import { useState, useReducer } from "react";
import { Routes, Route, Navigate, NavLink, useLocation } from "react-router-dom";
import { auth } from "../services/authService";
import ControlBoard from "../components/layout/ControlBoard";
import AuthPage from "../features/AuthPage";
import CollectionPage from "../features/CollectionPage";
import Dashboard from "../features/Dashboard";
import ProfilePage from "../features/ProfilePage";

const jobPath = "/side-bar/job-posts";
const categoryPath = "/admin/categories";
const settingsPath = "/admin/system-config";
const subscriberPath = "/admin/subscribers";
const dashboardTabs = [["job-posts", "Job Posts"], ["companies", "Companies"], ["freelancers", "Freelancers"], ["email-alerts", "Email Alerts"]];
const subscriberTabs = [["companies", "Companies"], ["categories", "Categories"], ["tags", "Tags"]];
const settingsTabs = [["faq", "FAQ", "faqs"], ["apgspp", "About & policies", "pages"], ["testimonials", "Testimonials", "testimonials"], ["hero", "Hero", "hero"], ["footer", "Footer", "footer"]];

function Tabs({ base, entries, children }) {
  return <><nav className="tabs" aria-label="Section navigation">
    {entries.map(([path, label]) => <NavLink key={path} to={base + "/" + path}>{label}</NavLink>)}
  </nav>{children}</>;
}

export default function BoardRoutes() {
  const location = useLocation();
  const [user, setUser] = useState(auth.current);
  const [, refreshProfile] = useReducer((revision) => revision + 1, 0);
  const refreshUser = () => setUser(auth.current());
  const collection = (module, options = {}) => <CollectionPage key={location.pathname} module={module} user={user} onUserChange={refreshUser} {...options} />;
  const settings = (module, options) => <Tabs base={settingsPath} entries={settingsTabs}>{collection(module, options)}</Tabs>;
  const userPage = (options) => user?.role === "User" ? <Navigate to="/dashboard" replace /> : collection("users", options);
  const publicModes = [["/", "login"], ["/reset-password", "request"], ["/new-password", "reset"], ["/one-time-code", "activate"]];
  const protectedLayout = user ? <ControlBoard user={user} onLogout={() => { auth.signOut(); refreshUser(); }} /> :
    <Navigate to="/" state={{ from: location.pathname }} replace />;

  return <Routes>
    {publicModes.map(([path, mode]) => <Route key={path} path={path} element={<AuthPage key={mode} mode={mode} user={user} onUserChange={refreshUser} />} />)}
    <Route element={protectedLayout}>
      <Route path="/dashboard" element={<Navigate to="/dashboard/job-posts" replace />} />
      {dashboardTabs.map(([path]) => <Route key={path} path={"/dashboard/" + path} element={
        <Tabs base="/dashboard" entries={dashboardTabs}><Dashboard key={path} view={path} /></Tabs>
      } />)}
      <Route path={jobPath} element={collection("jobs")} />
      <Route path={jobPath + "/applicants"} element={collection("applicants")} />
      <Route path={jobPath + "/applicants/:id"} element={collection("applicants")} />
      <Route path={jobPath + "/applicant-7"} element={<Navigate to={jobPath + "/applicants"} replace />} />
      <Route path="/side-bar/companies" element={collection("companies")} />
      <Route path="/side-bar/freelancers" element={collection("freelancers")} />
      <Route path={categoryPath} element={collection("categories")} />
      <Route path={categoryPath + "/jobs/:id"} element={collection("jobs", { heading: "Category jobs" })} />
      <Route path={categoryPath + "/add-category"} element={collection("categories", { initialEditor: "add" })} />
      <Route path={categoryPath + "/update-category"} element={<Navigate to={categoryPath} replace />} />
      <Route path="/admin/tags" element={collection("tags")} />
      <Route path="/admin/tags/add-tags" element={collection("tags", { initialEditor: "add" })} />
      <Route path="/admin/tags/update-tags" element={<Navigate to="/admin/tags" replace />} />
      <Route path="/admin/feedbacks" element={collection("feedback")} />
      <Route path="/admin/notifications" element={collection("notifications")} />
      <Route path="/admin/users" element={userPage()} />
      <Route path="/admin/users/register-users" element={userPage({ initialEditor: "add" })} />
      <Route path="/admin/profile" element={user && <ProfilePage key={user.id} user={user} onProfileChange={refreshProfile} />} />
      <Route path={subscriberPath} element={<Navigate to={subscriberPath + "/companies"} replace />} />
      {subscriberTabs.map(([path, group]) => <Route key={path} path={subscriberPath + "/" + path} element={
        <Tabs base={subscriberPath} entries={subscriberTabs}>{collection("subscribers", { scope: { group }, heading: group + " subscribers" })}</Tabs>
      } />)}
      <Route path={settingsPath} element={<Navigate to={settingsPath + "/faq"} replace />} />
      {settingsTabs.map(([path, , module]) => <Route key={path} path={settingsPath + "/" + path} element={settings(module)} />)}
      <Route path="/system-config/add-FAQ" element={settings("faqs", { initialEditor: "add" })} />
      {[
        ["update-FAQ", "faq"], ["read-about", "apgspp"], ["update-about", "apgspp"], ["update-testimonials", "testimonials"],
        ["update-hero", "hero"], ["update-description", "hero"], ["update-animation", "hero"],
      ].map(([old, current]) => <Route key={old} path={"/system-config/" + old} element={<Navigate to={settingsPath + "/" + current} replace />} />)}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes>;
}
