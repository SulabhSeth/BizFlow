# BizFlow

Simple bakery management for small and home bakeries — customers, orders,
payments and invoices in one place.

## Stack

Next.js (App Router) · TypeScript · React · Tailwind CSS v4 · Supabase (Postgres + Auth) · Lucide icons

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase project keys
npm run dev
```

## Project structure

```
app/         routes (App Router)
components/  ui/ (reusable primitives) and layout/ (app shell)
lib/         formatting, validation schemas, Supabase client factories
types/       shared TypeScript types, incl. generated Supabase types
actions/     Server Actions grouped by domain
supabase/    SQL migrations and RLS policies
```
