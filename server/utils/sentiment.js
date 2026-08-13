const Sentiment = require('sentiment');
const analyzer = new Sentiment();

// ---- AI Feature: Review Sentiment Analysis ----
//
// This uses the AFINN lexicon (a list of ~3000 English words, each
// pre-scored from -5 to +5 for emotional tone by researchers at the
// Technical University of Denmark). The `sentiment` library:
//   1. Splits the review text into words
//   2. Looks each word up in the AFINN list ("great" = +3, "terrible" = -3)
//   3. Sums the scores, then normalizes by comment length
//
// This is a classic, explainable NLP technique (lexicon-based sentiment
// analysis) — not a black box. You can open node_modules/sentiment and
// literally show an interviewer the word list if asked "how does it work".
//
// We use the result to auto-tag each review as positive/neutral/negative,
// which powers the "Customer Sentiment" summary on product pages.
function analyzeSentiment(text) {
  const result = analyzer.analyze(text);

  let label = 'neutral';
  if (result.comparative > 0.15) label = 'positive';
  else if (result.comparative < -0.15) label = 'negative';

  return {
    score: result.comparative, // normalized score, roughly -5 to +5
    label,
  };
}

module.exports = analyzeSentiment;
