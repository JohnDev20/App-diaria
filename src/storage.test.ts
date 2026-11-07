import { createWriter, loadData } from "./storage";
import {
  emptyData,
  makeDiaryRecord,
  STORAGE_KEYS,
  upsertRecord,
} from "./diary";
function memory() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
  };
}
test("só publica depois de gravar", async () => {
  const storage = memory(),
    publish = jest.fn();
  storage.setItem.mockImplementation(async () => {
    expect(publish).not.toHaveBeenCalled();
  });
  await createWriter(
    storage,
    emptyData(),
    publish,
  )((d) => upsertRecord(d, makeDiaryRecord("2026-01-01", 10000)));
  expect(publish).toHaveBeenCalledTimes(1);
});
test("falha de gravação não altera estado e não bloqueia próxima tentativa", async () => {
  const storage = memory(),
    publish = jest.fn(),
    write = createWriter(storage, emptyData(), publish);
  storage.setItem.mockRejectedValueOnce(new Error("disco cheio"));
  await expect(
    write((d) => upsertRecord(d, makeDiaryRecord("2026-01-01", 10000))),
  ).rejects.toThrow();
  expect(publish).not.toHaveBeenCalled();
  await write((d) => upsertRecord(d, makeDiaryRecord("2026-01-02", 20000)));
  expect(publish.mock.calls[0][0].records).toHaveLength(1);
});
test("falha no snapshot principal mantém cópia anterior", async () => {
  const storage = memory(),
    publish = jest.fn();
  storage.setItem.mockImplementation(async (key, value) => {
    if (key === STORAGE_KEYS.data) throw new Error("falhou");
    storage.values.set(key, value);
  });
  await expect(
    createWriter(
      storage,
      emptyData(),
      publish,
    )((d) => upsertRecord(d, makeDiaryRecord("2026-01-01", 10000))),
  ).rejects.toThrow();
  expect(publish).not.toHaveBeenCalled();
  expect(JSON.parse(storage.values.get(STORAGE_KEYS.recovery)!)).toEqual(
    emptyData(),
  );
});
test("serializa gravações concorrentes sem perder registros", async () => {
  const storage = memory(),
    publish = jest.fn(),
    write = createWriter(storage, emptyData(), publish);
  await Promise.all([
    write((d) => upsertRecord(d, makeDiaryRecord("2026-01-01", 10000))),
    write((d) => upsertRecord(d, makeDiaryRecord("2026-01-02", 20000))),
  ]);
  expect(
    JSON.parse(storage.values.get(STORAGE_KEYS.data)!).records,
  ).toHaveLength(2);
  expect(
    JSON.parse(storage.values.get(STORAGE_KEYS.recovery)!).records,
  ).toHaveLength(1);
});
test("reabre dados persistidos", async () => {
  const storage = memory();
  await createWriter(storage, emptyData(), () => {})((d) =>
    upsertRecord(d, makeDiaryRecord("2026-01-01", 10000)),
  );
  expect((await loadData(storage)).records[0].amountCents).toBe(10000);
});
test("migração preserva as chaves antigas", async () => {
  const storage = memory();
  storage.values.set(STORAGE_KEYS.records, "[]");
  storage.values.set(STORAGE_KEYS.settings, '{"defaultAmount":150}');
  expect((await loadData(storage)).settings.defaultAmountCents).toBe(15000);
  expect(storage.values.get(STORAGE_KEYS.settings)).toBe(
    '{"defaultAmount":150}',
  );
});
test("dados corrompidos bloqueiam carregamento sem sobrescrever", async () => {
  const storage = memory();
  storage.values.set(STORAGE_KEYS.data, "inválido");
  await expect(loadData(storage)).rejects.toThrow();
  expect(storage.setItem).not.toHaveBeenCalled();
});
