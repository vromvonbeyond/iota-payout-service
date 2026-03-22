const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Simulierter Payout‑Service (Testmodus).
// Liefert bei Gewinn eine simulierte txDigest, keine echten On‑Chain‑Transaktionen.

app.post('/payout', async (req, res) => {
try {
const { txDigest, playerAddress, stakeIota, choice } = req.body || {};
if (!txDigest || !playerAddress) return res.status(400).json({ error: 'Missing txDigest or playerAddress' });

// einfache Verifikation (nur Demo): akzeptiere jede übergebene txDigest als bezahlt
// Zufalls‑Entscheidung (oder deterministic if you prefer)
const { randomInt } = require('crypto');
const rndBit = randomInt(0, 2);
const chosen = (choice === 'tails') ? 1 : 0;
const win = rndBit === chosen;

if (!win) {
  return res.json({ result: 'lose', win: false, payout: 0, debug: { rndBit, chosen } });
}

// Simulate payout: create a fake tx hash (not on chain)
const fakeTx = 'SIMULATED-TX-' + Math.random().toString(36).slice(2, 12);
const payoutNanos = Number(BigInt(Math.floor((stakeIota || 3.5) * 1e9)) * BigInt(2));

return res.json({
  result: 'win',
  win: true,
  payout: payoutNanos,
  txDigest: fakeTx,
  debug: { rndBit, chosen, simulated: true }
});
} catch (err) {
console.error('payout error', err);
return res.status(500).json({ error: 'Server error', detail: String(err && err.message) });
}
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Payout service listening on', port));

