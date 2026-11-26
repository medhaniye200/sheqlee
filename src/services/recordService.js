import { modules } from "../constants/modules";
import { seedData } from "../data/seedData";
import { storage } from "./storageService";
import { validateRecord } from "../utils/validation";

const seedDate = "2025-02-27T12:00:00.000Z";

export function createRecordServices(store = storage) {
  const services = {};

  Object.entries(modules).forEach(([key, schema]) => {
    const seed = seedData[key].map(({ id, ...fields }, index) => ({
      ...fields, id: id || schema.prefix + "-" + (index + 1), createdAt: seedDate, updatedAt: seedDate,
    }));
    const valid = (records) => Array.isArray(records) && records.every((record) =>
      record && typeof record.id === "string" && typeof record.createdAt === "string" && Number.isFinite(Date.parse(record.createdAt)) &&
      typeof record.updatedAt === "string" && Number.isFinite(Date.parse(record.updatedAt)) &&
      schema.fields.every(({ key: field }) => record[field] === undefined || typeof record[field] === "string")
    );
    const read = () => store.read(key, seed, valid);
    const all = () => read().value;
    const find = (id) => all().find((record) => record.id === id);

    function save(input, id, assignedId) {
      const records = all();
      const current = records.find((record) => record.id === id);
      if (assignedId && records.some((entry) => entry.id === assignedId && entry.id !== id)) throw new Error("This profile already exists. Reopen the editor.");
      if (id && !current) throw new Error("This record no longer exists.");
      const value = validateRecord(schema, input, records, id, services);
      const now = new Date().toISOString();
      const record = {
        ...value,
        id: current?.id || assignedId || schema.prefix + "-" + (window.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2)),
        createdAt: current?.createdAt || now,
        updatedAt: now,
      };
      store.write(key, current ? records.map((entry) => entry.id === id ? record : entry) : [...records, record]);
      return record;
    }

    function remove(id) {
      const records = all();
      if (!records.some((record) => record.id === id)) throw new Error("This record no longer exists.");
      const dependent = Object.entries(modules).find(([other, definition]) =>
        definition.fields.some((field) => field.relation === key && services[other].all().some((record) => record[field.key] === id))
      );
      if (dependent) throw new Error("This record is still referenced by " + dependent[1].label.toLowerCase() + ".");
      store.write(key, records.filter((record) => record.id !== id));
    }

    services[key] = { read, all, find, save, remove };
  });
  return services;
}

export const records = createRecordServices();


