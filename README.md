# Playwright Firefox bug: spurious scroll closes popup before click lands

When clicking an element that is already visible in the viewport, Firefox
triggers a window `scroll` event as part of Playwright's `scrollIntoViewIfNeeded`
step. This breaks any popup that closes itself on `scroll`.

The same test passes in Chromium.

## Steps to reproduce

```sh
npm install
npx playwright install firefox chromium
npm test
```

## Expected behaviour

Both browsers pass: the menu item is clicked and `#result` reads `"clicked"`.

## Actual behaviour

Firefox fails. Playwright log:

```
- element is visible, enabled and stable
- scrolling into view if needed   ← unnecessary scroll fires here
- done scrolling
- performing click action
- <div></div> intercepts pointer events   ← popup already closed
- element is not visible
```

## Scenario

1. The page has 600 px of content above the fold, so the trigger button is
   initially off-screen.
2. `trigger.click()` scrolls the trigger into view and clicks it.
3. The click handler opens a popup and registers a capturing `scroll` listener
   on `window` to close it — a standard pattern for dismissing dropdowns.
4. `target.click()` is called on a menu item inside the popup. The item is
   confirmed visible (`toBeVisible` passes). Playwright then calls
   `scrollIntoViewIfNeeded` on it anyway, which scrolls the window, fires the
   close listener, and hides the popup before the click is dispatched.

## Run only one browser

```sh
npm run test:firefox
npm run test:chromium
```

## Run against Firefox Nightly with Bidi

The `firefox-nightly` project expects the binary at `~/firefox-nightly-en/firefox`
by default. Override with the `FIREFOX_NIGHTLY` env variable:

```sh
FIREFOX_NIGHTLY=/path/to/firefox-nightly npx playwright test --project=firefox-nightly
```
