import {
  amountForType,
  emptyData,
  formatCurrency,
  makeDiaryRecord,
  migrateLegacy,
  parseBackup,
  parseDate,
  parseMoney,
  totals,
  upsertRecord,
  validateData,
} from "./diary";
describe("dinheiro e datas", () => {
  test.each([
    ["120,01", 12001],
    ["1.234,56", 123456],
    ["120.50", 12050],
    ["0", 0],
  ])("converte %s sem perder centavos", (input, expected) =>
    expect(parseMoney(input)).toBe(expected),
  );
  test.each(["", "-1", "1,999", "abc", "1.000", "Infinity", "1000001"])(
    "rejeita valor inválido %s",
    (input) => expect(() => parseMoney(input)).toThrow(),
  );
  test("arredonda meia diária antes da soma", () => {
    expect(amountForType(12001, "half")).toBe(6001);
    expect(
      totals(
        [
          makeDiaryRecord("2026-01-01", 12001, "half"),
          makeDiaryRecord("2026-01-02", 12001, "half"),
        ],
        [],
      ).earned,
    ).toBe(12002);
    expect(formatCurrency(12002)).toContain("120,02");
  });
  test("falta tem valor zero", () =>
    expect(amountForType(12000, "absence")).toBe(0));
  test("data bissexta e dia inexistente", () => {
    expect(parseDate("29/02/2024")).toBe("2024-02-29");
    expect(() => parseDate("29/02/2025")).toThrow();
    expect(() => parseDate("31/04/2026")).toThrow();
    expect(() => parseDate("01/01/2200")).toThrow();
  });
});
describe("histórico e backup", () => {
  test("migra dados existentes e preserva observação", () => {
    const d = migrateLegacy(
      [
        {
          id: "old",
          date: "2026-01-01",
          type: "full",
          amount: 150.25,
          note: "Obra",
          createdAt: "2026-01-01T12:00:00Z",
        },
      ],
      { defaultAmount: 175, name: "João", accessibilityMode: true },
    );
    expect(d.records[0].amountCents).toBe(15025);
    expect(d.records[0].note).toBe("Obra");
    expect(d.settings.defaultAmountCents).toBe(17500);
  });
  test("não transforma dados antigos corrompidos em histórico vazio", () =>
    expect(() => migrateLegacy({}, {})).toThrow());
  test("exige confirmação para substituir", () => {
    const d = upsertRecord(emptyData(), makeDiaryRecord("2026-01-01", 12000));
    expect(() =>
      upsertRecord(d, makeDiaryRecord("2026-01-01", 12000, "absence")),
    ).toThrow();
    expect(
      upsertRecord(d, makeDiaryRecord("2026-01-01", 12000, "absence"), true)
        .records[0].amountCents,
    ).toBe(0);
  });
  test("não recalcula registros ao mudar padrão", () => {
    const d = upsertRecord(emptyData(), makeDiaryRecord("2026-01-01", 12000));
    d.settings.defaultAmountCents = 20000;
    expect(d.records[0].amountCents).toBe(12000);
  });
  test("pagamentos e adiantamentos compõem saldo e faltas ficam separadas", () => {
    const t = totals(
      [
        makeDiaryRecord("2026-01-01", 12000),
        makeDiaryRecord("2026-01-02", 12000, "half"),
        makeDiaryRecord("2026-01-03", 12000, "absence"),
      ],
      [{ id: "1", date: "2026-01-01", amountCents: 20000, kind: "advance" }],
    );
    expect(t).toEqual({
      earned: 18000,
      received: 20000,
      balance: -2000,
      full: 1,
      half: 1,
      absences: 1,
    });
  });
  test("backup faz round trip", () => {
    const d = upsertRecord(emptyData(), makeDiaryRecord("2026-01-01", 12345));
    expect(parseBackup(JSON.stringify(d))).toEqual(d);
  });
  test("rejeita schema, datas, valores e duplicatas inválidos", () => {
    const d = upsertRecord(emptyData(), makeDiaryRecord("2026-01-01", 12000));
    expect(() => validateData({ ...d, version: 3 })).toThrow();
    expect(() =>
      validateData({ ...d, records: [...d.records, ...d.records] }),
    ).toThrow();
    expect(() =>
      validateData({
        ...d,
        records: [{ ...d.records[0], date: "2026-02-30" }],
      }),
    ).toThrow();
    expect(() =>
      validateData({ ...d, records: [{ ...d.records[0], amountCents: 0.1 }] }),
    ).toThrow();
    expect(() => parseBackup("{")).toThrow();
  });
});
