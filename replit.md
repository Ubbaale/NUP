# NUP Diaspora - National Unity Platform Political Website

## Overview
The NUP Diaspora website serves as a central hub for the National Unity Platform / People Power Diaspora movement, connecting Ugandans globally to promote democracy and change in Uganda. It aims to foster community, facilitate fundraising, disseminate information, and manage membership for a worldwide audience. The project envisions significant market potential by mobilizing and unifying the Ugandan diaspora through a comprehensive digital platform.

## User Preferences
- I want iterative development.
- Ask before making major changes.
- I prefer detailed explanations for complex solutions.
- I do not want the AI to make changes to the `server/stripe.ts` file without explicit instruction.
- I do not want the AI to make changes to the `server/email.ts` file without explicit instruction.

## System Architecture
The website features an interactive world map guiding users to regional and local chapter pages. It includes robust systems for membership management with tiered subscriptions and award fulfillment, a comprehensive e-commerce platform for merchandise, and a multi-faceted fundraising suite encompassing donations, crowdfunding campaigns, virtual events with ticketing, and auctions/raffles. Content delivery is managed through live news feeds (auto-fetched from Google News RSS every 30 minutes for NUP/Bobi Wine international coverage, via `server/newsFetcher.ts`), member blogs, and a manifesto section. The site is built with a modern tech stack utilizing React 18, TypeScript, Tailwind CSS, and a Node.js/Express backend with PostgreSQL and Drizzle ORM. Key UI/UX decisions include NUP red branding, "People Power" messaging, a professional political organization aesthetic, and PWA capabilities for a seamless mobile experience with responsive navigation adapted for different screen sizes. A unique feature is the donation-gated revolutionary songs section, providing exclusive content to supporters.

## Admin Authentication
The admin panel (`/admin` and all `/admin/*` routes) is protected by session-based login:
- Credentials stored as environment variables: `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- Server-side session storage in PostgreSQL via `connect-pg-simple`
- All admin API routes protected by `requireAdmin` middleware (POST/PATCH/DELETE operations + sensitive GET endpoints like `/api/members`, `/api/members/search`, `/api/members/stats`, `/api/members/export`, `/api/membership/subscriptions`)
- Frontend uses `AdminAuthProvider` context + `AdminGuard` component to gate admin routes
- Session regeneration on login to prevent session fixation
- `trust proxy` set to `1` in Express for proper secure cookie handling behind Replit's TLS-terminating reverse proxy
- `SESSION_SECRET` env var ensures session persistence across server restarts
- Login page: `client/src/pages/AdminLogin.tsx`
- Auth provider: `client/src/components/AdminAuthProvider.tsx`
- Sessions expire after 24 hours

## CMS Admin Panels
The admin dashboard at `/admin` provides a comprehensive CMS with 14 management sections:
- **Chapters** (`/admin/chapters`) — Create, edit, delete chapters; manage leadership teams; upload logos/photos
- **Regions** (`/admin/regions`, `/admin/regions/:slug`) — Manage regions, coordinators, access codes
- **Store** (`/admin/store`) — Manage products, pricing, images, inventory
- **Events** (`/admin/events`) — Create/edit virtual events, view ticket sales
- **Conferences** (`/admin/conferences`) — Manage conferences/conventions (create, edit, delete)
- **Campaigns** (`/admin/campaigns`) — Manage fundraising campaigns, view campaign donations
- **Auctions & Raffles** (`/admin/auctions`) — Manage auction items and raffles, view bids
- **Donations** (`/admin/donations`) — View all general donations with stats (read-only)
- **Blog** (`/admin/blog`) — Create, edit, publish/unpublish, delete blog posts
- **Membership** (`/admin/membership`) — View subscriptions and award fulfillment
- **Membership Tiers** (`/admin/tiers`) — Manage tier pricing, benefits, awards, display order
- **Songs** (`/admin/songs`) — Upload and manage revolutionary songs
- **Printful** (`/admin/printful`) — Print-on-demand fulfillment integration
- **Member Directory** (`/admin/members`) — Search, filter, export registered members

## Self-Service Portals
Chapter and region coordinators can manage their own information via self-service portals:
- `/portal/chapter/:slug` — Chapter coordinators enter an access code to update chapter info (general details, contact, social media, leadership team)
- `/portal/region/:slug` — Region coordinators enter an access code to update region info (general details, contact, social media)
- Access codes are set by admins in `/admin/chapters` and `/admin/regions/:slug`
- Access codes are **never** exposed in public API responses (stripped server-side via `stripAccessCode` helper)
- Portal updates require the access code with each request; slug/id/regionId fields cannot be modified via portal
- New fields added to both regions and chapters: `accessCode`, `websiteUrl`, `facebookUrl`, `twitterUrl`, `whatsappLink`, `instagramUrl`, `youtubeUrl`, `memberCount`, `foundedDate`

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Drizzle ORM**: Used for database interaction.
- **Stripe**: Payment gateway for tickets, donations, and membership subscriptions.
- **Nodemailer**: For sending email notifications via SMTP.
- **Printful**: Integration for merchandise fulfillment.