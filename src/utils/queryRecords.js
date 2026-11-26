export function queryRecords(records, { search = "", filters = {}, from = "", to = "", sort = "createdAt", descending = true, page = 1, size = 10, display = (record, key) => record[key] } = {}) {
  const term = search.trim().toLowerCase();
  const compare = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare;
  const matches = records.filter((record) => {
    const date = record.createdAt.slice(0, 10);
    return Object.entries(filters).every(([key, value]) => !value || record[key] === value) &&
      (!from || date >= from) && (!to || date <= to) &&
      (!term || Object.keys(record).some((key) => String(display(record, key) ?? "").toLowerCase().includes(term)));
  }).sort((a, b) => (descending ? -1 : 1) * compare(display(a, sort) ?? "", display(b, sort) ?? ""));
  const pages = Math.max(1, Math.ceil(matches.length / size));
  const current = Math.min(Math.max(page, 1), pages);
  return { items: matches.slice((current - 1) * size, current * size), total: matches.length, page: current, pages };
}
