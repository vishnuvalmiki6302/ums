# Deploy CMS Backend to Vercel

## 1. Set Root Directory

In Vercel Dashboard → your project → **Settings** → **General** → **Root Directory**:

- Set to: **`server`**
- Save

This makes Vercel use the `server` folder (where `server.js` and `package.json` live).

## 2. Environment Variables

In **Settings** → **Environment Variables**, add:

| Name | Value |
|------|--------|
| `MONGODB_URL` | Your MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net`) |
| `JWT_SECRET` | A long random secret for JWT |
| `SENDER_EMAIL` | Email used for sending (e.g. Brevo) |
| `SMPT_USER` | SMTP user (Brevo) |
| `SMPT_PASS` | SMTP password |
| `UNIVERSITY_CODE` | (Optional) Admin registration code |

## 3. Deploy

Push to your connected Git repo, or run:

```bash
cd server
npx vercel
```

Your API will be at: `https://your-project.vercel.app/`

- Health: `GET /` → `{ "message": "API Working 🚀" }`
- Auth: `/api/auth/*`
- Students: `/api/students/*`
- etc.

## Notes

- **Notes uploads**: PDFs are stored in MongoDB (no disk). Download via `GET /api/notes/download/:id`.
- **Root Directory** must be `server` so Vercel finds `server.js` and `package.json`.
