# DarksideRF

Don't just track satellites. Listen to them.

Phase 1 is a static React app. Pushing `main` builds it and publishes GitHub Pages, the same way boardscout.io publishes its site. Accounts, Cloudflare Workers and Supabase are later phases. The logbook in this version stays in the browser.

## What is real

- Orbits are a CelesTrak GP snapshot in `src/data/catalogue.json`.
- Downlinks are cited SatNOGS records from that same snapshot. Frequencies are not filled in from memory.
- Passes are predicted in a web worker with satellite.js and SGP4.
- The default station is Cork, a HackRF One, an SDRplay RSPduo and a generic VHF/UHF whip.
- The ARISS SSTV Series 34 entry uses the published date window. Exact UTC times were not announced, so matching passes are labelled potential.

The collection screen opens on a labelled example. It is not your log.

## Local

```bash
npm install
npm run dev
```

## DNS

The domain still needs the Hover records in the previous setup: four GitHub Pages `A` records, the matching `AAAA` records, and `www` as a `CNAME` to `ibecake.github.io`.
