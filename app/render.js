// Rendering for the deal board: price formatting, verdict badges, deal cards
// and the stats strip. Builds DOM nodes with textContent only, so product
// names can never inject markup.

import { amountSaved, discountPercent } from "./filters.js";
import { CHECKED_LABEL } from "./deals.js";

export const VERDICT_LABELS = {
  "new-low": "NEW LOW",
  strong: "STRONG DEAL",
  routine: "ROUTINE SALE",
  weak: "WEAK DEAL",
};

export function money(amount) {
  return `$${amount.toFixed(2)}`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

export function verdictBadge(deal) {
  const badge = el("span", `verdict verdict-${deal.verdict}`, VERDICT_LABELS[deal.verdict]);
  return badge;
}

// Slug for a category name, used as a CSS class so each category gets its
// own accent colour (see style.css). "Headphones & Audio" -> "headphones-audio".
export function categorySlug(category) {
  return category
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// One deal card for the board grid.
export function dealCard(deal) {
  const card = el("article", `card cat-${categorySlug(deal.category)}`);

  const top = el("div", "card-top");
  top.append(el("span", "category", deal.category), verdictBadge(deal));
  card.append(top);

  const name = el("h3", "card-name", deal.name);
  card.append(name);
  card.append(el("p", "card-store", deal.store));

  const prices = el("div", "card-prices");
  prices.append(el("span", "sale-price", money(deal.sale)));
  const usual = el("span", "usual-price", money(deal.usual));
  prices.append(usual);
  card.append(prices);

  const pct = discountPercent(deal);
  card.append(
    el(
      "p",
      "card-discount",
      `-${pct}% · save ${money(amountSaved(deal))}`,
    ),
  );

  card.append(el("p", "card-evidence", deal.evidence));
  card.append(
    el(
      "p",
      "card-checked",
      `Checked ${CHECKED_LABEL} · ${deal.source}`,
    ),
  );

  const actions = el("div", "card-actions");
  const storeLink = el("a", "btn btn-store", `View at ${deal.store}`);
  storeLink.href = deal.link;
  storeLink.target = "_blank";
  storeLink.rel = "noopener";
  actions.append(storeLink);
  const detailsLink = el("a", "btn btn-details", "Details");
  detailsLink.href = `#/deal/${deal.id}`;
  actions.append(detailsLink);
  card.append(actions);

  return card;
}

// The stats strip above the board: deal, store and category counts, number of
// new lows, and the average discount across every deal.
export function renderStats(deals) {
  const stores = new Set(deals.map((deal) => deal.store)).size;
  const categories = new Set(deals.map((deal) => deal.category)).size;
  const newLows = deals.filter((deal) => deal.verdict === "new-low").length;
  const average =
    deals.length === 0
      ? 0
      : Math.round(
          deals.reduce((sum, deal) => sum + discountPercent(deal), 0) /
            deals.length,
        );
  const stats = [
    { value: String(deals.length), label: "deals checked" },
    { value: String(stores), label: "stores" },
    { value: String(categories), label: "categories" },
    { value: String(newLows), label: "new lows" },
    { value: `${average}%`, label: "average discount" },
  ];
  const strip = el("div", "stats-strip");
  for (const stat of stats) {
    const item = el("div", "stat");
    item.append(el("span", "stat-value", stat.value));
    item.append(el("span", "stat-label", stat.label));
    strip.append(item);
  }
  return strip;
}

// The "no deals match" empty state for a filter combination with no results.
export function emptyState() {
  const box = el("div", "empty");
  box.append(el("p", "empty-title", "No deals match those filters."));
  box.append(
    el(
      "p",
      null,
      "Try a different search word, or clear a filter to see the full board again.",
    ),
  );
  return box;
}
