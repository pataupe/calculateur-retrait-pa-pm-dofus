const assert = require("assert");
const { simulate } = require("./retrait.js");
const near = (a, b, eps = 1e-9) => assert(Math.abs(a - b) < eps, `${a} != ${b}`);

// Exemple du doc : retrait 100, esquive 50, 6 PA, sort à 2 PA
let r = simulate({ retrait: 100, esquive: 50, retire: 2, total: 6, actuel: 6 });
near(r.steps[0].score, 100);
near(r.steps[0].proba, 0.9);
near(r.steps[1].score, 50 * 2 * (5 / 6)); // 83.33
near(r.steps[1].proba, 50 * 2 * (5 / 6) / 100);
near(r.atLeast[1], 0.9);
near(r.atLeast[2], 0.9 * 0.8333333333333334);
near(r.exact.reduce((a, b) => a + b, 0), 1);

// Bornes : retrait nul -> 10 % mini, énorme -> 90 % maxi
near(simulate({ retrait: 0, esquive: 100, retire: 1, total: 6, actuel: 6 }).atLeast[1], 0.1);
near(simulate({ retrait: 9999, esquive: 1, retire: 1, total: 6, actuel: 6 }).atLeast[1], 0.9);

// Esquive 0 -> 90 %
near(simulate({ retrait: 50, esquive: 0, retire: 1, total: 6, actuel: 6 }).atLeast[1], 0.9);

// Cible sans point : rien à retirer
r = simulate({ retrait: 100, esquive: 10, retire: 3, total: 3, actuel: 1 });
near(r.atLeast[1], 0.9);
near(r.atLeast[2], 0);
near(r.exact[0], 0.1);

// Somme des probabilités exactes = 1, et espérance cohérente
r = simulate({ retrait: 80, esquive: 60, retire: 4, total: 6, actuel: 5 });
near(r.exact.reduce((a, b) => a + b, 0), 1);
near(r.expected, r.exact.reduce((a, p, k) => a + p * k, 0));

console.log("OK");
