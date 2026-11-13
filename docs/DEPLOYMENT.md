# Deployment notes

## Render — Blueprint

`render.yaml` in the repository root provisions the whole service. Free-plan caveats and
manual steps are documented in the main README ("Deploy on Render").

## Persistence

| Variable | Purpose | Persistent disk |
|---|---|---|
| `DATA_DIR` | JSON complaint store | `/var/data` |
| `UPLOAD_DIR` | Evidence files | `/var/data/uploads` |

On the **free plan** disks are not available: point both variables inside the repo folder and
accept that complaints reset whenever the service restarts or redeploys.

## Resetting the demo

```bash
npm run seed          # local
```

On Render, use the Shell tab of the service and run `npm run seed`. The store also re-seeds
automatically whenever `DATA_DIR/db.json` is missing.

## Hardening before any public use

1. Replace the JSON store with Postgres (Render offers managed Postgres).
2. Move evidence to private object storage with signed URLs and virus scanning.
3. Add CSRF tokens to the two POST forms and rotate `SESSION_SECRET` regularly.
4. Add per-complaint authorisation instead of relying on unguessable filenames.
5. Log officer actions to an append-only audit table.
6. Add rate limiting at the edge (Render/Cloudflare) as well as in-app.
7. Replace the State Emblem artwork with your own branding if publishing widely.
