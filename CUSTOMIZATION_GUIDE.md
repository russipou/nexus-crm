# Customizing this template for a new client

This is the checklist to run through every time you duplicate this template
for a new paying client. Follow it in order — branding first, fields second,
deploy last.

---

## 0. Before you touch any code

Run a short discovery conversation with the client and get answers to:

1. What do they call the things they sell/track? ("Products"? "Menu items"?
   "Services"? "Stock"?)
2. What do they call their customers? ("Clients"? "Guests"? "Members"?)
3. What extra info do they need on a product/customer/order that the
   default template doesn't have? (e.g. `expiry_date`, `serving_size`,
   `event_date`, `table_number`)
4. Do they have brand colors/a logo already, or do they want your default
   (turquoise/orange) styling?
5. Roughly how many staff will use it, and do they need different
   permission levels (the template already supports owner/admin/manager/staff)?

Write these down — they're your setup brief and save you from re-discovering
requirements mid-build.

---

## 1. Duplicate the template

**Do not edit the master template repo for a specific client.** Instead:

1. On GitHub, go to the template repo → **Settings** → check
   **"Template repository"** (only needs doing once, ever).
2. For each new client: go to the template repo → click
   **"Use this template" → "Create a new repository"**.
3. Name it clearly, e.g. `client-greenleaf-catering-crm`.

This gives the client a clean, independent repo with no shared git history
back to your template — safer, and avoids ever accidentally pushing one
client's custom code into another's project.

---

## 2. Rebrand (10–15 minutes)

**Colors** — edit ONE file: `frontend/src/index.css`, the `@theme` block at
the top. Change these six values to the client's brand colors:

```css
--color-brand-600   /* darker shade, used for hover states */
--color-brand-500   /* the main brand color */
--color-brand-400   /* lighter accent */
--color-brand-100   /* pale tint, used for badges/backgrounds */

--color-accent-600  /* secondary color, darker */
--color-accent-500  /* secondary color, main */
```

Every button, active nav item, focus ring, and badge in the whole app reads
from these tokens — nothing else needs to change for a basic color reskin.

**Logo** — replace the two files in `frontend/src/assets/`:
- `webelop-logo.png` — full lockup, used as the hero image on the login screen
- `webelop-icon.png` — icon-only mark, used small in the sidebar (crop it
  square with a transparent background so it sits cleanly at 32px)

**Name** — search the frontend for the literal text `"Webelop"` and replace
with the client's product name (currently appears in `AppLayout.jsx`,
`LoginPage.jsx`, and `index.html`'s `<title>`).

---

## 3. Rename terminology (optional, if their language differs)

If the client calls things by different names, this is just text — find and
replace labels in the relevant page file. Common ones:

| Template default | File(s) to check |
|---|---|
| "Customers" | `CustomersPage.jsx`, `AppLayout.jsx` nav |
| "Inventory" / "Products" | `InventoryPage.jsx`, `AppLayout.jsx` nav |
| "Orders" | `OrdersPage.jsx`, `AppLayout.jsx` nav |
| "Tasks" | `TasksPage.jsx`, `AppLayout.jsx` nav |

No backend changes needed for pure relabeling — the underlying model/field
names can stay as `Customer`, `Product`, etc. even if the UI displays a
different word. Only rename model/field names in the backend if it'll
genuinely confuse future-you when reading the code (usually not worth it).

---

## 4. Add client-specific fields (when they need extra data)

This is real (if usually small) backend work. Example: a caterer needs
`event_date` on orders.

1. Add the field to the model, e.g. in `backend/sales/models.py`:
   ```python
   event_date = models.DateField(null=True, blank=True)
   ```
2. Generate and note you'll run the migration:
   ```bash
   python manage.py makemigrations
   ```
3. Add the field to the matching serializer in `serializers.py` (add it to
   the `fields` list).
4. Add the form input to the matching React page (e.g. `OrdersPage.jsx`) —
   copy the pattern of an existing `<Input>` in that form.

Commit and push — Render will pick up the new migration automatically on
next deploy (its build command runs `migrate` every time).

---

## 5. Provision hosting for this client

Each client gets their **own** Render service, Supabase project, and Vercel
project — not shared with other clients. See the main `README.md` sections
3–7 for the full deploy steps; the short version per new client:

1. New Supabase project → grab the Session pooler `DATABASE_URL`
2. New Render service (Blueprint from the client's repo) → set
   `DATABASE_URL`, and after the frontend is deployed, `CORS_ALLOWED_ORIGINS`
   / `CSRF_TRUSTED_ORIGINS` to their Vercel URL
3. New Vercel project (root directory `frontend`) → set `VITE_API_URL` to
   their Render API URL + `/api`
4. Run `python manage.py seed_demo` on their Render shell if they want to
   see the app pre-populated for training, then delete or leave it as their
   first sandbox data

**Before this goes live for a paying client**, seriously consider paid
tiers over free ones — free Render cold-starts (30-60s wake-up delay) and
free Supabase auto-pauses after a week idle. Neither is a good look for a
tool a real business uses daily.

---

## 6. Handoff

Give the client:
- Their live URL
- Login credentials for at least one owner-role account
- A short walkthrough (even a 5-minute screen recording) of adding a
  customer, a product, and an order — this is usually all the "training"
  a small business needs

Keep for yourself:
- The GitHub repo link (so you can push fixes/updates later)
- Their Render/Supabase/Vercel project access (since you're hosting and
  billing monthly)
- A note of what was customized, so future support requests are fast to
  understand
