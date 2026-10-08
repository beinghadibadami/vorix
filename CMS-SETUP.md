# Vorix CMS setup

The existing React/Vite website now reads a single published Sanity content snapshot at build time. Original text, images, layouts and CSS are preserved when no Sanity project is configured. Studio lives separately in `studio/`, so its dependencies are not shipped to website visitors.

Connected project: `9mbilmm0`; dataset: `production`. The original content has been imported and validated without errors. The local website build successfully reads this published content.

Hosted editor: https://vorix-9mbilmm0.sanity.studio/

Public website: https://vorix-lemon.vercel.app/

The Vercel environment variables and Sanity-to-Vercel publishing hook have been configured by the site owner. Deploy this CMS integration to the connected production branch before testing the complete publish-to-website flow. A successful webhook alone cannot update content on a deployment running the previous hardcoded website.

## 1. Create the client-owned Sanity project

1. Sign in at [Sanity Manage](https://www.sanity.io/manage) and create a project named **Vorix**.
2. Create a **public** dataset named `production`. The free plan supports public datasets; publish only website content here.
3. Copy the **Project ID** from project settings. The ID is not a password.
4. Invite the client using their own account with the **Administrator** role. This includes content editing and all project settings. The separate Editor role requires a paid plan.

The user created the project; Sanity sign-in, initial content import and Studio deployment are now complete. The instructions below also serve as a setup reference for another computer.

## 2. Configure and seed the editor

Use Node.js 22.12 or newer. In `studio/`, copy `.env.example` to `.env.local` and enter the real project ID:

```dotenv
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

Run inside `studio/`:

```sh
npm ci
npx sanity login
npm run seed
npm run dev
```

The seed command imports the original website into `vorix-website`. It never overwrites an existing published document, and refuses to seed over an existing draft. Original images stay at their existing website paths; no image migration or compression is performed. Each image field has a **Replace image** upload control. Leaving it empty keeps the original; removing a replacement restores the original image.

Open the local Studio URL printed by the command (usually `http://localhost:3333`). If Sanity requests CORS setup, allow exactly that origin with credentials in the project's API settings.

## 3. Connect the website

In the repository root, copy `.env.example` to `.env.local`:

```dotenv
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
```

Do this **after seeding**. A configured project with a missing published website document fails the build rather than unexpectedly replacing live content with defaults.

```sh
npm run check
npm run cms:test
npm run build
npm run preview
```

The root project keeps its existing pnpm lockfile; install website dependencies with `pnpm install --frozen-lockfile` on a fresh checkout. Studio has its own npm lockfile and dependencies. Root `npm run` commands also work with the pnpm-installed dependencies.

Local website development: `npm run dev`. After publishing CMS changes, restart the dev server or run `npm run cms:sync` to refresh its content snapshot. There is no live draft preview in this integration.

## 4. Deploy the editor and enable automatic publishing

From `studio/`, run:

```sh
npm run deploy
```

Choose an available Sanity Studio hostname when prompted. Give the resulting `https://<chosen-name>.sanity.studio` link to the client. This is a separate dashboard, not a new route in the public site. Retain the hostname/deployment configuration recorded by the CLI for future Studio deployments.

In the **existing Vercel website project**:

1. Add `SANITY_PROJECT_ID` and `SANITY_DATASET` to the applicable environment(s).
2. Keep the existing build command and output directory from `vercel.json`.
3. Create a Deploy Hook for the production branch in **Settings → Git → Deploy Hooks**. Keep this URL private.
4. In **Sanity Manage → project → API → Webhooks**, add a POST webhook pointing to that Deploy Hook.
5. Select dataset `production`; enable Create, Update and Delete triggers. Disable draft and version events. Use this filter:

```groq
_type == "websiteContent" && _id == "vorix-website"
```

6. Deploy the website once. Then edit a small field in Studio and publish to verify the complete flow. Confirm the automatic Vercel deployment succeeds and the changed text appears; restore the field afterward if it was only a test.

Publishing updates the site **after a successful deployment**, not immediately. Saved drafts do not reach the public website. The client does not need GitHub or Vercel for everyday content edits. Someone with deployment access should check failed builds if a published change does not appear.

## Client editing guide

Open **Edit Vorix website**, choose a tab, edit, then **Publish**:

- **Page text:** expand the relevant section to edit its wording. Fields are labelled with the original wording to help locate them. Separate heading fields preserve the existing emphasis and line breaks. Keep text roughly the same length for the best fit.
- **Hero & background images:** replace the main hero or process image.
- **Products:** add/reorder category cards and format entries; edit their text and images. Category cards and detailed product ranges are separate lists because that is how the original site is arranged. Update both when adding a full product family. Image identity does not depend on product names.
- **Process & quality:** edit/reorder the eight process steps and four quality highlights. Their counts remain fixed to preserve the diagram and grid.
- **FAQs:** add, edit, remove or reorder questions. FAQ search-engine markup updates from the same content.
- **Journal:** edit/add/reorder the existing journal summary cards. Full article pages, cover images and publication dates are not part of the current website.
- **Contact & navigation:** edit email addresses, phone number, Instagram details and the three navigation links. Addresses and footer wording are in Page text.
- **SEO:** edit page titles and descriptions for the existing routes.

The logo remains the existing styled wordmark; its words are editable under Page text → Brand name. Layouts, animations and decorative artwork stay in code. New page types or features still require development. Existing inquiry form behaviour is unchanged: it currently shows a confirmation locally and does not send email or store submissions. CMS setup does not add a form backend.

## Reliability and checks

- `client/src/content/defaults.json` contains the original site content.
- `scripts/sync-content.mjs` fetches only published content from the uncached Sanity API and writes the ignored `client/src/content/generated.json` before building.
- Both prerendered HTML and browser hydration import this exact snapshot, including SEO/FAQ data.
- The Vite production preview serves the generated route HTML for clean URLs, matching the existing Vercel setup and avoiding homepage/route hydration mismatches during local testing.
- Configured API errors and malformed content fail the new build, leaving Vercel's previous successful deployment live. Missing optional fields inherit their original values. An unconfigured project uses all original defaults.
- No CMS write token is needed by the website. A private dataset can use a server-only `SANITY_READ_TOKEN`; never add `VITE_` or `SANITY_STUDIO_` to secret variable names.
- Studio hides duplicate/delete/unpublish actions on the single website document to reduce accidental changes. This is an editing convenience, not a restriction on an Administrator's project permissions.
- Run `npm run check`, `npm run cms:test`, `npm run build`, and Studio's `npm run check` / `npm run build` after future code changes.

Official references: [Studio deployment](https://www.sanity.io/docs/studio/deployment), [Sanity roles](https://www.sanity.io/docs/content-lake/roles-concepts), [Vercel Deploy Hooks](https://vercel.com/docs/deploy-hooks).
