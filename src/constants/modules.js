const field = (key, label, options = {}) => ({ key, label, ...options });
const status = (...choices) => field("status", "Status", { choices });
const email = field("email", "Email", { type: "email" });
const name = field("name", "Name");
const description = field("description", "Description", { multiline: true, optional: true });
const title = field("title", "Title");
const company = field("company", "Company", { relation: "companies" });

export const modules = {
  jobs: { label: "Job Posts", singular: "Job post", prefix: "JOB", fields: [
    title, company, field("category", "Category", { relation: "categories" }),
    field("tag", "Tag", { relation: "tags", optional: true }),
    field("type", "Job type", { choices: ["Full-time", "Part-time", "Contract", "Internship"] }),
    field("level", "Skill level", { choices: ["Junior", "Intermediate", "Senior"] }),
    status("Draft", "Open", "Closed"), description,
    field("link", "Application link", { type: "url", optional: true }),
  ] },
  applicants: { label: "Applicants", singular: "Applicant", prefix: "APP", fields: [
    name, title, field("job", "Job post", { relation: "jobs" }), status("New", "Shortlisted", "Accepted", "Rejected"),
  ] },
  categories: { label: "Categories", singular: "Category", prefix: "CAT", fields: [title, description], unique: "title" },
  tags: { label: "Tags", singular: "Tag", prefix: "TAG", fields: [title, description], unique: "title" },
  companies: { label: "Companies", singular: "Company", prefix: "CO", fields: [name, email, status("Active", "Suspended", "Deleted"), field("reason", "Deletion reason", { optional: true })] },
  freelancers: { label: "Freelancers", singular: "Freelancer", prefix: "FR", fields: [name, title, email, status("Active", "Suspended", "Deleted"), field("cv", "CV status", { choices: ["Available", "Missing"] }), field("reason", "Deletion reason", { optional: true })] },
  users: { label: "Users", singular: "User", prefix: "USR", fields: [name, email, field("phone", "Phone", { optional: true }), field("role", "Role", { choices: ["Super Admin", "Admin", "User"] }), status("Active", "Disabled")], unique: "email" },
  faqs: { label: "FAQ", singular: "FAQ", prefix: "FAQ", fields: [field("question", "Question"), field("audience", "Audience", { choices: ["Freelancers", "Companies", "Everyone"] }), field("answer", "Answer", { multiline: true })] },
  pages: { label: "About & policies", singular: "Page", prefix: "PAGE", fields: [title, field("content", "Content", { multiline: true }), status("Draft", "Published")] },
  footer: { label: "Footer", singular: "Footer section", prefix: "FT", fields: [title, field("content", "Content", { multiline: true })] },
  hero: { label: "Hero", singular: "Hero section", prefix: "HERO", fields: [title, field("content", "Content", { multiline: true })] },
  testimonials: { label: "Testimonials", singular: "Testimonial", prefix: "TEST", fields: [company, name, title, field("testimony", "Testimony", { multiline: true })] },
  subscribers: { label: "Subscribers", singular: "Subscription", prefix: "SUB", fields: [email, field("group", "Group", { choices: ["Companies", "Categories", "Tags"] }), status("Active", "Unsubscribed")] },
  feedback: { label: "Feedback", singular: "Feedback entry", prefix: "FB", fields: [name, email, field("message", "Message", { multiline: true }), status("Unread", "Reviewed")] },
  notifications: { label: "Notifications", singular: "Notification", prefix: "NOTE", fields: [title, field("message", "Message", { multiline: true }), status("Unread", "Read")] },
  profiles: { label: "Profile", singular: "Profile", prefix: "PRO", fields: [name, email, field("phone", "Phone", { optional: true })] },
};
