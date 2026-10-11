// Calcul des chances de retrait PA / PM (Dofus).
// Probabilité de retirer 1 point = 50 * (retrait lanceur / esquive cible) * (points actuels cible / points totaux cible) %
// bornée entre 10 % et 90 %. Pour un sort qui retire plusieurs points, le calcul se fait point par point,
// les points actuels de la cible diminuant à chaque point retiré.
(function (root) {
  var MIN_PCT = 10;
  var MAX_PCT = 90;

  function clamp(x, lo, hi) {
    return Math.min(hi, Math.max(lo, x));
  }

  // params : { retrait, esquive, retire, total, actuel }
  // renvoie : { steps, atLeast, exact, expected }
  //   steps[i]   : { n, courant, score, proba }  -> étape du (i+1)-ème point, sachant les précédents retirés
  //   atLeast[k] : probabilité (0..1) de retirer au moins k points
  //   exact[k]   : probabilité (0..1) de retirer exactement k points
  function simulate(params) {
    var retrait = Math.max(0, Number(params.retrait) || 0);
    var esquive = Math.max(0, Number(params.esquive) || 0);
    var retire = Math.max(0, Math.floor(Number(params.retire) || 0));
    var total = Math.max(1, Math.floor(Number(params.total) || 1));
    var actuel = clamp(Math.floor(Number(params.actuel)), 0, total);
    if (isNaN(actuel)) actuel = total;

    var steps = [];
    var atLeast = [1];

    for (var i = 0; i < retire; i++) {
      var courant = actuel - i;
      var score, proba;
      if (courant <= 0) {
        score = 0;
        proba = 0; // plus rien à retirer
      } else {
        score = esquive > 0 ? 50 * (retrait / esquive) * (courant / total) : Infinity;
        proba = clamp(score, MIN_PCT, MAX_PCT) / 100;
      }
      steps.push({ n: i + 1, courant: courant, score: score, proba: proba });
      atLeast.push(atLeast[i] * proba);
    }

    var exact = [];
    var expected = 0;
    for (var k = 0; k <= retire; k++) {
      exact.push(atLeast[k] - (k < retire ? atLeast[k + 1] : 0));
      if (k > 0) expected += atLeast[k]; // E[X] = somme des P(X >= k)
    }

    return { steps: steps, atLeast: atLeast, exact: exact, expected: expected };
  }

  var api = { simulate: simulate, MIN_PCT: MIN_PCT, MAX_PCT: MAX_PCT };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Retrait = api;
})(typeof self !== "undefined" ? self : this);
