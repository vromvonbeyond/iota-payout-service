const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Minimaler Payout‑Service (Test/Starter)
// WICHTIG: Setze IOTA_PRIVATE_KEY nur als Environment Variable in Render (oder anderem Host).
// Dieser Service macht aktuell eine einfache Zufallsentscheidung und liefert debug‑Infos.
// In Produktion solltest du verifyPayment robust implementieren und payouts nur mit geprüfter Signatur senden.

app.post('/payout', async (req, res) => {
  try {
    const { txDigest, playerAddress, stakeIota, choice } = req.body || {};
    if (!txDigest || !playerAddress) return res.status(400).json({ error: 'Missing txDigest or playerAddress' });

    // Testweise: einfache Zufallsentscheidung
    const { randomInt } = require('crypto');
    const rndBit = randomInt(0, 2);
    const chosen = (choice === 'tails') ? 1 : 0;
    const win = rndBit === chosen;

    if (!win) {
      return res.json({ result: 'lose', win: false, payout: 0, debug: { rndBit, chosen } });
    }

    // Payout path (nur wenn IOTA_PRIVATE_KEY gesetzt ist)
    if (!process.env.IOTA_PRIVATE_KEY) {
      return res.status(502).json({ error: 'PAYOUT_DISABLED', detail: 'IOTA_PRIVATE_KEY not set on server', debug: { rndBit, chosen } });
    }

    // Versuche, SDK zu laden (falls installiert). In echten Deploys: implementiere hier sign+send mit @iota/iota-sdk.
    let IotaClient, Transaction;
    try {
      ({ IotaClient, Transaction } = require('@iota/iota-sdk'));
    } catch (e) {
      console.error('SDK require failed', e && e.message);
      return res.status(500).json({ error: 'SDK_MISSING', detail: String(e && e.message), debug: { rndBit, chosen } });
    }

    // Hier würde man die Auszahlung signieren und senden. Platzhalter‑Antwort:
    const payoutNanos = Number(BigInt(Math.floor((stakeIota || 3.5) * 1e9)) * BigInt(2));
    return res.json({ result: 'win', win: true, payout: payoutNanos, debug: { rndBit, chosen } });

  } catch (err) {
    console.error('payout error', err);
    return res.status(500).json({ error: 'Server error', detail: String(err && err.message) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Payout service listening on', port));

