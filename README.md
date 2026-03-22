
1) Create a new Web Service on Render:
   - Render → New → Web Service → Connect repository (or Manual Deploy upload a ZIP)
   - Build Command: npm install
   - Start Command: npm start
   - Env Vars: set IOTA_PRIVATE_KEY (your testnet private key)

2) After deploy, note the public URL (e.g. https://iota-payout.onrender.com)

3) Wire your frontend/backend (coinflip) to call POST /payout on that URL with JSON:
   { txDigest, playerAddress, stakeIota, choice }

Security notes:
- Store IOTA_PRIVATE_KEY only in Render secret env; do not commit it.
- Use a testnet key and small balances for initial tests.

---

Wenn du die drei Dateien gespeichert hast, sag „fertig“ — ich leite dich dann durch den Upload ins GitHub‑Repo (Add file → Upload files) und anschließend durch das Einrichten auf Render.