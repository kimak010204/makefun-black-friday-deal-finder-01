// Search, filter and sort logic for the deal finder.
// Pure functions over the deal list: no DOM, no network, no clock.

export const SORT_OPTIONS = [
  { value: "new-low", label: "New lows first" },
  { value: "discount", label: "Biggest discount" },
  { value: "saving", label: "Biggest saving" },
  { value: "price", label: "Lowest price" },
];

export const MIN_DISCOUNT_OPTIONS = [0, 20, 30, 40, 50];

// The filter state. `query` matches product, store and category (case-insensitive).
export function defaultState() {
  return {
    query: "",
    category: "all",
    store: "all",
    minDiscount: 0,
    sort: "new-low",
  };
}

// Read an initial filter state from the page URL (?q=, ?category=, ?store=,
// ?min=, ?sort=) so a filtered view is a real, shareable state of the finder.
export function stateFromUrl(search) {
  const state = defaultState();
  const params = new URLSearchParams(search || "");
  const query = params.get("q");
  if (query) state.query = query;
  const category = params.get("category");
  if (category) state.category = category;
  const store = params.get("store");
  if (store) state.store = store;
  const min = Number(params.get("min"));
  if (Number.isFinite(min) && MIN_DISCOUNT_OPTIONS.includes(min)) {
    state.minDiscount = min;
  }
  const sort = params.get("sort");
  if (sort && SORT_OPTIONS.some((option) => option.value === sort)) {
    state.sort = sort;
  }
  return state;
}

// Discount percent of a deal, computed from its two prices.
export function discountPercent(deal) {
  if (!deal.usual || deal.usual <= 0) return 0;
  return Math.round((100 * (deal.usual - deal.sale)) / deal.usual);
}

// Dollars saved on a deal, computed from its two prices.
export function amountSaved(deal) {
  return deal.usual - deal.sale;
}

function matchesQuery(deal, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = `${deal.name} ${deal.store} ${deal.category}`.toLowerCase();
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

// Apply search + filters, then sort. Returns a new array; the input is untouched.
export function applyFilters(deals, state) {
  const kept = deals.filter((deal) => {
    if (!matchesQuery(deal, state.query)) return false;
    if (state.category !== "all" && deal.category !== state.category) return false;
    if (state.store !== "all" && deal.store !== state.store) return false;
    if (discountPercent(deal) < state.minDiscount) return false;
    return true;
  });
  return sortDeals(kept, state.sort);
}

export function sortDeals(deals, sort) {
  const copy = [...deals];
  if (sort === "new-low") {
    // New-low deals first (they are the rarest finds), then biggest discount.
    copy.sort(
      (a, b) =>
        (b.verdict === "new-low" ? 1 : 0) - (a.verdict === "new-low" ? 1 : 0) ||
        discountPercent(b) - discountPercent(a) ||
        amountSaved(b) - amountSaved(a),
    );
  } else if (sort === "saving") {
    copy.sort((a, b) => amountSaved(b) - amountSaved(a));
  } else if (sort === "price") {
    copy.sort((a, b) => a.sale - b.sale);
  } else {
    copy.sort(
      (a, b) =>
        discountPercent(b) - discountPercent(a) || amountSaved(b) - amountSaved(a),
    );
  }
  return copy;
}

// Sorted unique values of one field across the deals, for the filter menus.
export function uniqueValues(deals, field) {
  return [...new Set(deals.map((deal) => deal[field]))].sort();
}
