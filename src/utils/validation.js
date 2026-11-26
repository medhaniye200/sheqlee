const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRecord(schema, input, records, id, services) {
  const value = {};
  schema.fields.forEach(({ key, label, optional, choices, relation, type, multiline }) => {
    const item = String(input[key] ?? "").trim();
    if (!item && !optional) throw new Error(label + " is required.");
    if (item.length > (multiline ? 5000 : 250)) throw new Error(label + " is too long.");
    if (item && type === "email" && !emailPattern.test(item)) throw new Error("Enter a valid email address.");
    if (item && type === "url") {
      try {
        if (!["https:", "http:"].includes(new URL(item).protocol)) throw new Error();
      } catch {
        throw new Error("Enter an HTTP or HTTPS URL.");
      }
    }
    if (choices && !choices.includes(item)) throw new Error("Select a valid " + label.toLowerCase() + ".");
    if (item && relation && !services[relation].find(item)) throw new Error("Select an existing " + label.toLowerCase() + ".");
    value[key] = item;
  });
  const unique = schema.unique;
  if (unique && records.some((record) => record.id !== id && record[unique]?.toLowerCase() === value[unique].toLowerCase())) {
    throw new Error("A record with this " + unique + " already exists.");
  }
  if (value.status === "Deleted" && "reason" in value && !value.reason) {
    throw new Error("Enter a deletion reason.");
  }
  return value;
}
