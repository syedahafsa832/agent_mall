# APIs needed from Hafsa

Gaps found while building the merchant/account UI on `muhammad/merchant-ui`. The
frontend is built to call these contracts already — each gap currently
degrades gracefully in the UI (empty state / "not available yet"), it does
not fabricate data. Nothing below was built by me; these are requests.

---

## 1. Saved auctions

`saved_auctions` exists as a table (migrations/002) but has no API route —
`saved_websites` has one, `saved_auctions` doesn't.

```
GET /api/profile/saved-auctions
Auth: required (Bearer)
Response: { savedAuctions: Array<{ id, auction_id, created_at, title, status, current_price, currency, ends_at }> }

POST /api/profile/saved-auctions
Body: { auctionId: string }
Response: { saved: { id, user_id, auction_id, created_at } }

DELETE /api/profile/saved-auctions/:id
Response: { ok: true }
```

Mirrors `src/server/profile/repository.ts`'s `listSavedWebsites` /
`saveWebsite` / `unsaveWebsite` pattern exactly, joined against `auctions`
instead of `merchants`.

Currently shown on `/app/profile` as a clearly-labeled "not available yet" row.

---

## 2. Per-merchant product count / listing

The merchant dashboard (`/merchant`) wants to show product count for *any*
connected merchant, but there's no generic `GET /api/merchants/:id/products`
— only the three demo stores expose their own catalog routes
(`/api/demo/cadence-cycles/products`, etc.), which aren't addressable by
merchant id.

```
GET /api/merchants/:id/products
Response: { count: number, products: Array<{ id, name, price, currency, inStock }> }
```

Currently the dashboard special-cases the three known demo-store slugs to
show a real count, and shows "Not synced yet" for anything else (e.g. a
freshly-connected arbitrary website via `/merchant/connect`, which has no
product sync job at all right now).

---

## 3. Per-merchant policies (shipping / returns / warranty)

`merchant_policies` exists as a table (migrations/002: `shipping`, `returns`,
`warranty` jsonb + `notes`) but there's no API route to read or write it.

```
GET /api/merchants/:id/policies
Response: { shipping: {...}, returns: {...}, warranty: {...}, notes: string | null }

PATCH /api/merchants/:id/policies   (merchant-owner only)
Body: { shipping?, returns?, warranty?, notes? }
```

Currently the dashboard shows a note pointing here instead of fake policy
text — the three demo stores expose policy data per-product instead
(`shipping`/`returns`/`warranty` sub-routes already exist under
`/api/demo/<slug>/products/:id/...`), which isn't the same as a merchant-level
policy.

---

## 4. Website auto-detection for `/merchant/connect`

Not a blocker — I built a lightweight preview endpoint myself
(`GET /api/merchants/detect?url=`, in `src/app/api/merchants/detect/route.ts`)
that fetches the given URL and reads `<title>`/meta description via cheerio
to prefill the connect form. It does **not** verify ownership (that's still
exclusively `src/server/merchants/verification.ts`, untouched) and it isn't a
connector — purely a form-prefill convenience. Flagging it here in case you'd
rather this live in your `connect` module instead, or want to extend it to
guess `connectorType`/`category` more intelligently.
