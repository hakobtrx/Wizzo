# Enable free cross-device quiz sync

The quiz app remains local-only until a Supabase project is connected. Supabase's free plan can provide the database and email-link sign-in used by this integration.

## 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open **Project Settings > API**. Copy the **Project URL** and the public **anon/publishable key**. Do not use or expose the `service_role` key.

## 2. Create the private per-account sync table

Open the SQL Editor in Supabase and run:

```sql
create table if not exists public.quizmaker_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.quizmaker_data enable row level security;
grant select, insert, update on public.quizmaker_data to authenticated;

create policy "Users can read their own quiz data"
on public.quizmaker_data for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own quiz data"
on public.quizmaker_data for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own quiz data"
on public.quizmaker_data for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

If you rerun the policy statements, drop the policies first or run them once per project.

In **Database > Replication**, enable the `quizmaker_data` table for the `supabase_realtime` publication. Realtime lets another signed-in device pick up updates without reloading.

## 3. Add the public project settings

Open `sync-config.js` and set:

```js
window.QUIZ_SYNC_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
};
```

The anon/publishable key is intended for browser apps; row-level security above restricts access to each signed-in user's own row. Never put a service-role key in client code.

## 4. Configure email sign-in and allowed URLs

In Supabase **Authentication ? URL Configuration**, set the site's URL to wherever this app is served. Add that URL to the allowed redirect URLs. Use localhost for development or HTTPS for a deployed site; opening the HTML directly as a `file://` URL is not suitable for email-link authentication.

Check **Authentication ? Providers ? Email** and ensure email OTP/link sign-in is enabled. Supabase's default email sender has low limits, so configure a custom SMTP provider if you need reliable sign-in emails for regular use.

## 5. Sign in on both devices

Serve/deploy the `Quiz` folder, open it on your PC, select **Sync**, and request a sign-in link using your email. Open the link, then use the same email and sign in on your phone. Quiz edits are saved locally and uploaded automatically; updates arriving from the other device are applied live. Local storage remains available when offline.
