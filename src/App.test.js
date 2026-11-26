import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";
import { auth } from "./services/authService";

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});

test("redirects to login, restores the intended route and persists a job after remount", async () => {
  window.history.replaceState({}, "", "/side-bar/job-posts");
  const view = render(<App />);
  await screen.findByRole("heading", { name: "Log in" });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
  fireEvent.click(screen.getByRole("button", { name: "Log in" }));
  expect(await screen.findByRole("heading", { name: "Job Posts" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Add Job post" }));
  const editor = within(screen.getByRole("dialog", { name: "Add Job post" }));
  const fields = { Title: "Accessibility Engineer", Company: "CO-1", Category: "CAT-1", "Job type": "Contract", "Skill level": "Senior", Status: "Open" };
  Object.entries(fields).forEach(([label, value]) => fireEvent.change(editor.getByLabelText(label), { target: { value } }));
  fireEvent.click(editor.getByRole("button", { name: "Save" }));
  expect(await screen.findByText("Job post saved.")).toBeInTheDocument();
  view.unmount();

  render(<App />);
  const row = await screen.findByRole("row", { name: /Accessibility Engineer/ });
  fireEvent.click(within(row).getByRole("button", { name: "Delete" }));
  fireEvent.click(within(screen.getByRole("dialog", { name: "Delete Job post?" })).getByRole("button", { name: "Delete" }));
  expect(screen.queryByRole("row", { name: /Accessibility Engineer/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Log out" }));
  expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
});

test("restricts viewer actions and user management", async () => {
  auth.signIn("viewer@example.com", "password123");
  window.history.replaceState({}, "", "/admin/users");
  render(<App />);
  expect(await screen.findByRole("heading", { name: "Job Posts dashboard" })).toBeInTheDocument();
  fireEvent.click(within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("link", { name: "Job Posts" }));
  expect(await screen.findByRole("heading", { name: "Job Posts" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Add Job post" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
});
