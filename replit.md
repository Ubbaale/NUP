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
The website features an interactive world map guiding users to regional and local chapter pages. It includes robust systems for membership management with tiered subscriptions and award fulfillment, a comprehensive e-commerce platform for merchandise, and a multi-faceted fundraising suite encompassing donations, crowdfunding campaigns, virtual events with ticketing, and auctions/raffles. Content delivery is managed through live news feeds, member blogs, and a manifesto section. The site is built with a modern tech stack utilizing React 18, TypeScript, Tailwind CSS, and a Node.js/Express backend with PostgreSQL and Drizzle ORM. Key UI/UX decisions include NUP red branding, "People Power" messaging, a professional political organization aesthetic, and PWA capabilities for a seamless mobile experience with responsive navigation. A unique feature is the donation-gated revolutionary songs section, providing exclusive content to supporters. Membership renewal tiers are simplified to two options: NUP Diaspora Gold ($1,000/year) and NUP Diaspora Silver ($500/year), both framed as "Member Renewal" with annual billing, engraved awards (plaque for Gold, crystal for Silver), and tiered benefits.

The site also includes a comprehensive CMS admin panel with management sections for chapters, regions, store, events, campaigns, auctions, donations, blog, membership, songs, Printful integration, orders, advocacy rallies (gallery with photo+video support), member directory, community events, and documentaries. The gallery page has been renamed to "Advocacy Rally Demonstrations" (`/gallery`) and supports both photo and video uploads (MP4, MOV, WebM, AVI up to 500MB), YouTube/Vimeo URL embeds, with categories: Rallies, Demonstrations, Advocacy, Conventions, Community, Leadership, Events. Videos play inline in lightbox with full playback controls. The `gallery_photos` table has a `media_type` column ('image' or 'video'). A community events system allows public submissions with admin moderation. A dedicated Documentaries page (`/documentaries`) showcases video documentaries about the struggle for democracy and human rights in Uganda, with YouTube/Vimeo embed support, category filtering, featured highlights, and a full admin CMS at `/admin/documentaries`. The page includes a "When You See, Speak" section where the public can upload witness videos (abductions, arrests, human rights violations) up to 500MB in high resolution (MP4, MOV, AVI, WebM, MKV). Submissions require admin approval before being published. Admin moderation panel at `/admin/witness-videos` allows approve/reject/delete with submitter details and internal notes. The public API strips personal contact info for privacy. A public articles section ("Voice of the People") at `/articles` lets anyone write and submit articles about the struggle; submissions require admin approval at `/admin/public-articles` before appearing publicly. Articles support cover images, categories (Opinion, Analysis, History, Human Rights, Diaspora Life, Democracy, Culture), featured highlighting, and author bios. Author email is kept confidential. The Fallen Heroes memorial (`/fallen-heroes`) now supports public submissions — anyone can honor a loved one with photo upload, biography, dates, location, cause of death, and relationship to the hero. All submissions go through admin moderation at `/admin/fallen-heroes` with approve/reject workflow, submitter details, and admin notes. Submitter contact info is kept confidential on the public page. A Missing Persons & Prisoners page (`/missing-persons`) documents abducted, detained, and missing Ugandans with photo upload, age, gender, location, date missing, last seen location, and descriptions. Features a hero slideshow with real protest/arrest photos, category filtering (missing/prisoner/abducted/detained), and search. Public submissions go through admin moderation at `/admin/missing-persons`. Self-service portals are available for chapter and region coordinators to manage their information. Custom design orders allow users to upload artwork for merchandise. A newsletter system allows admins to compose and send newsletters to subscribers.

The entire website supports translation into 22 languages with automatic language detection. Admin authentication is handled via session-based login with environment variable credentials and server-side session storage. SEO is managed with `react-helmet-async` for dynamic meta tags, unique SEO for all public pages, and `noindex` for utility pages. A peer-to-peer fundraising system allows supporters to create personal fundraising pages linked to campaigns. Membership registration is styled as a "membership card" with visual cues and comprehensive data capture. A return request system allows customers to initiate returns, which admins can manage. Store policies pages detail quality guarantees, shipping, and return procedures. Admin quality control features allow for placing test orders and marking them as quality-checked.

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Drizzle ORM**: Used for database interaction.
- **Stripe**: Payment gateway for tickets, donations, and membership subscriptions.
- **Nodemailer**: For sending email notifications via SMTP.
- **Printful**: Integration for merchandise fulfillment.
- **Google Translate**: For website language translation.
- **Sharp**: Image compression for gallery photos (WebP output, max 2400px, 85% quality with thumbnails).
- **FFmpeg**: Background video compression (720p H.264, CRF 26, WebP thumbnails).

## File Persistence Architecture
All uploaded files across the site are persisted in PostgreSQL to survive production redeployments:

### Universal File Store (`server/fileStore.ts`)
- **Table**: `file_store (path TEXT PRIMARY KEY, data BYTEA, content_type TEXT, created_at TIMESTAMP)`
- **Auto-persist middleware**: Global `res.on("finish")` middleware in `server/index.ts` automatically stores any multer-uploaded file (`req.file`/`req.files`) to the DB after successful responses
- **Startup migration**: `migrateUploadsToDb()` scans `uploads/` directory and backfills any files not already in DB
- **Serving fallback**: `/uploads/*` middleware tries disk first, then falls back to DB via `getFile()`
- **Covers**: songs, covers, products, leaders, chapter-logos, fallen-heroes, articles, missing-persons, witness-videos, community-events, custom-designs, fundraiser-photos, documents

### Gallery Storage (separate system)
- Gallery images/videos stored as `bytea` in `gallery_photos.image_data`/`thumbnail_data` columns
- Served via `/api/gallery/file/:id` and `/api/gallery/thumb/:id` endpoints
- Upload flow: file → Sharp/FFmpeg compression → binary stored in DB → filesystem files deleted
- YouTube/Vimeo URLs stored as-is (not downloaded)
- Listing queries exclude binary columns for performance