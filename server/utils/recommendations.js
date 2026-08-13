// ---- AI Feature: Content-Based Product Recommendations ----
//
// This is a classic "content-based filtering" recommendation algorithm —
// the same family of technique used by early Netflix/Amazon recommenders
// before deep learning became common. No external AI API, no training
// data needed — it scores products purely by how SIMILAR their
// attributes are to the product currently being viewed.
//
// Scoring rules (tune-able):
//   +5 points  same category
//   +3 points  same brand
//   +2 points  price within 20% of the current product's price
//   +1 point   similar rating (within 1 star)
//
// Products are sorted by total score, highest first, and the top N
// are returned. This is why it's called "content-based": we compare
// the CONTENT/attributes of items, not other users' behavior
// (that alternative approach is called "collaborative filtering").
function scoreProduct(base, candidate) {
  let score = 0;

  if (candidate.category?.toString() === base.category?.toString()) score += 5;
  if (candidate.brand === base.brand) score += 3;

  const priceDiff = Math.abs(candidate.price - base.price);
  if (priceDiff <= base.price * 0.2) score += 2;

  const ratingDiff = Math.abs((candidate.rating || 0) - (base.rating || 0));
  if (ratingDiff <= 1) score += 1;

  return score;
}

function getRecommendations(baseProduct, allProducts, limit = 4) {
  return allProducts
    .filter((p) => p._id.toString() !== baseProduct._id.toString())
    .map((candidate) => ({ product: candidate, score: scoreProduct(baseProduct, candidate) }))
    .filter((entry) => entry.score > 0) // only genuinely related products
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}

module.exports = getRecommendations;
