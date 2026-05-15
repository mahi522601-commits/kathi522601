# Khyathi Collections

Monorepo for the Khyathi Collections storefront and backend API.

## Apps

- `client/` React 18 + Vite frontend
- `server/` Express + Firebase Admin + ImgBB API

## Scripts

- `npm run dev` starts both apps
- `npm run dev:client` starts the storefront
- `npm run dev:server` starts the API
- `npm run build` builds the client

## Notes

- The server supports a mock in-memory datastore in development when Firebase Admin credentials are not configured yet.
- Admin-protected routes require real Firebase Admin credentials for production use.
