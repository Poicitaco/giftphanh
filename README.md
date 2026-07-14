# Giftphanh

A private collaborative jar of letters for someone special, inspired by the paper-star experience of A Little Jar of Stars.

## Main flows

- Admin signs in with Google, creates one jar for one recipient, moderates letters, seals and opens the jar.
- Friends use a contributor link without an account. Each letter has its own private edit code.
- Contributors can only read approved letters whose writers explicitly share them.
- The recipient sees their name immediately, unlocks the opened jar with a private passcode, then taps individual stars.
- A sender's name and letter are fetched only when the recipient opens that star.

## Local setup

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Apply the SQL files in `supabase/migrations` in filename order, then run:

```bash
npm run check
```

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase Auth/Postgres/RLS, and Vercel.
