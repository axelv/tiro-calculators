import { expect, type Locator, type Page } from "@playwright/test";

declare global {
  interface Window {
    __tiroState: "loading" | "ready" | "error";
    __tiroResponse: { item?: ResponseItem[] } | null;
    __tiroError: unknown;
  }
}

export interface ResponseItem {
  linkId: string;
  answer?: Array<{
    valueDecimal?: number;
    valueInteger?: number;
    valueString?: string;
    valueBoolean?: boolean;
    valueCoding?: { code?: string; display?: string; system?: string };
  }>;
  item?: ResponseItem[];
}

/**
 * SDK rendering reference (cdn.tiro.health/sdk/next, snapshot taken 2026-05-06):
 *
 * <tiro-form-filler> shadow DOM contains, for each item:
 *   <div qr-item-linkid="<linkId>"
 *        qr-item-id="<group>.<linkId>"
 *        data-testid="<linkId>">
 *     ...
 *     <div name="<group>.<linkId>.answer" class="...">
 *       <button aria-pressed="false">{{ option display }}</button>   ← chips
 *       ...
 *     </div>
 *     <input name="<group>.<linkId>.answer" ...>                     ← decimals/strings
 *   </div>
 *
 * Playwright auto-pierces open shadow roots, so plain `[data-testid=...]`
 * selectors work end-to-end. Helpers below use that.
 */

export async function openCalc(page: Page, slug: string): Promise<void> {
  await page.goto(`/harness/?q=${slug}`);
  await waitReady(page);
}

export async function waitReady(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => window.__tiroState), {
      timeout: 15_000,
      intervals: [50, 100, 250, 500],
    })
    .toBe("ready");
}

/** Locator scoped to a single questionnaire item by linkId. */
export function itemLocator(page: Page, linkId: string): Locator {
  return page.locator(`[data-testid="${linkId}"]`);
}

/**
 * Click the chip whose visible label matches `optionDisplay` within the item
 * identified by `linkId`.
 *
 * Implementation note: we click via `page.evaluate` rather than Playwright's
 * `.click()`. The Tiro form re-renders the chip group on every selection,
 * detaching previously-clicked button elements; Playwright's stability wait
 * misinterprets that and silently drops subsequent clicks. Direct
 * `element.click()` from inside the page sidesteps that entirely.
 */
export async function selectChip(
  page: Page,
  linkId: string,
  optionDisplay: string,
): Promise<void> {
  let lastResult: {
    ok: boolean;
    error?: string;
    available?: (string | undefined)[];
  } = { ok: false, error: "not yet attempted" };

  await expect
    .poll(
      async () => {
        lastResult = await page.evaluate(
          ({ linkId, name }) => {
            const filler = document.querySelector("tiro-form-filler");
            const root = filler?.shadowRoot;
            if (!root) return { ok: false, error: "no shadow root" };
            const wrapper = root.querySelector(`[data-testid="${linkId}"]`);
            if (!wrapper) return { ok: false, error: `no item ${linkId}` };
            const buttons = Array.from(
              wrapper.querySelectorAll("button"),
            ) as HTMLButtonElement[];
            const target = buttons.find(
              (b) => b.textContent?.trim() === name,
            );
            if (!target) {
              return {
                ok: false,
                error: `no chip "${name}" in ${linkId}`,
                available: buttons
                  .map((b) => b.textContent?.trim())
                  .filter(Boolean),
              };
            }
            target.click();
            return { ok: true };
          },
          { linkId, name: optionDisplay },
        );
        return lastResult.ok;
      },
      { timeout: 6_000, intervals: [50, 100, 200, 400] },
    )
    .toBe(true);
}

/**
 * Fill a numeric (decimal/integer) input within the item identified by `linkId`.
 * Uses raw DOM events so it survives the SDK's re-render churn (same reason as
 * `selectChip` above). Polls until the wrapper + input exist, since
 * `tiro-ready` fires before the SDK has fully mounted item inputs.
 */
