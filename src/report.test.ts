import { reportHtml, reportText, weekday } from "./report";
import { makeDiaryRecord } from "./diary";
const report = {
  name: "João <teste>",
  title: "Outubro de 2026",
  all: false,
  records: [
    {
      ...makeDiaryRecord("2026-10-05", 15000),
      note: "Obra A & B\nConcretagem",
    },
    makeDiaryRecord("2026-10-04", 15000, "absence"),
  ],
  payments: [
    {
      id: "p",
      date: "2026-10-06",
      amountCents: 5000,
      kind: "advance" as const,
      note: "Dinheiro",
    },
  ],
};
test("weekday uses the actual local calendar date", () =>
  expect(weekday("2026-10-05")).toBe("segunda-feira"));
test("detailed text keeps notes, ordered dates and payments", () => {
  const text = reportText(report);
  expect(text).toContain("segunda-feira");
  expect(text).toContain("Concretagem");
  expect(text).toContain("Adiantamento recebido");
  expect(text.indexOf("04/10/2026")).toBeLessThan(text.indexOf("05/10/2026"));
  expect(text).toContain("100,00");
});
test("PDF escapes user content and includes every record", () => {
  const html = reportHtml(report);
  expect(html).toContain("João &lt;teste&gt;");
  expect(html).toContain("Obra A &amp; B");
  expect(html).toContain("Falta");
  expect(html).toContain("Concretagem");
  expect(html).toContain("segunda-feira");
});
