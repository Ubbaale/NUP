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
The website features an interactive world map guiding users to regional and local chapter pages. It includes robust systems for membership management with tiered subscriptions and award fulfillment, a comprehensive e-commerce platform for merchandise, and a multi-faceted fundraising suite encompassing donations, crowdfunding campaigns, virtual events with ticketing, and auctions/raffles. Content delivery is managed through live news feeds, member blogs, and a manifesto section. The site is built with a modern tech stack utilizing React 18, TypeScript, Tailwind CSS, and a Node.js/Express backend with PostgreSQL and Drizzle ORM. Key UI/UX decisions include NUP red branding, "People Power" messaging, a professional political organization aesthetic, and PWA capabilities for a seamless mobile experience with responsive navigation. A unique feature is the donation-gated revolutionary songs section, providing exclusive content to supporters.

The site also includes a comprehensive CMS admin panel with management sections for chapters, regions, store, events, campaigns, auctions, donations, blog, membership, songs, Printful integration, orders, gallery, member directory, community events, and documentaries. A community events system allows public submissions with admin moderation. A dedicated Documentaries page (`/documentaries`) showcases video documentaries about the struggle for democracy and human rights in Uganda, with YouTube/Vimeo embed support, category filtering, featured highlights, and a full admin CMS at `/admin/documentaries`. Self-service portals are available for chapter and region coordinators to manage their information. Custom design orders allow users to upload artwork for merchandise. A newsletter system allows admins to compose and send newsletters to subscribers.

The entire website supports translation into 22 languages with automatic language detection. Admin authentication is handled via session-based login with environment variable credentials and server-side session storage. SEO is managed with `react-helmet-async` for dynamic meta tags, unique SEO for all public pages, and `noindex` for utility pages. A peer-to-peer fundraising system allows supporters to create personal fundraising pages linked to campaigns. Membership registration is styled as a "membership card" with visual cues and comprehensive data capture. A return request system allows customers to initiate returns, which admins can manage. Store policies pages detail quality guarantees, shipping, and return procedures. Admin quality control features allow for placing test orders and marking them as quality-checked.

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Drizzle ORM**: Used for database interaction.
- **Stripe**: Payment gateway for tickets, donations, and membership subscriptions.
- **Nodemailer**: For sending email notifications via SMTP.
- **Printful**: Integration for merchandise fulfillment.
- **Google Translate**: For website language translation.