export async function setNumber(
  page: Page,
  linkId: string,
  value: number | string,
): Promise<void> {
  let lastError: string = "not yet attempted";
  await expect
    .poll(
      async () => {
        const result = await page.evaluate(
          ({ linkId, value }) => {
            const filler = document.querySelector("tiro-form-filler");
            const root = filler?.shadowRoot;
            if (!root) return { ok: false, error: "no shadow root" };
            const wrapper = root.querySelector(`[data-testid="${linkId}"]`);
            if (!wrapper) return { ok: false, error: `no item ${linkId}` };
            const input = wrapper.querySelector("input") as HTMLInputElement | null;
            if (!input) return { ok: false, error: `no input in ${linkId}` };
            const setter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "value",
            )?.set;
            setter?.call(input, String(value));
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            input.blur();
            return { ok: true };
          },
          { linkId, value },
        );
        if (!result.ok) lastError = result.error ?? "unknown";
        return result.ok;
      },
      { timeout: 6_000, intervals: [50, 100, 200, 400] },
    )
    .toBe(true);
}

/** Fill a free-text input within the item identified by `linkId`. */
export async function setText(
  page: Page,
  linkId: string,
  value: string,
): Promise<void> {
  await setNumber(page, linkId, value);
}

export function findItem(
  items: ResponseItem[] | undefined,
  linkId: string,
): ResponseItem | undefined {
  if (!items) return undefined;
  for (const it of items) {
    if (it.linkId === linkId) return it;
    const nested = findItem(it.item, linkId);
    if (nested) return nested;
  }
  return undefined;
}

export async function getCalculated(
  page: Page,
  linkId: string,
): Promise<ResponseItem | undefined> {
  return await page.evaluate((id) => {
    const visit = (items: ResponseItem[] | undefined): ResponseItem | undefined => {
      if (!items) return undefined;
      for (const it of items) {
        if (it.linkId === id) return it;
        const nested = visit(it.item);
        if (nested) return nested;
      }
      return undefined;
    };
    return visit(window.__tiroResponse?.item);
  }, linkId);
}

/**
 * Wait until the calculated item's `valueDecimal` is within `tol` of `expected`.
 * Default tolerance is 1e-3.
 */
export async function expectCalculatedDecimal(
  page: Page,
  linkId: string,
  expected: number,
  tol = 1e-3,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const item = await getCalculated(page, linkId);
        const v = item?.answer?.[0];
        return v?.valueDecimal ?? v?.valueInteger ?? null;
      },
      { timeout: 6_000, intervals: [50, 100, 200, 400, 800] },
    )
    .toBeCloseTo(expected, Math.max(0, Math.ceil(-Math.log10(tol))));
}

/** Wait until the calculated item's integer or decimal answer equals `expected`. */
export async function expectCalculatedInt(
  page: Page,
  linkId: string,
  expected: number,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const item = await getCalculated(page, linkId);
        const v = item?.answer?.[0];
        return v?.valueInteger ?? v?.valueDecimal ?? null;
      },
      { timeout: 6_000, intervals: [50, 100, 200, 400, 800] },
    )
    .toBe(expected);
}

/** Wait until the calculated item's string answer matches `expected`. */
export async function expectCalculatedString(
  page: Page,
  linkId: string,
  expected: string | RegExp,
): Promise<void> {
  if (typeof expected === "string") {
    await expect
      .poll(
        async () => {
          const item = await getCalculated(page, linkId);
          return item?.answer?.[0]?.valueString ?? "";
        },
        { timeout: 6_000, intervals: [50, 100, 200, 400, 800] },
      )
      .toBe(expected);
  } else {
    await expect
      .poll(
        async () => {
          const item = await getCalculated(page, linkId);
          return item?.answer?.[0]?.valueString ?? "";
        },
        { timeout: 6_000, intervals: [50, 100, 200, 400, 800] },
      )
      .toMatch(expected);
  }
}
