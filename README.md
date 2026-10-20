# DarksideRF

Don't just track satellites. Listen to them.

Phase 1 is a static React app. Pushing `main` builds it and publishes GitHub Pages, the same way boardscout.io publishes its site. Accounts, Cloudflare Workers and Supabase are later phases. The logbook in this version stays in the browser.

## What is real

- Orbits are a CelesTrak GP snapshot in `src/data/catalogue.json`.
- Downlinks are active SatNOGS records from that same snapshot. Unconfirmed records are left out. Frequencies are not filled in from memory.
- Passes are predicted in a web worker with satellite.js and SGP4.
- The default station is Cork, a HackRF One, an SDRplay RSPduo and a generic VHF/UHF whip.
- The ARISS SSTV Series 34 entry uses the published date window. Exact UTC times were not announced, so matching passes are labelled potential.

The collection screen opens on a labelled example. It is not your log.

## Notes for imporvement:
- add the tle to the sat card on the listen page on click copy.
- clicking the elevation vizualization needs to bring you to the world map.
- add about and contact page.
- check is it dynamically calculating as its slows down 
