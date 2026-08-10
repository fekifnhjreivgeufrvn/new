# Leaderboard Test (Cloudflare Worker)

A single Worker that serves a page with a name/score form and a live top-20
table, backed by Cloudflare KV. No build step, no framework.

## 1. Create a KV namespace (one-time)

You need to do this once **before** connecting the repo, so the ID is in
`wrangler.toml` when Cloudflare builds it.

Easiest way — in the Cloudflare dashboard:
1. Go to **Workers & Pages → KV**.
2. Click **Create a namespace**, name it e.g. `LEADERBOARD`.
3. Copy the namespace ID it gives you.

(Or via CLI if you have `wrangler` installed locally: `npx wrangler kv namespace create LEADERBOARD`.)

## 2. Add the ID to wrangler.toml

Open `wrangler.toml` and replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` with the
ID from step 1:

```toml
[[kv_namespaces]]
binding = "LEADERBOARD"
id = "your-actual-id-here"
```

## 3. Push to GitHub

Create a new GitHub repo and push this folder's contents to it (this folder
should be the repo root, so `wrangler.toml` is at the top level).

```bash
git init
git add .
git commit -m "Leaderboard test worker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 4. Deploy via "Continue with GitHub" in Cloudflare

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Workers**.
2. Choose **Connect to Git** / **Continue with GitHub**.
3. Authorize and select the repo you just pushed.
4. Cloudflare will detect `wrangler.toml` and use it for build settings — no
   extra config needed since the KV binding is already declared there.
5. Deploy. You'll get a URL like `leaderboard-test.<your-subdomain>.workers.dev`.

Open that URL — you should see the form and an empty table. Submit a few
name/score entries and refresh; they should persist (stored in KV) and sort
by score descending.

## Notes

- Top 20 scores are shown; up to 100 are kept in storage.
- There's a "Clear leaderboard" button on the page for resetting during testing — remove it before using this for anything real.
- KV writes are eventually consistent, so if you fire off two submissions in
  the same instant you may occasionally lose one in a race — fine for a test,
  not something to rely on for a real competitive leaderboard. If you outgrow
  this, swap to Cloudflare D1 (SQLite) instead.
- No auth/rate-limiting — this is a test scaffold, not something to expose
  publicly long-term without adding some.
