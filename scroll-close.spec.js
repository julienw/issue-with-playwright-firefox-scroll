// @ts-check
const { test, expect } = require("@playwright/test");

// In Firefox, Playwright's click() calls scrollIntoViewIfNeeded on the target
// even when it is already visible. If a window scroll listener closes the popup,
// the element disappears before the click lands.
//
// Steps to reproduce:
//  1. page has content above the fold (trigger is off-screen initially)
//  2. open a popup that registers a window scroll (capture) listener to close
//  3. the popup items are tall enough that the last one sits at the viewport edge
//  4. click the last menu item — Firefox scrolls, popup closes, click fails
//
// Passes in Chromium. Fails in Firefox.
const pageContent = /* html */ `
<!DOCTYPE html>
<style>
  #menu { display: none; position: absolute; }
  #menu button { display: block; padding: 8px; }
</style>
<body>
  <div id="result">not clicked</div>
  <div style="height: 600px"></div>
  <button id="trigger">Open menu</button>
  <div id="menu">
    <button role="menuitem">Item 1</button>
    <button role="menuitem">Item 2</button>
    <button role="menuitem" id="target">Target item</button>
  </div>
  <div style="height: 3000px"></div>
  <script>
    trigger.addEventListener("click", () => {
      const rect = trigger.getBoundingClientRect();
      menu.style.top  = rect.bottom + window.scrollY + "px";
      menu.style.left = rect.left   + window.scrollX + "px";
      menu.style.display = "block";
      const close = () => {
        menu.style.display = "none";
        window.removeEventListener("scroll", close, true);
      };
      window.addEventListener("scroll", close, true);
    });
    target.addEventListener("click", () => { result.textContent = "clicked"; });
  </script>
</body>
`;

test("clicking a menu item in a scroll-closed popup", async ({ page }) => {
  await page.setContent(pageContent);
  await page.getByRole("button", { name: "Open menu" }).click();

  const target = page.getByRole("menuitem", { name: "Target item" });
  await expect(target).toBeVisible();
  await target.click();

  await expect(page.locator("#result")).toHaveText("clicked");
});
