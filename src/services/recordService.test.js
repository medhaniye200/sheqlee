import { modules } from "../constants/modules";
import { createRecordServices } from "./recordService";
import { createStorage, storageKey } from "./storageService";
import { queryRecords } from "../utils/queryRecords";

beforeEach(() => window.localStorage.clear());

test.each(Object.keys(modules))("%s can save, reload, update and remove a record", (key) => {
  const service = createRecordServices()[key];
  const example = service.all()[0] || { name: "Demo Profile", email: "profile@example.com" };
  const input = { ...example };
  const unique = modules[key].unique;
  if (unique) input[unique] = unique === "email" ? "new@example.com" : "Another title";
  const created = service.save(input);
  expect(created.id).toBeTruthy();
  const reloaded = createRecordServices()[key];
  expect(reloaded.find(created.id)).toEqual(created);
  const firstField = modules[key].fields.find((field) => !field.relation).key;
  const updated = reloaded.save({ ...input, [firstField]: firstField === "email" ? "changed@example.com" : "Updated sample" }, created.id);
  expect(updated[firstField]).not.toBe(created[firstField]);
  expect(updated.createdAt).toBe(created.createdAt);
  reloaded.remove(created.id);
  expect(createRecordServices()[key].find(created.id)).toBeUndefined();
});

test("seeds missing collections only and keeps a deliberately empty collection", () => {
  const service = createRecordServices().notifications;
  expect(service.all()).toHaveLength(1);
  service.remove(service.all()[0].id);
  expect(createRecordServices().notifications.all()).toEqual([]);
});

test("reports unreadable storage without replacing it during reads", () => {
  window.localStorage.setItem(storageKey("jobs"), "{");
  expect(createRecordServices().jobs.read()).toEqual({ value: [], warning: expect.any(String) });
  expect(window.localStorage.getItem(storageKey("jobs"))).toBe("{");
});

test("keeps valid rows when stored data is partially invalid", () => {
  const service = createRecordServices().categories;
  const rows = service.all();
  window.localStorage.setItem(storageKey("categories"), JSON.stringify([...rows, { id: "broken" }]));
  expect(service.read()).toEqual({ value: rows, warning: expect.any(String) });
});

test("rejects invalid records, duplicates and deletion of referenced parents", () => {
  const services = createRecordServices();
  expect(() => services.faqs.save({ question: "  " })).toThrow("Question is required");
  expect(() => services.categories.save({ title: "design" })).toThrow("already exists");
  expect(() => services.jobs.save({ ...services.jobs.all()[0], link: "javascript:alert(1)" })).toThrow("HTTP");
  expect(() => services.jobs.remove("JOB-1")).toThrow("applicants");
  expect(() => services.companies.save({ name: "Demo", email: "bad", status: "Active" })).toThrow("email");
});

test("reports write failures", () => {
  const store = createStorage(() => ({ getItem: () => "[]", setItem: () => { throw new Error("Quota"); } }));
  expect(() => createRecordServices(store).tags.save({ title: "Demo" })).toThrow("unavailable or full");
});

test("composes text search, date and status filters, sorting and pagination", () => {
  const data = [
    { id: "1", title: "Design 10", status: "Open", createdAt: "2025-02-27" },
    { id: "2", title: "Design 2", status: "Open", createdAt: "2025-02-27" },
    { id: "3", title: "Design 1", status: "Closed", createdAt: "2025-02-28" },
    { id: "4", title: "Design 3", status: "Open", createdAt: "2025-03-01" },
  ];
  const options = { search: "DESIGN", filters: { status: "Open" }, to: "2025-02-28", sort: "title", descending: false, size: 1 };
  expect(queryRecords(data, options)).toMatchObject({ total: 2, pages: 2, items: [data[1]] });
  expect(queryRecords(data, { ...options, page: 8 })).toMatchObject({ page: 2, items: [data[0]] });
  expect(queryRecords(data, { search: "missing" }).items).toEqual([]);
});
