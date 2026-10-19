# DarksideRF.com

Radio experimentation. Static site published to GitHub Pages on every push to `main`.

The workflow is [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It uploads [`site/`](site/) the same way [boardscout.io](https://github.com/ibecake/boardscout.io) publishes its frontend: GitHub Actions, then Pages.

Live site, once DNS points here: https://darksiderf.com

## DNS at Hover

Nameservers are still Hover (`ns1.hover.com` / `ns2.hover.com`). Remove the parking `A` record (`216.40.34.41`) and add:

| Type | Host | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `ibecake.github.io` |

`www` must point at `ibecake.github.io`, not at the repository name.
