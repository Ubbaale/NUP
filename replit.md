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

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Animations**: Framer Motion

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── ui/              # shadcn components
│   │   ├── WorldMap.tsx     # Interactive map component
│   │   ├── NewsCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ConferenceCard.tsx
│   │   ├── ChapterCard.tsx
│   │   └── BlogPostCard.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Regions.tsx
│   │   ├── RegionDetail.tsx
│   │   ├── ChapterDetail.tsx
│   │   ├── Conferences.tsx
│   │   ├── ConferenceDetail.tsx
│   │   ├── News.tsx
│   │   ├── Store.tsx
│   │   ├── Membership.tsx
│   │   ├── Donate.tsx
│   │   ├── Blog.tsx
│   │   └── BlogPostDetail.tsx
│   └── App.tsx
server/
├── db.ts                    # Database connection
├── storage.ts               # Data access layer
├── routes.ts                # API endpoints
├── seed.ts                  # Initial data seeding
└── index.ts
shared/
└── schema.ts                # Drizzle schemas and types
```

## Database Schema
- **members** - Registered NUP members with auto-generated membership IDs
- **regions** - 6 global regions with coordinators
- **chapters** - Local chapters within regions
- **activities** - Chapter events and activities
- **conferences** - Annual conventions (upcoming and archived)
- **products** - Store merchandise
- **orders** - Purchase orders
- **donations** - Donor records
- **blogPosts** - Member-authored articles
- **newsItems** - Uganda news feed
- **subscriptions** - Newsletter signups
- **councilMembers** - Diaspora council members

## API Endpoints
- `GET /api/regions` - All regions
- `GET /api/regions/:slug` - Single region
- `GET /api/regions/:slug/chapters` - Chapters in region
- `GET /api/chapters/:slug` - Single chapter
- `GET /api/conferences` - All conferences
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

## E-Commerce Flow
- **Shopping Cart**: Persistent localStorage cart with quantity controls
- **Checkout**: Multi-step form (Cart Review → Shipping → Payment → Confirmation)
- **Order Tracking**: `/order-tracking` page - search by order ID or email
- **Order Lifecycle**: pending → processing → shipped → out_for_delivery → delivered
- **Product Ratings**: Star ratings + reviews after delivery, per product per order

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

## Printful Integration
- Admin page: `/admin/printful` — manage connection, link products, view profit margins
- Service file: `server/printful.ts` — handles all Printful API communication
- How to activate: Add PRINTFUL_API_KEY to Replit Secrets, then link each product to its Printful variant via the admin page
- Orders automatically forwarded to Printful on creation (items with linked variants only)
- Fulfillment status tracked separately from order status: not_submitted → submitted → fulfilled
