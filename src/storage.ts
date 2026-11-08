import {
  DiaryData,
  emptyData,
  migrateLegacy,
  STORAGE_KEYS,
  validateData,
} from "./diary";
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export async function loadData(storage: Storage): Promise<DiaryData> {
  const current = await storage.getItem(STORAGE_KEYS.data);
  if (current !== null) return validateData(JSON.parse(current));
  const [records, settings] = await Promise.all([
    storage.getItem(STORAGE_KEYS.records),
    storage.getItem(STORAGE_KEYS.settings),
  ]);
  const data =
    records !== null || settings !== null
      ? migrateLegacy(
          records === null ? null : JSON.parse(records),
          settings === null ? null : JSON.parse(settings),
        )
      : emptyData();
  await storage.setItem(STORAGE_KEYS.data, JSON.stringify(data));
  return data;
}
export function createWriter(
  storage: Storage,
  initial: DiaryData,
  publish: (data: DiaryData) => void,
) {
  let current = initial;
  let queue: Promise<unknown> = Promise.resolve();
  return (change: (data: DiaryData) => DiaryData): Promise<DiaryData> => {
    const task = queue.then(async () => {
      const next = validateData(change(current));
      await storage.setItem(STORAGE_KEYS.recovery, JSON.stringify(current));
      await storage.setItem(STORAGE_KEYS.data, JSON.stringify(next));
      current = next;
      publish(next);
      return next;
    });
    queue = task.catch(() => undefined);
    return task;
  };
}
