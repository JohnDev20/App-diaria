import { test, expect } from "@playwright/test";
test("registro, edição, recebimento, persistência e exclusão", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Marcar diária de hoje" }).click();
  await expect(page.getByText("Registro salvo neste aparelho.")).toBeVisible();
  await page.getByRole("button", { name: "Revisar registro de hoje" }).click();
  await page
    .getByLabel("Valor deste registro (R$)", { exact: true })
    .fill("150,01");
  await page.getByLabel("Observação (opcional)").fill("Obra teste");
  await page
    .getByRole("button", { name: "Salvar diária", exact: true })
    .click();
  await expect(page.getByText("Obra teste")).toBeVisible();
  await page.getByRole("button", { name: "Recebimento", exact: true }).click();
  await page.getByLabel("Valor recebido (R$)", { exact: true }).fill("50,00");
  await page.getByRole("button", { name: "Salvar recebimento" }).click();
  await expect(page.getByText(/100,01/).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText(/100,01/).first()).toBeVisible();
  await page.getByRole("button", { name: "Revisar registro de hoje" }).click();
  await page
    .getByRole("button", { name: "Excluir registro", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(
    page.getByLabel("Valor deste registro (R$)", { exact: true }),
  ).toHaveValue("150,01");
  await page
    .getByRole("button", { name: "Excluir registro", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(page.getByText("ADIANTAMENTO DISPONÍVEL")).toBeVisible();
});
test("data anterior, duplicata e validação monetária", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "+ Outra diária", exact: true })
    .click();
  await page
    .getByLabel("Data (dia/mês/ano)", { exact: true })
    .fill("01/01/2026");
  await page.getByLabel("Valor deste registro (R$)", { exact: true }).fill("");
  await page
    .getByRole("button", { name: "Salvar diária", exact: true })
    .click();
  await expect(
    page.getByText("Informe um valor válido, como 150,00."),
  ).toBeVisible();
  await page
    .getByLabel("Valor deste registro (R$)", { exact: true })
    .fill("120,01");
  await page
    .getByRole("button", { name: "Salvar diária", exact: true })
    .click();
  await page
    .getByRole("button", { name: "+ Outra diária", exact: true })
    .click();
  await page
    .getByLabel("Data (dia/mês/ano)", { exact: true })
    .fill("01/01/2026");
  await page
    .getByRole("button", { name: "Salvar diária", exact: true })
    .click();
  await expect(page.getByText("Substituir registro?")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
});
test("modo fácil na abertura e recuperação de dados corrompidos", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "@minhas-diarias/v2",
      JSON.stringify({
        version: 2,
        records: [],
        payments: [],
        settings: {
          name: "João",
          defaultAmountCents: 12000,
          accessibilityMode: true,
        },
      }),
    ),
  );
  await page.reload();
  await expect(page.getByText("Seu dia, bem simples")).toBeVisible();
  await page.getByRole("button", { name: "Marcar diária de hoje" }).click();
  await expect(page.getByText("Tudo certo!")).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("@minhas-diarias/v2", "corrompido"),
  );
  await page.reload();
  await expect(page.getByText("Vamos proteger seus dados")).toBeVisible();
  await page.getByRole("button", { name: "Recuperar cópia anterior" }).click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(page.getByText("Seu dia, bem simples")).toBeVisible();
});

test("backup exportado pode ser restaurado e arquivo inválido é rejeitado", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Marcar diária de hoje" }).click();
  await page.getByRole("tab", { name: "Ajustes" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar backup", exact: true })
    .click();
  const download = await downloadPromise;
  const file = await download.path();
  await page.getByRole("tab", { name: "Início" }).click();
  await page.getByRole("button", { name: "Revisar registro de hoje" }).click();
  await page
    .getByRole("button", { name: "Excluir registro", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await page.getByRole("tab", { name: "Ajustes" }).click();
  const chooserPromise = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Restaurar backup", exact: true })
    .click();
  await (await chooserPromise).setFiles(file!);
  await expect(page.getByText("Restaurar este backup?")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(page.getByText("Backup restaurado com sucesso.")).toBeVisible();
  await page.getByRole("tab", { name: "Início" }).click();
  await expect(page.getByText("Registro salvo neste aparelho.")).toBeVisible();
  await page.getByRole("tab", { name: "Ajustes" }).click();
  const invalid = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Restaurar backup", exact: true })
    .click();
  await (
    await invalid
  ).setFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByText(/Backup inválido/).first()).toBeVisible();
});
test("calendário e tela estreita não criam rolagem horizontal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "+ Outra diária", exact: true })
    .click();
  await page.getByRole("button", { name: "Escolher no calendário" }).click();
  await page.getByRole("button", { name: "Hoje", exact: true }).click();
  await expect(
    page.getByLabel("Data (dia/mês/ano)", { exact: true }),
  ).toHaveValue(/\d{2}\/\d{2}\/\d{4}/);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test("corrigir a data move o registro sem duplicar o valor", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Marcar diária de hoje" }).click();
  await page.getByRole("button", { name: "Revisar registro de hoje" }).click();
  await page
    .getByLabel("Data (dia/mês/ano)", { exact: true })
    .fill("02/01/2026");
  await page
    .getByRole("button", { name: "Salvar diária", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Marcar diária de hoje" }),
  ).toBeVisible();
  const records = await page.evaluate(
    () => JSON.parse(localStorage.getItem("@minhas-diarias/v2")!).records,
  );
  expect(records).toHaveLength(1);
  expect(records[0].date).toBe("2026-01-02");
  expect(records[0].amountCents).toBe(12000);
});
