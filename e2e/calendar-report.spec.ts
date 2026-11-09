import { test, expect } from "@playwright/test";
test("calendário distingue faltas, meias e completas e preserva referência", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "@minhas-diarias/v2",
      JSON.stringify({
        version: 2,
        settings: {
          name: "João",
          defaultAmountCents: 12000,
          accessibilityMode: false,
        },
        payments: [],
        records: [
          {
            id: "2026-10-05",
            date: "2026-10-05",
            type: "full",
            amountCents: 12000,
            note: "Concretagem na obra",
            createdAt: "2026-10-05T12:00:00Z",
          },
          {
            id: "2026-10-06",
            date: "2026-10-06",
            type: "half",
            amountCents: 6000,
            createdAt: "2026-10-06T12:00:00Z",
          },
          {
            id: "2026-10-07",
            date: "2026-10-07",
            type: "absence",
            amountCents: 0,
            createdAt: "2026-10-07T12:00:00Z",
          },
        ],
      }),
    ),
  );
  await page.reload();
  await page
    .getByRole("button", { name: "+ Outra diária", exact: true })
    .click();
  await page
    .getByLabel("Data (dia/mês/ano)", { exact: true })
    .fill("05/10/2026");
  await page.getByRole("button", { name: "Escolher no calendário" }).click();
  const full = page.getByRole("button", {
    name: "05/10/2026, Diária completa, Concretagem na obra",
    exact: true,
  });
  await expect(full).toHaveCSS("background-color", "rgb(217, 245, 229)");
  await expect(
    page.getByRole("button", { name: "06/10/2026, Meia diária", exact: true }),
  ).toHaveCSS("background-color", "rgb(255, 240, 194)");
  await expect(
    page.getByRole("button", { name: "07/10/2026, Falta", exact: true }),
  ).toHaveCSS("background-color", "rgb(255, 224, 228)");
  await full.click();
  await expect(page.getByText("segunda-feira, 5 de outubro")).toBeVisible();
  await page.goto("/summary");
  await expect(page.getByText("segunda-feira", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Compartilhar PDF", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Concretagem na obra")).toBeVisible();
});
