# Domain, Email & YouTube Setup Checklist

Plan for moving this landing page to `bangkokbrainimaging.org` with a custom
email and a YouTube channel for recorded talks. (Note: briefly considered
shortening to `bkkbrainimaging.org`, but decided to stick with the full name —
repo's `CNAME` file already matches.)

**Status:** Domain registered on Cloudflare and live on GitHub Pages
(2026-10-26) — `https://www.bangkokbrainimaging.org` is serving the site over
HTTPS, apex redirects correctly.

**Email decision:** going with **Option B — free Cloudflare Email Routing +
Gmail send-as** (not paid Google Workspace). Implementation is underway as of
2026-10-26 — see Section 2 Option B below for exact progress. Reminder: since
`info@` isn't its own Google Account under this option, the admin Gmail is
the YouTube Brand Account owner (Section 6).

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

## 2. Set up email for info@ — pick ONE option

### Option A — Google Workspace (paid)

- [ ] Sign up at workspace.google.com using the admin Gmail as the account
      creator.
- [ ] When asked for organization email, use the admin Gmail (not `info@`
      yet — it doesn't exist until Workspace creates it).
- [ ] Enter `bangkokbrainimaging.org` as the domain, verify via **TXT record**.
- [ ] Continue with the Workspace DNS records and mailbox creation in
      Section 3A / 4A below.

### Option B — Cloudflare Email Routing (free) — **in progress, chosen path**

Forwards `info@bangkokbrainimaging.org` straight to the admin Gmail inbox, no
paid mailbox needed. Gmail's free "Send mail as" feature (relayed through
Gmail's own SMTP with an App Password) lets you send/reply *as* that address
too.

- [x] In the Cloudflare dashboard, select `bangkokbrainimaging.org` → **Email**
      → **Email Routing** → click **Get started** / **Enable Email Routing**.
      Cloudflare auto-adds the MX and SPF (TXT) records it needs — see
      Section 3B, no manual DNS entry required for this part.
- [x] Under **Destination addresses**, add the admin Gmail address and click
      the verification link Cloudflare emails to it.
- [x] Under **Routing rules** → **Custom addresses**, add a rule:
      `info@bangkokbrainimaging.org` → **Action: Send to** → the verified
      admin Gmail address.
      - Optional: also add a **Catch-all address** rule (routes anything
        `@bangkokbrainimaging.org` not explicitly matched, e.g. a typo'd
        address) to the same Gmail, so nothing silently bounces.
- [x] On the **admin Gmail** account, enable **2-Step Verification**:
      Google Account → Security → 2-Step Verification.
- [x] Still under Security, generate an **App Password** (e.g. named "Custom
      SMTP") → copy the 16-character password shown. This is what lets Gmail
      relay mail through its own SMTP server on behalf of the custom address
      — no third-party SMTP service needed.
- [x] In Gmail → Settings (gear icon) → **See all settings** → **Accounts and
      Import** tab → **Send mail as** → **Add another email address**.
      - Name: whatever should show as the sender (e.g. "Bangkok Brain
        Imaging Symposium").
      - Email: `info@bangkokbrainimaging.org`.
      - Click **Next Step**.
- [x] On the SMTP screen, filled in:
      - **SMTP Server:** `smtp.gmail.com`
      - **Port:** `587`
      - **Username:** the full admin Gmail address
      - **Password:** the App Password from above
      - **Secured connection using TLS**
      - Click **Add Account**.
      - Hit a `534-5.7.9 WebLoginRequired` auth error on first try — fixed by
        visiting `accounts.google.com/DisplayUnlockCaptcha` (logged in as the
        admin Gmail account) and retrying within ~10 minutes.
- [x] Gmail sent the confirmation email **to** `info@bangkokbrainimaging.org`
      — Cloudflare forwarded it to the same Gmail inbox, verified from there.
      **`info@bangkokbrainimaging.org` now shows as an alias in Gmail
      (confirmed 2026-10-26).**
- [ ] Back in **Send mail as** settings, optionally set
      `info@bangkokbrainimaging.org` as the **default "from" address** for
      new emails composed from this account.
- [x] Test: send an email to `info@bangkokbrainimaging.org` from another
      address and confirm it lands in the admin Gmail inbox. Then compose a
      new email in Gmail, switch the "From" field to `info@...`, and send a
      test to confirm the reply-as works. **Confirmed working end-to-end
      2026-10-26.**

**Source:** [How I Set Up a Free Professional Email for My Domain Using
Cloudflare](https://slycreator.medium.com/how-i-set-up-a-free-professional-email-for-my-domain-using-cloudflare-f1a3c157acbd)
— this is the exact method being followed.

With Option B, skip Section 4A (no separate mailbox to create in an admin
console) and use the admin Gmail as the YouTube Brand Account owner in
Section 6, since `info@` isn't its own Google Account under this option.

## 3. DNS records

### 3A — if using Google Workspace (add these manually in Cloudflare)

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

### 3B — if using Cloudflare Email Routing (added automatically)

Cloudflare writes these for you when you enable Email Routing in Section 2
Option B — no manual entry needed. Listed here just so they're recognizable
later if you're auditing the DNS zone:

| Type | Name | Content (approximate — Cloudflare generates the exact value) |
|---|---|---|
| MX | `@` | `route1.mx.cloudflare.net` (priority 24-ish) |
| MX | `@` | `route2.mx.cloudflare.net` |
| MX | `@` | `route3.mx.cloudflare.net` |
| TXT | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` |

If Option A (Workspace) was set up previously, remove its MX/SPF records
first — a domain can only have one active mail-routing configuration at a
time.

## 4. Create the mailbox

### 4A — Google Workspace only

- [ ] Admin Console → Users → Add user → `info` → becomes
      `info@bangkokbrainimaging.org`.
- [ ] Verify: `dig MX bangkokbrainimaging.org`, send a test email, check
      mail-tester.com for SPF/DKIM/DMARC pass.

### 4B — Cloudflare Email Routing only

Already covered in Section 2 Option B above (destination verification +
routing rule + Gmail "Send mail as"). Nothing further here.

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
- [x] Verify: `dig www.bangkokbrainimaging.org` resolves to
      `p-punyawat.github.io`. Propagation is usually minutes on Cloudflare;
      the SSL cert can take up to a few hours. **Confirmed live 2026-10-26** —
      `https://www.bangkokbrainimaging.org` returns 200, apex redirects to it
      over HTTPS.

## 6. YouTube Brand Account

**If Option A (Google Workspace) was used:**
- [ ] Create the Brand Account using `info@bangkokbrainimaging.org` as the
      primary manager (matches public-facing identity).
- [ ] In YouTube Studio → Settings → Permissions, add the **admin Gmail** as
      a co-manager/Owner too — don't let the channel depend solely on the
      Workspace mailbox staying active.

**If Option B (Cloudflare Email Routing) was used:**
- [x] `info@bangkokbrainimaging.org` is not its own Google Account, so create
      the Brand Account using the **admin Gmail** as the primary manager
      instead. **Done 2026-10-26.**
- [ ] Set the channel's public contact email (About page) to
      `info@bangkokbrainimaging.org` for branding — this is independent of
      which Google Account manages the channel.

**Plan status: effectively complete.** Domain, hosting, email, and YouTube
are all live. The one remaining optional item above (channel contact email)
can be done anytime directly in YouTube Studio.
