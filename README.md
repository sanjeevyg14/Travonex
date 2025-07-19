# Travonex - Adventure Travel Platform (Version 1.1.0 - Stability & Performance Release)

This is a Next.js starter project for the Travonex platform, built within Firebase Studio. This version has been fully audited for performance and stability.

## Overview

Travonex is a multi-faceted travel platform designed to connect adventurous travelers with trusted trip organizers. It features three distinct user panels:

1.  **User Panel:** For travelers to explore, book, and manage trips.
2.  **Trip Organizer Panel:** For vendors to create listings, manage bookings, and track earnings.
3.  **Super Admin Panel:** For platform administrators to oversee all operations, from user management to financial reporting.

## Getting Started

To get started, take a look at the main application entry point: `src/app/page.tsx`.

For detailed setup instructions, developer notes, and a backend API guide, please refer to **`README2.md`**.

## Environment Setup

Create a `.env` file in the project root with your frontend variables. Copy `backend/.env.example` to `backend/.env` and fill in the database and API keys. Replace placeholder image URLs with real services when moving to production. All application data now comes from the Express backend via the `/api` routes.


## License

This project is licensed under the [MIT License](LICENSE).
