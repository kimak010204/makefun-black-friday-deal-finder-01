// Boot and wiring for the deal finder: fills the filter menus, renders the
// board, and routes #/deal/<id> to the detail view. No network, no clock.

import { CHECKED_LABEL, DEALS } from "./deals.js";
import {
  MIN_DISCOUNT_OPTIONS,
  SORT_OPTIONS,
  applyFilters,
  stateFromUrl,
  uniqueValues,
} from "./filters.js";
import { dealCard, emptyState, renderStats } from "./render.js";
import { renderDetail } from "./detail.js";

const board = document.getElementById("board");
const detailView = document.getElementById("detail-view");
const resultCount = document.getElementById("result-count");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const storeSelect = document.getElementById("store");
const minDiscountSelect = document.getElementById("min-discount");
const sortSelect = document.getElementById("sort");
const clearButton = document.getElementById("clear-filters");
const statsSlot = document.getElementById("stats");
const checkDateSlot = document.getElementById("check-date");

const state = stateFromUrl(window.location.search);

function fillSelect(select, values, allLabel) {
  select.textContent = "";
  const all = document.createElement("option");
  all.value = "all";
  all.textContent = allLabel;
  select.append(all);
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
}

function fillControls() {
  fillSelect(categorySelect, uniqueValues(DEALS, "category"), "All categories");
  fillSelect(storeSelect, uniqueValues(DEALS, "store"), "All stores");
  minDiscountSelect.textContent = "";
  for (const min of MIN_DISCOUNT_OPTIONS) {
    const option = document.createElement("option");
    option.value = String(min);
    option.textContent =
      min === 0 ? "Any discount" : `At least ${min}% off`;
    minDiscountSelect.append(option);
  }
  sortSelect.textContent = "";
  for (const option of SORT_OPTIONS) {
    const node = document.createElement("option");
    node.value = option.value;
    node.textContent = option.label;
    sortSelect.append(node);
  }
  searchInput.value = state.query;
  categorySelect.value = state.category;
  storeSelect.value = state.store;
  minDiscountSelect.value = String(state.minDiscount);
  sortSelect.value = state.sort;
}

function readControls() {
  state.query = searchInput.value;
  state.category = categorySelect.value;
  state.store = storeSelect.value;
  state.minDiscount = Number(minDiscountSelect.value);
  state.sort = sortSelect.value;
}

function renderBoard() {
  const deals = applyFilters(DEALS, state);
  board.textContent = "";
  if (deals.length === 0) {
    board.append(emptyState());
  } else {
    for (const deal of deals) board.append(dealCard(deal));
  }
  resultCount.textContent =
    deals.length === DEALS.length
      ? `Showing all ${deals.length} deals`
      : `Showing ${deals.length} of ${DEALS.length} deals`;
}

function dealFromHash() {
  const match = window.location.hash.match(/^#\/deal\/([a-z0-9-]+)$/);
  if (!match) return null;
  return DEALS.find((deal) => deal.id === match[1]) || null;
}

function renderRoute() {
  const deal = dealFromHash();
  if (deal) {
    const panel = renderDetail(deal);
    detailView.textContent = "";
    detailView.append(panel);
    detailView.hidden = false;
    board.hidden = true;
    resultCount.textContent = "";
    window.scrollTo(0, 0);
  } else {
    detailView.hidden = true;
    detailView.textContent = "";
    board.hidden = false;
    renderBoard();
  }
}

function resetFilters() {
  state.query = "";
  state.category = "all";
  state.store = "all";
  state.minDiscount = 0;
  state.sort = "new-low";
  searchInput.value = "";
  categorySelect.value = "all";
  storeSelect.value = "all";
  minDiscountSelect.value = "0";
  sortSelect.value = "new-low";
  renderBoard();
}

searchInput.addEventListener("input", () => {
  readControls();
  renderBoard();
});
for (const select of [categorySelect, storeSelect, minDiscountSelect, sortSelect]) {
  select.addEventListener("change", () => {
    readControls();
    renderBoard();
  });
}
clearButton.addEventListener("click", resetFilters);
window.addEventListener("hashchange", renderRoute);

statsSlot.append(renderStats(DEALS));
checkDateSlot.textContent = `All prices checked ${CHECKED_LABEL}.`;
fillControls();
renderRoute();
