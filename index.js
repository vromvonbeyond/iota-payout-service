const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Simulierter/robuster Payout‑Service (versucht dynamic import, fallback require)

app.post('/payout', async (req, res) => {
try {
const { txDigest, playerAddress, stakeIota, choice } = req.body || {};
if (!txDigest || !playerAddress) return res.status(400).json({ error: 'Missing txDigest or playerAddress' });

// einfache Annahme: Zahlung ist vorhanden (für initiale Tests)
const { randomInt } = require('crypto');
const rndBit = randomInt(0, 2);
const chosen = (choice === 'tails') ? 1 : 0;
const win = rndBit === chosen;

if (!win) return res.json({ result: 'lose', win: false, payout: 0, debug: { rndBit, chosen } });

if (!process.env.IOTA_PRIVATE_KEY) {
  // Wenn kein Key gesetzt: Simulation (sicher)
  const fakeTx = 'SIMULATED-TX-' + Math.random().toString(36).slice(2, 12);
  const payoutNanos = Number(BigInt(Math.floor((stakeIota || 3.5) * 1e9)) * BigInt(2));
  return res.json({ result: 'win', win: true, payout: payoutNanos, txDigest: fakeTx, debug: { rndBit, chosen, simulated: true } });
}

// Versuche dynamic import (ESM) von @iota/iota-sdk, fallback zu require Pfaden (CJS)
let IotaClient, Transaction, EdKeypair;
try {
  const mod = await import('@iota/iota-sdk').then(m => m.default || m);
  IotaClient = mod.IotaClient || mod.IotaClient;
  Transaction = mod.Transaction || mod.Transaction;
  try { EdKeypair = (await import('@iota/iota-sdk/keypairs/ed25519')).Ed25519Keypair; } catch (ignore) {}
} catch (e) {
  // fallback to require attempts
  const tryPaths = ['@iota/iota-sdk', '@iota/iota-sdk/dist/index.cjs', '@iota/iota-sdk/dist/index.js', '@iota/iota-sdk/node'];
  let loaded = false;
  for (const p of tryPaths) {
    try {
      const mod = require(p);
      IotaClient = mod.IotaClient || (mod.default && mod.default.IotaClient);
      Transaction = mod.Transaction || (mod.default && mod.default.Transaction);
      try { EdKeypair = require(p + '/keypairs/ed25519').Ed25519Keypair; } catch (ignore) { }
      if (IotaClient) { loaded = true; break; }
    } catch (e2) {
      // continue
    }
  }
  if (!loaded && !IotaClient) {
    console.error('SDK import/require failed for all known paths');
    return res.status(500).json({ error: 'SDK_MISSING', detail: 'No compatible @iota/iota-sdk export found', debug: { rndBit, chosen } });
  }
}

// Wenn wir hier ankommen, ist ein kompatibles SDK geladen (oder wir müssten noch implementieren)
try {
  const client = new IotaClient({ url: 'https://api.testnet.iota.org' });
  // TODO: hier echte Signatur + payout mit process.env.IOTA_PRIVATE_KEY implementieren
  // Für den Moment: gib eine bestätigte (simulierte) Auszahlung zurück, aber markiere sdk=loaded
  const payoutNanos = Number(BigInt(Math.floor((stakeIota || 3.5) * 1e9)) * BigInt(2));
  return res.json({ result: 'win', win: true, payout: payoutNanos, txDigest: 'SIMULATED-TX-POSTSDK', debug: { rndBit, chosen, sdk: 'loaded' } });
} catch (e) {
  console.error('payout exception', e);
  return res.status(500).json({ error: 'PAYOUT_FAILED', detail: String(e && e.message), debug: { rndBit, chosen } });
}
} catch (err) {
console.error('payout error', err);
return res.status(500).json({ error: 'Server error', detail: String(err && err.message) });
}
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Payout service listening on', port));

