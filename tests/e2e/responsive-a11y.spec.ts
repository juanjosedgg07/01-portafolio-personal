import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGINAS = [
  { ruta: "/", nombre: "portada" },
  { ruta: "/proyectos/portafolio-personal", nombre: "detalle" },
  { ruta: "/contacto", nombre: "contacto" },
  { ruta: "/login", nombre: "login" },
  { ruta: "/proyectos/no-existe", nombre: "404" },
];

for (const { ruta, nombre } of PAGINAS) {
  test(`${nombre}: sin scroll horizontal, un solo h1 y 0 violaciones de axe`, async ({ page }, info) => {
    // Movimiento reducido: la animación de «revelar» no oculta contenido en las capturas de evidencia.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");

    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(desborde, "no debe haber desplazamiento horizontal").toBeLessThanOrEqual(0);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    // A partir de 768 px la navegación es visible y el botón «Menú» no.
    const menu = page.getByRole("button", { name: "Menú" });
    if ((page.viewportSize()?.width ?? 0) >= 768) await expect(menu).toBeHidden();
    else await expect(menu).toBeVisible();

    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);

    // Recorre la página para que IntersectionObserver revele las secciones antes de capturar.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `calidad/capturas/${nombre}-${info.project.name}.png`, fullPage: true });
  });
}

test("el enlace «Saltar al contenido» es lo primero al tabular y mueve el foco", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const saltar = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(saltar).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#contenido")).toBeFocused();
});

test("el formulario de contacto anuncia el error de correo junto al campo", async ({ page }) => {
  await page.goto("/contacto");
  await page.getByLabel("Nombre").fill("Ana Pérez");
  await page.getByLabel("Correo electrónico").fill("ana@");
  await page.getByLabel("Mensaje").fill("Un mensaje suficientemente largo.");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  const correo = page.getByLabel("Correo electrónico");
  await expect(correo).toHaveAttribute("aria-invalid", "true");
  await expect(correo).toBeFocused();
  await expect(page.getByText(/Escriba un correo válido/)).toBeVisible();
});

test("sin sesión, /admin redirige al login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?volver=%2Fadmin/);
});

for (const tema of ["claro", "oscuro", "oceano", "arena", "contraste"]) {
  test(`tema ${tema}: 0 violaciones de axe (incluido contraste) en portada y contacto`, async ({ page }, info) => {
    test.skip(info.project.name !== "escritorio-1024", "basta con un ancho por tema");
    await page.addInitScript((t) => localStorage.setItem("tema", t), tema);
    for (const ruta of ["/", "/contacto", "/proyectos"]) {
      await page.goto(ruta);
      await expect(page.locator("html")).toHaveAttribute("data-theme", tema);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(axe.violations.map((v) => `${ruta} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    }
    await page.goto("/");
    await page.screenshot({ path: `calidad/capturas/tema-${tema}.png` });
  });
}
