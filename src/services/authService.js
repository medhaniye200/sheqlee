import { records } from "./recordService";
import { createStorage } from "./storageService";

const sessionStore = createStorage(() => window.sessionStorage);
const demoIds = ["demo-owner", "demo-admin", "demo-user"];
const passwordOverrides = new Map();
const findDemo = (email) => records.users.all().find((entry) => demoIds.includes(entry.id) && entry.email?.toLowerCase() === email.trim().toLowerCase() && entry.status === "Active");

export const auth = {
  current() {
    const { value } = sessionStore.read("session", "", (id) => demoIds.includes(id), { initialize: false });
    const user = records.users.find(value);
    return user?.status === "Active" ? user : null;
  },
  signIn(email, password) {
    const user = findDemo(email);
    if (!user || password !== (passwordOverrides.get(user.id) || "password123")) throw new Error("Incorrect demo email or password.");
    sessionStore.write("session", user.id);
  },
  signOut() {
    sessionStore.write("session", "");
  },
  reset(email, code, password, confirmation) {
    const user = findDemo(email);
    if (!user) throw new Error("Enter an active demo account email.");
    if (code !== "272025") throw new Error("Enter demo code 272025.");
    if (password.length < 8 || password !== confirmation) throw new Error("Enter a matching demo password of at least eight characters.");
    passwordOverrides.set(user.id, password);
  },
  canEdit(user, module) {
    return user.role === "Super Admin" || (user.role === "Admin" && module !== "users") || module === "profiles";
  },
};

