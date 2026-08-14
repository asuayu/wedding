const { test, expect } = require("@playwright/test");

test("核心内容、图片和纪念计时正常加载", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("/");
  await expect(page).toHaveTitle(/双向奔赴/);
  await expect(page.getByRole("heading", { name: /爱，落在/ })).toBeVisible();
  await expect(page.locator("#story")).toBeVisible();

  const failedImageRequests = await page.evaluate(async () => {
    const sources = [...new Set([...document.images].map((image) => image.getAttribute("src")))];
    const checks = await Promise.all(sources.map(async (source) => ({ source, ok: (await fetch(source)).ok })));
    return checks.filter((check) => !check.ok).map((check) => check.source);
  });
  expect(failedImageRequests).toEqual([]);

  const days = Number(await page.locator('[data-counter="days"]').textContent());
  expect(days).toBeGreaterThanOrEqual(0);
  expect(runtimeErrors).toEqual([]);
});

test("相册、情书、主题、心愿和私人留言交互正常", async ({ page }) => {
  await page.goto("/");

  const firstGalleryItem = page.locator('[data-gallery-index="0"]');
  await firstGalleryItem.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await firstGalleryItem.click();
  await expect(page.locator("#lightbox")).toHaveAttribute("open", "");
  await expect(page.locator("#lightbox-caption")).toContainText("1 / 4");
  await page.getByRole("button", { name: "下一张" }).click();
  await expect(page.locator("#lightbox-caption")).toContainText("2 / 4");
  await page.getByRole("button", { name: "关闭相册" }).click();

  await page.getByRole("button", { name: /拆开这封情书/ }).click();
  await expect(page.locator("#letter-dialog")).toHaveAttribute("open", "");
  await expect(page.getByRole("heading", { name: "亲爱的你：" })).toBeVisible();
  await page.getByRole("button", { name: "合上情书" }).click();

  await page.getByRole("button", { name: "切换夜间模式" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");

  const firstPromise = page.locator('#promise-list input[type="checkbox"]').first();
  await page.locator("#promise-list label").first().click();
  await expect(firstPromise).toBeChecked();
  await expect(page.locator("#promise-complete")).toHaveText("1");
  expect(await page.evaluate(() => localStorage.getItem("love-archive-promises"))).toContain("sunsets");

  const note = "明年也要一起看春天";
  await page.locator("#private-note").fill(note);
  await page.getByRole("button", { name: "珍藏这句话" }).click();
  expect(await page.evaluate(() => localStorage.getItem("love-archive-note"))).toBe(note);
});

test("移动端导航可以展开并到达目标章节", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "仅验证移动端导航");
  await page.goto("/");
  const menu = page.getByRole("button", { name: "打开导航" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("link", { name: "故事", exact: true }).click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#story")).toBeInViewport();
});
