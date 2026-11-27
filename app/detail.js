// The deal detail view, reached at #/deal/<id>.
// Shows the full evidence for one deal and, where the same product was found
// cheaper (or the same price) at another store, a cross-store comparison.

import { amountSaved, discountPercent } from "./filters.js";
import { CHECKED_LABEL } from "./deals.js";
import { money, VERDICT_LABELS, categorySlug, verdictBadge } from "./render.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

// Rows for the cross-store table: this deal's store first, then the others,
// cheapest first. A row is { store, price, isThis }.
export function crossStoreRows(deal) {
  const rows = [{ store: deal.store, price: deal.sale, isThis: true }];
  for (const other of deal.compare || []) {
    rows.push({ store: other.store, price: other.price, isThis: false });
  }
  rows.sort((a, b) => a.price - b.price);
  return rows;
}

function comparisonTable(deal) {
  const rows = crossStoreRows(deal);
  if (rows.length < 2) return null;
  const wrap = el("div", "compare");
  wrap.append(el("h2", null, "Same product, other stores"));
  const table = el("table", "compare-table");
  const head = el("tr");
  head.append(el("th", null, "Store"), el("th", null, "Price"));
  table.append(head);
  for (const row of rows) {
    const tr = el("tr");
    const storeCell = el("td", null, row.store + (row.isThis ? " (this deal)" : ""));
    const priceCell = el("td", "compare-price", money(row.price));
    tr.append(storeCell, priceCell);
    table.append(tr);
  }
  wrap.append(table);
  const cheapest = rows[0];
  wrap.append(
    el(
      "p",
      "compare-note",
      cheapest.isThis
        ? "This store has the lowest price we found for this product."
        : `${cheapest.store} lists it for ${money(cheapest.price)} — ${money(
            deal.sale - cheapest.price,
          )} less than this deal.`,
    ),
  );
  return wrap;
}

// The full detail panel for one deal. Returns null when the id is unknown.
export function renderDetail(deal) {
  if (!deal) return null;
  const panel = el("section", `detail cat-${categorySlug(deal.category)}`);

  const back = el("a", "back-link", "← All deals");
  back.href = "#/";
  panel.append(back);

  const top = el("div", "card-top");
  top.append(el("span", "category", deal.category), verdictBadge(deal));
  panel.append(top);

  panel.append(el("h2", "detail-name", deal.name));
  panel.append(el("p", "card-store", deal.store));

  const prices = el("div", "card-prices");
  prices.append(el("span", "sale-price", money(deal.sale)));
  prices.append(el("span", "usual-price", money(deal.usual)));
  panel.append(prices);
  panel.append(
    el(
      "p",
      "card-discount",
      `-${discountPercent(deal)}% · save ${money(amountSaved(deal))}`,
    ),
  );

  const facts = el("dl", "facts");
  const addFact = (term, value) => {
    facts.append(el("dt", null, term), el("dd", null, value));
  };
  addFact("Verdict", VERDICT_LABELS[deal.verdict]);
  addFact("Evidence", deal.evidence);
  addFact("Sale price", money(deal.sale));
  addFact("Usual price", money(deal.usual));
  addFact("You save", `${money(amountSaved(deal))} (${discountPercent(deal)}%)`);
  addFact("Price checked", CHECKED_LABEL);
  addFact("Price source", deal.source);
  panel.append(facts);

  const comparison = comparisonTable(deal);
  if (comparison) panel.append(comparison);

  const actions = el("div", "card-actions");
  const storeLink = el("a", "btn btn-store", `View at ${deal.store}`);
  storeLink.href = deal.link;
  storeLink.target = "_blank";
  storeLink.rel = "noopener";
  actions.append(storeLink);
  panel.append(actions);

  panel.append(
    el(
      "p",
      "detail-note",
      deal.productPage
        ? "Prices change fast on Black Friday. The link opens the store's own product page — check the live price there before you buy."
        : "Prices change fast on Black Friday. The link opens the store's search for this product — check the live price there before you buy.",
    ),
  );
  return panel;
}
