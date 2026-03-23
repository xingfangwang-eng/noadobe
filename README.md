# NoAdobe.link - Simplest Design Feedback Tool

Stop paying for Adobe XD. NoAdobe.link is the simplest design feedback tool. Upload, share, and get comments instantly.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your:
   - Project URL
   - anon/public key
3. Create a storage bucket named `designs`
4. Make the bucket public
5. Create the `comments` table in your database. You can run the SQL in `supabase/schema.sql` in the Supabase SQL editor.
6. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

- Drag and drop image upload
- Automatic upload to Supabase Storage
- Unique URL for each design (e.g., noadobe.link/v/unique-id)
- Transparent background preview with checkerboard pattern
- Click anywhere on the image to add comments
- Real-time comment display with hover preview
- No login required - just enter your name
- Simple, brutalist design aesthetic

## Tech Stack

- Next.js 14
- React 18
- Tailwind CSS 4
- Supabase Storage
- TypeScript