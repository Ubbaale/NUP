# NUP Diaspora - National Unity Platform Political Website

## Overview
A comprehensive political website for the National Unity Platform (NUP) / People Power Diaspora movement. The site connects Ugandans worldwide in their pursuit of democracy and change in Uganda.

## Key Features
- **Interactive World Map** - Clickable regions (North America, Europe, UK, Canada, Asia, Australia) navigating to local chapters
- **Regional & Chapter Management** - Hierarchical structure with regional leaders on Diaspora Council and independent chapter pages
- **Conference Archive** - Upcoming and past annual conventions with registration links
- **Online Store** - Merchandise shop with shopping cart functionality
- **Membership System** - Registration and secure membership search by ID or email
- **Donation Platform** - One-time and recurring donation support
- **News Feed** - Latest news from Uganda about NUP and Bobi Wine
- **Member Blog** - Verified members can post articles
- **Newsletter Subscription** - Email signup in footer
- **Virtual Events & Ticketing** - Upcoming virtual events (townhalls, concerts, workshops, webinars) with ticket purchase
- **Crowdfunding Campaigns** - Goal-based fundraising with progress bars, donor walls, and campaign donations
- **Membership Tiers** - Tiered subscription plans (Supporter, Advocate, Champion, Ambassador) with benefits and engraved awards (medal, crystal, trophy, plaque) shipped to subscribers
- **Auctions & Raffles** - Auction items with bidding and raffle items with ticket purchases

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Animations**: Framer Motion
- **PWA**: Web App Manifest, Service Worker, iOS/Android installable

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer, MobileNav
│   │   ├── ui/              # shadcn components
│   │   ├── WorldMap.tsx     # Interactive map component
│   │   ├── NewsCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ConferenceCard.tsx
│   │   ├── ChapterCard.tsx
│   │   ├── BlogPostCard.tsx
│   │   └── RevolutionarySongs.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Regions.tsx
│   │   ├── RegionDetail.tsx
│   │   ├── ChapterDetail.tsx
│   │   ├── Conferences.tsx
│   │   ├── ConferenceDetail.tsx
│   │   ├── News.tsx
│   │   ├── Store.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Membership.tsx
│   │   ├── MembershipTiers.tsx
│   │   ├── Donate.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPostDetail.tsx
│   │   ├── VirtualEvents.tsx
│   │   ├── VirtualEventDetail.tsx
│   │   ├── Campaigns.tsx
│   │   ├── CampaignDetail.tsx
│   │   ├── Auctions.tsx
│   │   ├── AuctionDetail.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderTracking.tsx
│   │   ├── PrintfulAdmin.tsx
│   │   └── SongsAdmin.tsx
│   └── App.tsx
server/
├── db.ts                    # Database connection
├── storage.ts               # Data access layer
├── routes.ts                # API endpoints
├── seed.ts                  # Initial data seeding
├── printful.ts              # Printful API integration
└── index.ts
shared/
└── schema.ts                # Drizzle schemas and types
```

## Database Schema
- **members** - Registered NUP members with auto-generated membership IDs, optional cardNumber for existing card holders, card order tracking (cardOrdered, cardOrderedAt, cardPaymentStatus, cardShipping* fields)
- **regions** - 6 global regions with coordinators
- **chapters** - Local chapters within regions (with iconEmoji for landmark icons)
- **chapterLeaders** - Leadership team members per chapter (name, title, bio, email, displayOrder)
  - Chapters have `imageUrl` field for landmark background photos (e.g., Statue of Liberty for NYC, Capitol Building for DC)
- **activities** - Chapter events and activities
- **conferences** - Annual conventions (upcoming and archived)
- **products** - Store merchandise
- **orders** - Purchase orders
- **donations** - Donor records
- **blogPosts** - Member-authored articles
- **newsItems** - Uganda news feed
- **subscriptions** - Newsletter signups
- **councilMembers** - Diaspora council members
- **virtualEvents** - Virtual events (townhalls, concerts, workshops, webinars)
- **eventTickets** - Tickets purchased for virtual events
- **campaigns** - Crowdfunding campaigns with goals and deadlines
- **campaignDonations** - Donations to specific campaigns
- **membershipTiers** - Subscription tier definitions (Supporter, Advocate, Champion, Ambassador)
- **memberSubscriptions** - Active member subscriptions to tiers with shipping address and award tracking
- **auctionItems** - Auction and raffle items
- **bids** - Bids on auction items
- **raffleTickets** - Raffle ticket purchases

## API Endpoints
- `GET /api/regions` - All regions
- `GET /api/regions/:slug` - Single region
- `GET /api/regions/:slug/chapters` - Chapters in region
- `GET /api/chapters` - All chapters
- `GET /api/chapters/:slug` - Single chapter
- `POST /api/chapters` - Create chapter (admin)
- `PATCH /api/chapters/:id` - Update chapter (admin)
- `DELETE /api/chapters/:id` - Delete chapter (admin)
- `GET /api/chapters/:slug/leaders` - Chapter leadership team
- `POST /api/chapters/:id/leaders` - Add leader (admin)
- `PATCH /api/chapter-leaders/:id` - Update leader (admin)
- `DELETE /api/chapter-leaders/:id` - Remove leader (admin)
- `PATCH /api/regions/:id` - Update region info (admin)
- `GET /api/conferences` - All conferences (convention-2026 has dedicated rich page)
- `GET /api/conferences/:slug` - Single conference detail
- `GET /api/products` - All products
- `GET /api/products/:slug/ratings` - Product ratings
- `GET /api/news` - News feed
- `GET /api/blog` - Blog posts
- `POST /api/members` - Register member
- `GET /api/members/search?q=` - Find member
- `POST /api/donations` - Process donation
- `POST /api/subscriptions` - Newsletter signup
- `POST /api/orders` - Place order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/track?orderId=` - Track by order ID
- `GET /api/orders/track?email=` - Track by email
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/ratings` - Submit product rating
- `GET /api/events` - Active virtual events
- `GET /api/events/:slug` - Single event with ticket count
- `POST /api/events` - Create event (admin)
- `PATCH /api/events/:id` - Update event
- `POST /api/events/:slug/tickets` - Purchase ticket
- `GET /api/events/tickets/verify?code=` - Verify ticket
- `GET /api/campaigns` - Active campaigns
- `GET /api/campaigns/:slug` - Single campaign
- `POST /api/campaigns` - Create campaign (admin)
- `POST /api/campaigns/:slug/donate` - Donate to campaign
- `GET /api/campaigns/:slug/donations` - Campaign donor list
- `GET /api/membership-tiers` - All active tiers
- `POST /api/membership-tiers` - Create tier (admin)
- `POST /api/membership/subscribe` - Subscribe to tier
- `GET /api/membership/status?email=` - Check membership status
- `GET /api/auctions` - Active auctions/raffles
- `GET /api/auctions/:slug` - Single auction/raffle item
- `POST /api/auctions` - Create auction item (admin)
- `POST /api/auctions/:slug/bid` - Place bid
- `GET /api/auctions/:slug/bids` - Bid history
- `POST /api/auctions/:slug/raffle-ticket` - Buy raffle tickets
- `GET /api/config/payment` - Check Stripe and email configuration status
- `POST /api/payments/verify` - Verify a Stripe payment intent
- `POST /api/webhooks/stripe` - Stripe webhook handler

## E-Commerce Flow
- **Shopping Cart**: Persistent localStorage cart with quantity controls
- **Checkout**: Multi-step form (Cart Review → Shipping → Payment → Confirmation)
- **Order Tracking**: `/order-tracking` page - search by order ID or email
- **Order Lifecycle**: pending → processing → shipped → out_for_delivery → delivered
- **Product Ratings**: Star ratings + reviews after delivery, per product per order

## Fundraising Modules
- **Virtual Events**: `/events` listing, `/events/:slug` detail with ticket purchase, ticket codes, meeting links revealed post-purchase
- **Crowdfunding Campaigns**: `/campaigns` with progress bars, `/campaigns/:slug` with donation form, donor wall, countdown timers
- **Membership Tiers**: `/membership-tiers` pricing table with 4 tiers (each with an engraved award: medal, crystal, trophy, plaque), 2-step subscribe modal (info → shipping for award), status check by email with award tracking
- **Auctions & Raffles**: `/auctions` listing, `/auctions/:slug` detail with bid forms (auctions) or ticket purchase (raffles), bid history

## Stripe Payment Framework
- Service file: `server/stripe.ts` — handles payment intents for tickets, donations, and memberships
- How to activate: Add `STRIPE_SECRET_KEY` to Replit Secrets; optionally add `STRIPE_WEBHOOK_SECRET` for webhook verification
- When not configured: All transactions are recorded locally without payment collection
- Supports: ticket purchases, campaign donations, membership subscriptions
- Webhook endpoint: `POST /api/webhooks/stripe` — updates ticket payment status on successful payment

## Email Notification Framework
- Service file: `server/email.ts` — sends branded HTML emails via SMTP (nodemailer)
- How to activate: Add `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` to Replit Secrets; optionally `SMTP_PORT`, `FROM_EMAIL`, `FROM_NAME`
- When not configured: Emails are logged to console but not sent
- Email types: ticket confirmations, donation receipts, membership welcome, member registration
- All emails use NUP red branding and "People Power" messaging

## Admin Pages
- `/admin` — Admin Dashboard: central hub with cards linking to all admin sections
- `/admin/regions` — Region management: view all regions, click to manage
- `/admin/regions/:slug` — Per-region admin: edit region info, manage chapters within region, chapter leadership teams
- `/admin/chapters` — Chapter CMS: create/edit/delete chapters, assign to regions, manage leadership teams
- `/admin/store` — Store product management: add/edit/delete products, upload images, toggle stock/featured
- `/admin/printful` — Printful integration management
- `/admin/songs` — Revolutionary songs upload and management
- `/admin/events` — Create/manage virtual events, view Stripe & email config status, toggle active/featured
- `/admin/membership` — Membership subscription dashboard with stats, search/filter, award status management, shipping details view
- `/admin/members` — Member Directory: searchable, filterable, paginated list of all registered members with CSV export and stats dashboard

## PWA (Progressive Web App)
- **Manifest**: `client/public/manifest.json` — app name, icons, theme color, standalone display mode
- **Service Worker**: `client/public/sw.js` — offline caching with SPA navigation fallback, stale-while-revalidate for static assets, network-first for API calls
- **Icons**: 192x192, 384x384, 512x512 PNG icons + apple-touch-icon (180x180) generated from favicon
- **iOS Support**: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, `apple-touch-icon`
- **Android Support**: Web App Manifest with maskable icons, theme-color meta tag
- **Mobile Navigation**: Bottom tab bar (`MobileNav.tsx`) with 5 tabs (Home, Events, Regions, Donate, More) — visible on screens < 1024px
- **More Menu**: Bottom sheet with grid of additional nav items (Campaigns, Conferences, News, Blog, Auctions, Store, Membership, admin pages)
- **Desktop**: Full header nav + footer visible; bottom nav hidden
- **Touch Optimizations**: 44px minimum touch targets, 16px input font (prevents iOS zoom), disabled tap highlight, overscroll prevention
- **Safe Area**: Header handles `safe-area-inset-top`, MobileNav handles `safe-area-inset-bottom` for notched devices

## Theme
- Primary color: Red (NUP party color) - HSL 0 84% 45%
- Uses NUP branding with "People Power" messaging
- Professional political organization aesthetic

## Running the Project
```bash
npm run dev          # Start development server
npm run db:push      # Push schema to database
```

## Environment Variables
- DATABASE_URL - PostgreSQL connection string
- SESSION_SECRET - Session encryption key
- PRINTFUL_API_KEY - Printful API key for automatic order fulfillment (optional — orders queue locally when not set)

## Revolutionary Songs Feature
- Songs section on `/donate` page — donation-gated music player with download
- Admin page: `/admin/songs` — upload, manage, toggle visibility, add cover images
- Donation gate: minimum $20 donation required to play or download songs
- Download formats: MP4 (original), MP3 (Android ringtone), M4R (iPhone ringtone)
- Access tokens stored in localStorage and validated server-side with 1-year expiry
- Song files stored in `uploads/songs/`, cover images in `uploads/covers/`
- Database tables: `revolutionary_songs`, `song_access_tokens`

## Printful Integration
- Admin page: `/admin/printful` — manage connection, link products, view profit margins
- Service file: `server/printful.ts` — handles all Printful API communication
- How to activate: Add PRINTFUL_API_KEY to Replit Secrets, then link each product to its Printful variant via the admin page
- Orders automatically forwarded to Printful on creation (items with linked variants only)
- Fulfillment status tracked separately from order status: not_submitted → submitted → fulfilled
