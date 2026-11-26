export const storageKey = (key) => "sheqlee.v1." + key;

export function createStorage(getStorage = () => window.localStorage) {
  function write(key, value) {
    try {
      getStorage().setItem(storageKey(key), JSON.stringify(value));
    } catch {
      throw new Error("Browser storage is unavailable or full. Your changes were not saved.");
    }
  }

  function read(key, fallback, isValid, { initialize = true } = {}) {
    try {
      const raw = getStorage().getItem(storageKey(key));
      if (raw === null) {
        if (initialize) write(key, fallback);
        return { value: fallback };
      }
      const value = JSON.parse(raw);
      if (isValid(value)) return { value };
      if (Array.isArray(value) && Array.isArray(fallback)) {
        const valid = value.filter((record) => isValid([record]));
        return { value: valid, warning: "Some stored records are invalid. Saving will retain the valid records." };
      }
      return { value: Array.isArray(fallback) ? [] : fallback, warning: "Stored data is invalid. Saving will replace it." };
    } catch {
      return { value: Array.isArray(fallback) ? [] : fallback, warning: "Stored data could not be read. Check browser storage before saving." };
    }
  }
  return { read, write };
}

export const storage = createStorage();
