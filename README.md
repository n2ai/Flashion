# Flashion 👗

An AI-powered mobile app that helps you mix and match outfits from your personal wardrobe.

## Features

- 👤 **Authentication** — Sign up, log in, forgot password & reset password flow via Supabase Auth
- 🔐 **Account Settings** — Change password securely with current password verification
- 🤖 **AI Outfit Matching** — Pick clothes from your closet and let AI suggest outfit combinations

## Tech Stack

**Frontend**
- React Native (Expo)
- Expo Router (file-based routing)
- TypeScript

**Backend**
- Node.js + Express
- Supabase (Auth + Database)

## Project Structure

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgotPassword.tsx
│   └── resetPassword.tsx
├── (tabs)/
│   └── ...
backend/
├── config/
│   └── supabase.js
├── routes/
│   └── change-password.js
```

## Getting Started

### Prerequisites
- Node.js
- Expo CLI
- Supabase project

### Installation

1. Clone the repo
```bash
git clone https://github.com/n2ai/Flashion.git
cd Flashion
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables — create a `.env` file in the root:
```
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

4. Start the app
```bash
npx expo start
```

### Backend

```bash
cd backend
npm install
node index.js
```

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_BACKEND_URL` | URL of the backend server |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key (backend only) |

## Notes

- Uses **Expo Dev Client** for deep link support — the password reset flow requires a development build, not Expo Go
- Supabase Dashboard → Authentication → Redirect URLs must whitelist:
  - `flashion://resetPassword`
  - `exp://*` (for local development)