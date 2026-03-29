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
The website features an interactive world map guiding users to regional and local chapter pages. It includes robust systems for membership management with tiered subscriptions and award fulfillment, a comprehensive e-commerce platform for merchandise, and a multi-faceted fundraising suite encompassing donations, crowdfunding campaigns, virtual events with ticketing, and auctions/raffles. Content delivery is managed through live news feeds (auto-fetched from Google News RSS every 30 minutes for NUP/Bobi Wine international coverage including worldwide event appearances, via `server/newsFetcher.ts`), member blogs, and a manifesto section. The Events page includes a "Bobi Wine Worldwide Appearances" section with a live news feed filtered for event-related articles (`GET /api/news/events`). The site is built with a modern tech stack utilizing React 18, TypeScript, Tailwind CSS, and a Node.js/Express backend with PostgreSQL and Drizzle ORM. Key UI/UX decisions include NUP red branding, "People Power" messaging, a professional political organization aesthetic, and PWA capabilities for a seamless mobile experience with responsive navigation adapted for different screen sizes. A unique feature is the donation-gated revolutionary songs section, providing exclusive content to supporters.

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
- **Store** (`/admin/store`) — Manage products, pricing, images, inventory; supports custom design orders where customers upload their own artwork
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
- **Orders** (`/admin/orders`) — View all orders, update status/tracking, manage return requests; place test/sample orders for quality control; mark products as quality-checked
- **Gallery** (`/admin/gallery`) — Upload, edit, delete photos; organize by category and album
- **Member Directory** (`/admin/members`) — Search, filter, export registered members

## Printful Webhook
- Endpoint: `POST /api/printful/webhook` — Receives Printful `package_shipped` and `package_returned` events
- Automatically updates order tracking number, carrier, fulfillment status, and order status
- Configure in Printful dashboard: Settings → Webhooks → point to `https://<domain>/api/printful/webhook`

## Return Request System
- Customers can request returns on shipped/delivered orders via the Order Tracking page
- Return request form includes reason selection, details, and item checkboxes
- Admins can approve/deny returns with notes via the Orders admin panel
- API: `POST /api/returns`, `GET /api/returns/:orderId`, `GET /api/admin/returns`, `PATCH /api/returns/:id`
- Schema: `return_requests` table (id, orderId, email, fullName, reason, items, status, adminNotes, createdAt, resolvedAt)

## Store Policies Page
- Public page at `/store/policies` with three sections: Quality Guarantee, Shipping & Delivery Timelines, Returns & Refund Policy
- Quality section details material inspection, print quality, Printful integration, and sample testing standards
- Shipping section shows delivery timelines by region (domestic 5-7 days, international 10-28 days) with costs
- Returns section covers 30-day return window, eligibility rules, 4-step return process, and refund details
- Links to policies from Store page footer and Checkout sidebar
- Contact section with support email and phone

## Admin Quality Control (Test Orders)
- Admin can place test/sample orders from `/admin/orders` via "Place Test Order" button — no payment required
- Test orders marked with `isTestOrder: true` and displayed with orange "QC" badge in orders list
- Quality Control panel on test order detail: add quality notes, mark as quality-passed with green verified badge
- Filter toggle "Test Orders" to show only test orders
- Schema fields: `is_test_order`, `quality_notes`, `quality_checked` on orders table
- Public order endpoint strips admin-only fields (`isTestOrder`, `qualityNotes`, `qualityChecked`) to prevent mass assignment
- API: `POST /api/admin/test-order`, `PATCH /api/admin/orders/:id/quality`

## Self-Service Portals
Chapter and region coordinators can manage their own information via self-service portals:
- `/portal/chapter/:slug` — Chapter coordinators enter an access code to update chapter info (general details, contact, social media, leadership team)
- `/portal/region/:slug` — Region coordinators enter an access code to update region info (general details, contact, social media)
- Access codes are set by admins in `/admin/chapters` and `/admin/regions/:slug`
- Access codes are **never** exposed in public API responses (stripped server-side via `stripAccessCode` helper)
- Portal updates require the access code with each request; slug/id/regionId fields cannot be modified via portal
- New fields added to both regions and chapters: `accessCode`, `websiteUrl`, `facebookUrl`, `twitterUrl`, `whatsappLink`, `instagramUrl`, `youtubeUrl`, `memberCount`, `foundedDate`

