# Domain, Email & YouTube Setup Checklist

Plan for moving this landing page to `bangkokbrainimaging.org` with a custom
email and a YouTube channel for recorded talks. (Note: briefly considered
shortening to `bkkbrainimaging.org`, but decided to stick with the full name —
repo's `CNAME` file already matches.)

**Status:** Domain registered on Cloudflare (2026-10-26). DNS (GitHub Pages
pointing, Google Workspace MX/SPF/DKIM) not set up yet. Next up: Section 5
(point the landing page at the new domain) and/or Section 2 (Google Workspace).

## Accounts needed (create these first)

- [ ] **Admin Gmail** — a plain personal (not Workspace) `@gmail.com` account,
      e.g. `bangkokbrainimaging.admin@gmail.com`. Used for: Cloudflare
      login/domain registration, and as a backup/owner on the YouTube Brand
      Account.
      - When Google asks "personal use" vs "business" during signup, choose
        **personal use** — business redirects into a Workspace trial, which
        would tie this recovery account to Workspace billing (defeats the point).
      - Enable 2FA. Store credentials in a password manager shared with
        whoever else needs admin access.

## 1. Register the domain

- [x] Buy `bangkokbrainimaging.org` through **Cloudflare Registrar** directly
      (not via Google Workspace's bundled domain option — that routes through
      Squarespace Domains, costs more, and has a transfer lock). **Done
      2026-10-26.**
- [x] Register using the admin Gmail account above.

## 2. Set up Google Workspace (for info@)

- [ ] Sign up at workspace.google.com using the admin Gmail as the account
      creator.
- [ ] When asked for organization email, use the admin Gmail (not `info@`
      yet — it doesn't exist until Workspace creates it).
- [ ] Enter `bangkokbrainimaging.org` as the domain, verify via **TXT record**.

## 3. DNS records (add in Cloudflare — set Proxy status to DNS-only / grey cloud)

**Verification (temporary):**
| Type | Name | Content |
|---|---|---|
| TXT | `@` | `google-site-verification=...` (from Workspace signup) |

**MX (delete any existing MX first):**
| Type | Name | Priority | Content |
|---|---|---|---|
| MX | `@` | 1 | `ASPMX.L.GOOGLE.COM` |
| MX | `@` | 5 | `ALT1.ASPMX.L.GOOGLE.COM` |
| MX | `@` | 5 | `ALT2.ASPMX.L.GOOGLE.COM` |
| MX | `@` | 10 | `ALT3.ASPMX.L.GOOGLE.COM` |
| MX | `@` | 10 | `ALT4.ASPMX.L.GOOGLE.COM` |

**SPF:**
| Type | Name | Content |
|---|---|---|
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` |

**DKIM** (generate in Admin Console → Apps → Google Workspace → Gmail →
Authenticate email, after Workspace is active):
| Type | Name | Content |
|---|---|---|
| TXT | `google._domainkey` | `v=DKIM1; k=rsa; p=...` (from admin console) |

**DMARC** (add once mail flow is confirmed working):
| Type | Name | Content |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:<admin gmail>` |

## 4. Create the mailbox

- [ ] Admin Console → Users → Add user → `info` → becomes
      `info@bangkokbrainimaging.org`.
- [ ] Verify: `dig MX bangkokbrainimaging.org`, send a test email, check
      mail-tester.com for SPF/DKIM/DMARC pass.

## 5. Point the landing page at the new domain

GitHub Pages is already live for this repo at
`https://p-punyawat.github.io/PMU-Siemens-fMRI/` (confirmed 2026-10-26). Once
the custom domain below is verified in GitHub, that `.github.io` URL will
auto-redirect (301) to the custom domain — no separate content lives at both.

- [ ] Confirm `CNAME` file in this repo stays `www.bangkokbrainimaging.org`
      (already set).
- [ ] Add these DNS records in Cloudflare — **Proxy status: DNS only / grey
      cloud** on all of them (orange-cloud proxying can block GitHub's SSL
      cert issuance until HTTPS is active):

  | Type | Name | Content |
  |---|---|---|
  | CNAME | `www` | `p-punyawat.github.io` |
  | A | `@` | `185.199.108.153` |
  | A | `@` | `185.199.109.153` |
  | A | `@` | `185.199.110.153` |
  | A | `@` | `185.199.111.153` |

- [ ] In the repo: `Settings → Pages` → set custom domain to
      `www.bangkokbrainimaging.org` → save → wait for the DNS check to pass →
      check **Enforce HTTPS** once it becomes available.
- [ ] Verify: `dig www.bangkokbrainimaging.org` resolves to
      `p-punyawat.github.io`. Propagation is usually minutes on Cloudflare;
      the SSL cert can take up to a few hours.

## 6. YouTube Brand Account

- [ ] Create the Brand Account using `info@bangkokbrainimaging.org` as the
      primary manager (matches public-facing identity).
- [ ] In YouTube Studio → Settings → Permissions, add the **admin Gmail** as
      a co-manager/Owner too — don't let the channel depend solely on the
      Workspace mailbox staying active.
