import {
  DiaryRecord,
  Payment,
  formatCurrency,
  formatDate,
  dateFromKey,
  totals,
  typeLabel,
} from "./diary";
export function weekday(date: string) {
  return dateFromKey(date).toLocaleDateString("pt-BR", { weekday: "long" });
}
export type Report = {
  name: string;
  title: string;
  records: DiaryRecord[];
  payments: Payment[];
  all: boolean;
};
function entries(r: Report) {
  return [
    ...r.records.map((x) => ({ ...x, label: typeLabel(x.type) })),
    ...r.payments.map((x) => ({
      ...x,
      label:
        x.kind === "advance" ? "Adiantamento recebido" : "Pagamento recebido",
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));
}
export function reportText(r: Report) {
  const t = totals(r.records, r.payments);
  return [
    `Minhas Diárias${r.name ? ` — ${r.name}` : ""}`,
    r.title,
    "",
    ...entries(r).map(
      (x) =>
        `${formatDate(x.date)} · ${weekday(x.date)}\n${x.label} · ${formatCurrency(x.amountCents)}${x.note ? `\nObservação: ${x.note}` : ""}\n`,
    ),
    `${t.full} completas · ${t.half} meias · ${t.absences} faltas`,
    `Trabalho registrado: ${formatCurrency(t.earned)}`,
    `Recebido: ${formatCurrency(t.received)}`,
    `${r.all ? "Saldo geral" : "Resultado do período"}: ${formatCurrency(t.balance)}`,
    "Dias sem registro não são considerados faltas.",
  ].join("\n");
}
const escape = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function reportHtml(r: Report) {
  const t = totals(r.records, r.payments);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>@page{size:A4;margin:18mm}body{font-family:Arial,sans-serif;color:#172b4d;font-size:12px}h1{color:#245bd6}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{padding:10px 6px;border-bottom:1px solid #dce5f1;text-align:left;overflow-wrap:anywhere}th{background:#eaf0ff}thead{display:table-header-group}tr{break-inside:avoid}small{display:block;color:#52647d;margin-top:4px}.totals{margin-top:20px;padding:16px;background:#eaf0ff;break-inside:avoid}.note{white-space:pre-wrap;overflow-wrap:anywhere}</style></head><body><h1>Minhas Diárias</h1><p>${escape(r.name || "Relatório de diárias")}</p><h2>${escape(r.title)}</h2><table><thead><tr><th style="width:24%">Data</th><th style="width:24%">Registro</th><th style="width:18%">Valor</th><th>Observações / referência</th></tr></thead><tbody>${
    entries(r)
      .map(
        (x) =>
          `<tr><td>${formatDate(x.date)}<small>${weekday(x.date)}</small></td><td>${escape(x.label)}</td><td>${formatCurrency(x.amountCents)}</td><td class="note">${escape(x.note || "—")}</td></tr>`,
      )
      .join("") || '<tr><td colspan="4">Sem registros neste período.</td></tr>'
  }</tbody></table><div class="totals"><p>${t.full} completas · ${t.half} meias · ${t.absences} faltas</p><p>Trabalho registrado: <b>${formatCurrency(t.earned)}</b></p><p>Recebido: <b>${formatCurrency(t.received)}</b></p><p>${r.all ? "Saldo geral" : "Resultado do período"}: <b>${formatCurrency(t.balance)}</b></p></div><p>Dias sem registro não são considerados faltas. Confira as observações para lembrar a obra ou o serviço realizado.</p></body></html>`;
}
