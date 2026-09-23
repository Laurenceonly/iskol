# ISKOL

ISKOL is a student workspace for keeping subjects, class schedules, and notes together. It uses Next.js, Tailwind CSS, and Supabase for authentication and data.

## Features

- Student dashboard with subjects, pending work, and today's classes
- Subjects with recurring weekly class schedules
- Calendar with month and week views
- Notes that can be linked to subjects
- Profile settings and light/dark theme
- Email/password sign-in, email confirmation, and password recovery
- Admin overview with user status controls

## Run locally

1. Clone this repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set your Supabase project URL and publishable (or legacy anon) key:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
   ```

3. Connect a Supabase project with the required database schema and access policies. The app uses `profiles`, `subjects`, `subject_schedules`, `notes`, and `tasks`. Admin features call `get_admin_analytics`, `get_admin_growth`, `get_admin_users`, and `admin_set_user_status`. This repository does not currently include migrations for creating these tables and functions.

4. Add your local URL to the allowed redirect URLs in Supabase Auth if you use email confirmation or password recovery. The app sends users to `/auth/confirmed` after sign-up confirmation and `/auth/reset-password` for recovery.

5. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npm run build
```

The app uses the Next.js App Router. Protected student pages are checked by `proxy.ts`; admin access is checked on the admin page. Supabase Row Level Security policies should enforce access to user data in the database as well.
