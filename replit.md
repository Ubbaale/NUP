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
The website features an interactive world map guiding users to regional and local chapter pages. It includes robust systems for membership management with tiered subscriptions and award fulfillment, a comprehensive e-commerce platform for merchandise, and a multi-faceted fundraising suite encompassing donations, crowdfunding campaigns, virtual events with ticketing, and auctions/raffles. Content delivery is managed through news feeds, member blogs, and a manifesto section. The site is built with a modern tech stack utilizing React 18, TypeScript, Tailwind CSS, and a Node.js/Express backend with PostgreSQL and Drizzle ORM. Key UI/UX decisions include NUP red branding, "People Power" messaging, a professional political organization aesthetic, and PWA capabilities for a seamless mobile experience with responsive navigation adapted for different screen sizes. A unique feature is the donation-gated revolutionary songs section, providing exclusive content to supporters.

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Drizzle ORM**: Used for database interaction.
- **Stripe**: Payment gateway for tickets, donations, and membership subscriptions.
- **Nodemailer**: For sending email notifications via SMTP.
- **Printful**: Integration for merchandise fulfillment.