## Custom Design Orders
- Customers can upload their own design/artwork at the top of the Store page and select a product type (T-Shirt, Hoodie, Mug, Cap, Tote Bag, Poster, Sticker Pack, Phone Case) with sizes and optional notes
- Design files uploaded to `/uploads/custom-designs/` via `POST /api/upload/custom-design` (supports JPG, PNG, WebP, GIF, SVG, PDF up to 20MB)
- Custom design items are added to the cart with `isCustomDesign: true`, `customDesignUrl`, and `customDesignNotes`
- The order items JSON includes the design URL and notes so admin can view/download the customer's artwork in the Orders admin panel
- Cart hook (`use-cart.ts`) extended with `addCustomDesignToCart()` and `removeCustomDesign()` methods

## Newsletter System
- Admin page at `/admin/newsletter` with two tabs: **Compose** and **Subscribers**
- **Compose tab**: Subject line, content textarea (paragraphs auto-formatted), live preview with NUP branding
- **Send Test**: Send a preview to any email address before sending to all subscribers
- **Send to All**: Sends to all active subscribers with confirmation dialog
- **Subscribers tab**: View, search, activate/deactivate, and delete subscribers
- Newsletter emails use the NUP Diaspora branded template (red header, footer)
- Subscribers come from the footer newsletter signup form (`POST /api/subscriptions`)
- Admin routes: `GET /api/subscriptions`, `DELETE /api/subscriptions/:id`, `PATCH /api/subscriptions/:id`, `POST /api/newsletter/send`
- Email sending uses the existing Nodemailer/SMTP configuration from `server/email.ts`

## SEO & Meta Tags
- **react-helmet-async** used for per-page dynamic meta tags (title, description, keywords, Open Graph, Twitter Cards)
- `HelmetProvider` wraps the entire app in `App.tsx`
- Reusable `SEO` component at `client/src/components/SEO.tsx` with defaults for NUP-related keywords
- All 14+ public pages have unique SEO tags with page-specific titles, descriptions, and keywords
- Utility pages (Checkout, OrderTracking, 404) use `noindex` to prevent search engine indexing
- Structured data (JSON-LD Organization schema) in `client/index.html`
- OG image at `client/public/og-image.png`
- Twitter Cards configured with `summary_large_image` type

## Peer-to-Peer Fundraising
- Campaign supporters can create personal fundraising pages at `/fundraise/:slug`
- Each fundraiser gets a unique shareable link to collect donations on behalf of a campaign
- All donations flow to the main campaign total, with individual tracking per fundraiser
- **Leaderboard** on campaign detail pages shows top fundraisers ranked by amount raised
- **Database**: `campaign_fundraisers` table (id, campaignId, fullName, email, slug, personalMessage, goalAmount, raisedAmount, donorCount, photoUrl, isActive)
- **Campaign donations** have optional `fundraiser_id` column linking donations to their fundraiser
- **API Routes**:
  - `GET /api/campaigns/:slug/fundraisers` — List all fundraisers for a campaign
  - `POST /api/campaigns/:slug/fundraisers` — Create a new fundraiser page
  - `GET /api/fundraisers/:slug` — Get fundraiser details (email stripped for privacy)
  - `GET /api/fundraisers/:slug/donations` — Get donations through a fundraiser (emails stripped)
  - `POST /api/campaigns/:slug/donate` — Now accepts optional `fundraiserId` to attribute donation
- **Frontend pages**: `FundraiserPage.tsx` (individual fundraiser page), updated `CampaignDetail.tsx` with leaderboard + signup dialog

## Membership Card-Style Registration
- The membership registration form at `/membership` is styled to visually resemble filling out an actual NUP membership card
- Red gradient header with NUP logo, "National Unity Platform" title, and People Power logo
- Red/yellow/blue gradient stripe below header (matching NUP brand colors)
- Underline-style form inputs (bottom border only) for a card-fill-in feel
- Fields match the physical card: Surname, Other Names, Date of Birth, Sex, Nationality, Email, Phone, Country, City, Region, Chapter, Membership Type
- Membership number placeholder "NUP-XX-XXXXXX" shown before registration
- White submit button on red footer with "People Power — Our Power" tagline
- The MemberCard display component uses matching NUP card styling after registration
- Database `members` table includes `sex`, `nationality`, `mailingAddress`, `mailingCity`, `mailingState`, `mailingZip`, `mailingCountry` columns
- Mailing address section on the card has a dashed border separator, MapPin icon, and explanatory text about physical card delivery
- MemberCard display shows the full mailing address when provided, separated by a dashed line
- All member data (including mailing address, chapter, region) is stored in the backend and retrievable via the Search tab

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Drizzle ORM**: Used for database interaction.
- **Stripe**: Payment gateway for tickets, donations, and membership subscriptions.
- **Nodemailer**: For sending email notifications via SMTP.
- **Printful**: Integration for merchandise fulfillment.