export const seedData = {
  companies: [
    { id: "CO-1", name: "Blue Acacia Studio", email: "studio@example.com", status: "Active" },
    { id: "CO-2", name: "Rift Valley Labs", email: "labs@example.com", status: "Active" },
  ],
  categories: [
    { id: "CAT-1", title: "Software Engineering", description: "Build and maintain web products." },
    { id: "CAT-2", title: "Design", description: "Design products and visual experiences." },
  ],
  tags: [{ id: "TAG-1", title: "React" }, { id: "TAG-2", title: "Accessibility" }],
  jobs: [
    { id: "JOB-1", title: "Frontend Developer", company: "CO-1", category: "CAT-1", tag: "TAG-1", type: "Full-time", level: "Intermediate", status: "Open", description: "Build accessible interfaces for small businesses." },
    { id: "JOB-2", title: "Product Designer", company: "CO-2", category: "CAT-2", tag: "TAG-2", type: "Contract", level: "Senior", status: "Draft", description: "Design a simpler onboarding experience." },
  ],
  applicants: [{ id: "APP-1", name: "Demo Applicant A", title: "Frontend Developer", job: "JOB-1", status: "New" }],
  freelancers: [{ id: "FR-1", name: "Demo Freelancer A", title: "Product Designer", email: "designer@example.com", cv: "Missing", status: "Active" }],
  users: [
    { id: "demo-owner", name: "Demo Owner", email: "owner@example.com", role: "Super Admin", status: "Active" },
    { id: "demo-admin", name: "Demo Admin", email: "admin@example.com", role: "Admin", status: "Active" },
    { id: "demo-user", name: "Demo User", email: "viewer@example.com", role: "User", status: "Active" },
  ],
  faqs: [{ title: "", question: "How do I find open roles?", audience: "Freelancers", answer: "Filter job posts by Open status." }],
  pages: [{ title: "About Sheqlee", content: "Sheqlee is a job management control board.", status: "Published" },
    { title: "Privacy policy", content: "This demo uses fictional data stored in your browser.", status: "Draft" }],
  footer: [{ title: "Copyright", content: "Sheqlee" }],
  hero: [{ title: "Heading", content: "Find your next opportunity" },
    { title: "Description", content: "Explore jobs and connect with companies." },
    { title: "Animation", content: "Disabled" }],
  testimonials: [{ company: "CO-1", name: "Demo Company Rep", title: "Studio Lead", testimony: "Sheqlee helps us track applications in one place." }],
  subscribers: [
    { email: "company-alerts@example.com", group: "Companies", status: "Active" },
    { email: "category-alerts@example.com", group: "Categories", status: "Active" },
    { email: "tag-alerts@example.com", group: "Tags", status: "Active" },
  ],
  feedback: [{ name: "Demo Reviewer", email: "reviewer@example.com", message: "The job category filter helps me find relevant posts.", status: "Unread" }],
  notifications: [{ title: "Welcome to Sheqlee", message: "Explore the control board using fictional demo records.", status: "Unread" }],
  profiles: [],
};
