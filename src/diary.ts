export type DiaryType = "full" | "half" | "absence";
export type DiaryRecord = {
  id: string;
  date: string;
  type: DiaryType;
  amountCents: number;
  note?: string;
  createdAt: string;
};
export type Payment = {
  id: string;
  date: string;
  amountCents: number;
  note?: string;
  kind: "payment" | "advance";
};
export type DiarySettings = {
  defaultAmountCents: number;
  name: string;
  accessibilityMode: boolean;
};
export type DiaryData = {
  version: 2;
  records: DiaryRecord[];
  payments: Payment[];
  settings: DiarySettings;
};
export const DEFAULT_SETTINGS: DiarySettings = {
  defaultAmountCents: 12000,
  name: "",
  accessibilityMode: false,
};
export const STORAGE_KEYS = {
  data: "@minhas-diarias/v2",
  recovery: "@minhas-diarias/recovery",
  records: "@minhas-diarias/records",
  settings: "@minhas-diarias/settings",
};
export const emptyData = (): DiaryData => ({
  version: 2,
  records: [],
  payments: [],
  settings: { ...DEFAULT_SETTINGS },
});
export function toDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
export function validDate(key: unknown): key is string {
  return (
    typeof key === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(key) &&
    Number(key.slice(0, 4)) >= 1900 &&
    Number(key.slice(0, 4)) <= 2200 &&
    toDateKey(dateFromKey(key)) === key
  );
}
export function parseDate(input: string): string {
  const parts = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const key = parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : input.trim();
  if (!validDate(key)) throw new Error("Informe uma data válida: dia/mês/ano.");
  if (key > toDateKey()) throw new Error("Escolha hoje ou uma data anterior.");
  return key;
}
export function formatDate(key: string): string {
  return key.split("-").reverse().join("/");
}
export function formatLongDate(key: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dateFromKey(key));
}
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
export function moneyInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
export function parseMoney(input: string): number {
  let value = input.trim().replace(/^R\$\s*/, "");
  if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(value))
    value = value.replace(/\./g, "");
  if (!/^\d+([,.]\d{1,2})?$/.test(value))
    throw new Error("Informe um valor válido, como 150,00.");
  const [whole, fraction = ""] = value.replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 100000000)
    throw new Error("O valor máximo é R$ 1.000.000,00.");
  return cents;
}
export function typeLabel(type: DiaryType): string {
  return type === "half"
    ? "Meia diária"
    : type === "absence"
      ? "Falta"
      : "Diária completa";
}
export function amountForType(cents: number, type: DiaryType): number {
  return type === "half"
    ? Math.round(cents / 2)
    : type === "absence"
      ? 0
      : cents;
}
export function makeDiaryRecord(
  date: string,
  cents: number,
  type: DiaryType = "full",
): DiaryRecord {
  return {
    id: date,
    date,
    type,
    amountCents: amountForType(cents, type),
    createdAt: new Date().toISOString(),
  };
}
export function totals(records: DiaryRecord[], payments: Payment[]) {
  const earned = records.reduce((s, r) => s + r.amountCents, 0);
  const received = payments.reduce((s, p) => s + p.amountCents, 0);
  return {
    earned,
    received,
    balance: earned - received,
    full: records.filter((r) => r.type === "full").length,
    half: records.filter((r) => r.type === "half").length,
    absences: records.filter((r) => r.type === "absence").length,
  };
}
function object(value: unknown): Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Arquivo de dados inválido.");
  return value as Record<string, any>;
}
function cents(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > 100000000
  )
    throw new Error("Valor inválido nos dados.");
  return value;
}
function string(value: unknown, max: number): string {
  if (typeof value !== "string" || value.length > max)
    throw new Error("Texto inválido nos dados.");
  return value;
}
export function validateData(raw: unknown): DiaryData {
  const d = object(raw),
    s = object(d.settings);
  if (
    d.version !== 2 ||
    !Array.isArray(d.records) ||
    !Array.isArray(d.payments) ||
    d.records.length > 100000 ||
    d.payments.length > 100000
  )
    throw new Error("Formato de backup não suportado.");
  if (typeof s.accessibilityMode !== "boolean")
    throw new Error("Configuração inválida.");
  const records: DiaryRecord[] = d.records.map((value: unknown) => {
    const r = object(value);
    if (
      !validDate(r.date) ||
      !["full", "half", "absence"].includes(r.type) ||
      !Number.isFinite(Date.parse(r.createdAt))
    )
      throw new Error("Diária inválida no arquivo.");
    const amount = cents(r.amountCents);
    if (r.type === "absence" && amount !== 0)
      throw new Error("Faltas devem ter valor zero.");
    return {
      id: r.date,
      date: r.date,
      type: r.type,
      amountCents: amount,
      createdAt: r.createdAt,
      note: r.note === undefined ? undefined : string(r.note, 1000),
    };
  });
  const payments: Payment[] = d.payments.map((value: unknown) => {
    const p = object(value);
    if (
      !validDate(p.date) ||
      !["payment", "advance"].includes(p.kind) ||
      cents(p.amountCents) === 0
    )
      throw new Error("Recebimento inválido no arquivo.");
    return {
      id: string(p.id, 150),
      date: p.date,
      kind: p.kind,
      amountCents: p.amountCents,
      note: p.note === undefined ? undefined : string(p.note, 1000),
    };
  });
  if (
    new Set(records.map((r) => r.date)).size !== records.length ||
    new Set(payments.map((p) => p.id)).size !== payments.length
  )
    throw new Error("O arquivo contém registros duplicados.");
  return {
    version: 2,
    records: records.sort((a, b) => b.date.localeCompare(a.date)),
    payments: payments.sort((a, b) => b.date.localeCompare(a.date)),
    settings: {
      defaultAmountCents: cents(s.defaultAmountCents),
      name: string(s.name, 100),
      accessibilityMode: s.accessibilityMode,
    },
  };
}
export function migrateLegacy(records: unknown, settings: unknown): DiaryData {
  const s = settings == null ? {} : object(settings);
  if (records != null && !Array.isArray(records))
    throw new Error("Histórico antigo inválido.");
  const converted = (records ?? []) as any[];
  return validateData({
    version: 2,
    records: converted.map((r) => ({
      ...r,
      amountCents:
        typeof r.amount === "number" ? Math.round(r.amount * 100) : NaN,
    })),
    payments: [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...s,
      defaultAmountCents:
        s.defaultAmount === undefined
          ? 12000
          : typeof s.defaultAmount === "number"
            ? Math.round(s.defaultAmount * 100)
            : NaN,
    },
  });
}
export function upsertRecord(
  data: DiaryData,
  record: DiaryRecord,
  replace = false,
): DiaryData {
  if (!replace && data.records.some((r) => r.date === record.date))
    throw new Error(
      "Já existe um registro nesta data. Confirme a substituição.",
    );
  return validateData({
    ...data,
    records: [...data.records.filter((r) => r.date !== record.date), record],
  });
}
export function parseBackup(text: string): DiaryData {
  if (text.length > 10000000) throw new Error("Backup muito grande.");
  return validateData(JSON.parse(text));
}
