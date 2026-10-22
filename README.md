# Campusly — University Learning Platform

A responsive, student-first academic resource hub built with Next.js, TypeScript, Tailwind CSS, and Supabase-ready database scaffolding.

## What works in the local demo

- Responsive dashboard layout for desktop, tablet, and mobile.
- Search across sample resources.
- Filter by notes, slides, question papers, and lab manuals.
- Browse four sample subjects and syllabus progress.
- Bookmark/unbookmark resources in the current page session.
- Contribute a sample note and see it marked as pending review.
- Toast notifications and mobile navigation.
- Demo data means you can run the UI without Supabase credentials.

## Important demo-mode note

This ZIP is a working local UI prototype with a Supabase integration foundation and starter SQL. The sample resources, bookmarks, progress, and upload form use in-memory demo data; they are not persisted to a database and the upload form does not upload a real file. Before using it with real users, connect the pages to Supabase, implement actual authentication and storage operations, finish the authorization policies, and test security as described below.

## Requirements

- Node.js 20.9+ (prefer a currently supported LTS version)
- npm
- Git (optional)

## Run locally

1. Extract the ZIP.
2. Open a terminal in the `campus-learning` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open <http://localhost:3000>.

No environment variables are needed to explore the demo UI.

## Optional: configure Supabase

1. Create a project at <https://database.new/>.
2. Copy `.env.example` to `.env.local`.
3. Add your Supabase project URL and publishable key:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   ```

4. Apply the SQL in `supabase/migrations/` using the Supabase SQL Editor, or install/use the Supabase CLI and apply migrations in your development environment.
5. The SSR helpers are in `src/lib/supabase/`. The demo dashboard intentionally still uses sample data; connect its data operations to Supabase as the next implementation step.

Never put a service-role key in a `NEXT_PUBLIC_` variable or browser code. The service-role key bypasses RLS and should not be used for ordinary user requests.

## Project structure

```text
campus-learning/
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── campus-dashboard.tsx
│   └── lib/
│       ├── demo-data.ts
│       └── supabase/
│           ├── client.ts
│           └── server.ts
├── supabase/
│   └── migrations/
├── .env.example
├── package.json
└── README.md
```

## Design direction

- Calm, light academic workspace with violet accents and generous spacing.
- Clear information hierarchy: subjects first, then recent learning resources.
- Responsive sidebar on desktop and drawer navigation on mobile.
- Search and category filters are easy to reach.
- Resource status labels distinguish demo submissions awaiting review.
- Keyboard focus states and reduced-motion preferences are included.

## Before production

This repository is an MVP starter, not a production-audited learning management system. Complete these tasks before onboarding real students:

- Implement sign-up, login, email verification, password recovery, and role assignment.
- Connect the resource library to PostgreSQL and Supabase Storage.
- Add server-side file validation, file-size limits, MIME checks, signed URLs, and cleanup for deleted files.
- Finish RLS and table grants for every operation, including membership and course administration.
- Protect immutable resource fields and moderation status with narrowly scoped server actions/RPCs or database triggers.
- Enforce cross-table integrity (for example, a resource's topic must belong to its course offering).
- Test anonymous, student, faculty, university-admin, and platform-admin permissions separately.
- Add backups, error monitoring, rate limits, privacy policy, terms, and moderation/report handling.

## Useful commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Next development milestones

1. Connect the university and subject catalogue to Supabase.
2. Add auth and trusted membership provisioning.
3. Implement resource upload to a private storage bucket.
4. Implement moderation via a permission-checked server action/RPC.
5. Add faculty lecture coverage and student progress.
6. Add tests for RLS and storage policies.
7. Deploy a small pilot for one programme and a few subjects.

## Visual refresh (light + dark + balanced 3D)

The refreshed interface includes:

- Persistent light/dark theme toggle (stored in local browser storage).
- A layered CSS 3D hero illustration and hover depth on subject cards. This intentionally uses CSS transforms rather than WebGL so it stays lightweight on student laptops and phones.
- App-like mobile bottom navigation for Home, Subjects, Library, and Saved.
- Dark theme surface, text, border, and card overrides.
- Reduced-motion handling for people who prefer less animation.

The 3D effects are decorative UI effects, not a full navigable WebGL environment. The project remains a demo UI; database authentication, persistent bookmarks, and real file uploads still need to be wired to Supabase.

## Local operational mode (updated)

The local-first mode now supports real file selection and browser-local persistence:

- Bookmarks and contributed-resource metadata persist across reloads in `localStorage`.
- Uploaded PDF, PowerPoint, and Word files (up to 10 MB each) are stored in the browser's IndexedDB and can be downloaded again from the resource row.
- Local contributions are visibly marked as pending review and remain local to the browser profile.
- Theme preference persists across reloads.
- Resource category filters, search, sort order, saved resources, subject navigation, and mobile navigation are interactive.

### Important: local mode is not multi-user production mode

This makes the prototype usable on one browser/device without credentials, but it does not publish data to other students, provide secure accounts, or replace a server-side moderation workflow. Browser storage can be removed by clearing site data, and uploaded files are not backed up. Do not use this mode for sensitive or official student records. For shared use across universities, configure Supabase and implement authenticated uploads, private storage, verified memberships, and database-enforced moderation before launch.
