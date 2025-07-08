# Travonex Platform: Local Setup & Development Guide (VS Code)

This guide provides comprehensive instructions for setting up, running, and developing the Travonex platform frontend on your local machine using Visual Studio Code.

---

## 1. Troubleshooting

### CRITICAL: Fixing the "EADDRINUSE: address already in use" Error

**Symptom:** The application preview fails to start and shuts down unexpectedly. The error log shows `Error: listen EADDRINUSE: address already in use`.

**Cause:** This is a common environment issue, not a bug in the application code. It means another process is already using the port that the Next.js server is trying to run on. This can happen if a previous preview session did not close down properly, leaving a "ghost" process running.

**Solution: Stop and Restart the Preview Environment**

The most effective and guaranteed solution is to fully **Stop** and then **Start** the application preview. This action clears any lingering processes, frees up the occupied port, and allows the new server to start without conflict.

---

## 2. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 20.x or later. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm**: Comes bundled with Node.js.
*   **Visual Studio Code**: The recommended code editor. Download it from [code.visualstudio.com](https://code.visualstudio.com/).
*   **VS Code Extensions (Recommended)**:
    *   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    *   [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
    *   [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## 3. Local Setup Instructions

### Step 3.1: Get the Code
If you have Git installed, clone the repository. Otherwise, download and extract the source code folder.

```bash
git clone <your-repository-url>
cd travonex-platform
```

### Step 3.2: Install Dependencies
Open the project folder in VS Code and run the following command in the integrated terminal (`Ctrl + \` or `Cmd + \``):

```bash
npm install
```
This will install all the necessary packages defined in `package.json`, including Next.js, React, Tailwind, and Genkit.

### Step 3.3: Configure Environment Variables
The application uses environment variables for configuration, particularly for the AI features powered by Genkit.

1.  Create a new file named `.env` in the root of the project.
2.  Add the following line to the `.env` file:

    ```env
    # This key is required for Genkit to communicate with Google AI services.
    # Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
    ```

3.  **Important**: Replace `YOUR_GOOGLE_API_KEY_HERE` with your actual API key from Google AI Studio. The AI-powered "Destination Suggestion" feature will not work without it.

---

## 4. Running the Application Locally

The Travonex platform consists of two main parts that need to run concurrently for full functionality:

1.  **The Next.js Frontend**: The main user interface.
2.  **The Genkit Server**: Powers the AI features.

You will need to open **two separate terminals** in VS Code to run both.

### Terminal 1: Run the Next.js Frontend

```bash
npm run dev
```
This command starts the main web application. Once it's running, you can access it at:
**[http://localhost:3000](http://localhost:3000)**

### Terminal 2: Run the Genkit AI Server

```bash
npm run genkit:dev
```
This command starts the local Genkit server, which provides the AI capabilities used by the frontend. It also launches the Genkit Developer UI, which is useful for debugging and inspecting your AI flows. You can access it at:
**[http://localhost:4000](http://localhost:4000)**

**You must have both servers running to test the complete application.**

---

## 5. Project Structure Overview

Here's a brief overview of the key directories:

*   `src/app/`: The main application code, using Next.js App Router. Each folder represents a route.
    *   `src/app/admin/`: Contains all pages for the Super Admin panel.
    *   `src/app/trip-organiser/`: Contains all pages for the Trip Organizer panel.
    *   `src/app/(user)/`: Contains pages for the public-facing user panel (this is an implicit route group).
*   `src/components/`: Shared React components used across the application.
    *   `src/components/common/`: General-purpose components like Header, Footer, Logo.
    *   `src/components/ui/`: ShadCN UI components (Button, Card, etc.).
    *   `src/components/ai/`: Components related to AI features.
*   `src/ai/`: Genkit configuration and AI flows.
    *   `src/ai/flows/`: The core logic for AI agents (e.g., `destination-suggestion.ts`).
*   `src/lib/`: Utility functions, type definitions, and mock data.
    *   `src/lib/types.ts`: **Crucial file**. Contains all TypeScript type definitions for the application's data models.
    *   `src/lib/mock-data.ts`: Placeholder data used to power the UI before backend integration.
*   `src/context/`: React Context providers for managing global state (e.g., Auth, City).

---

## 6. Notes for Backend Developers

This frontend prototype is designed to be "backend-ready." All UI components and data flows are built with the expectation of being connected to a robust backend API. Here are the key integration points:

### 6.1. Core Data Models
Your database schema should align with the TypeScript types defined in `src/lib/types.ts`. The most critical models to implement are:
*   `User`
*   `Organizer` & `OrganizerDocument`
*   `Trip`, `TripBatch`, `ItineraryItem`, `CancellationRule`, `FAQ`, `Point`
*   `Booking` & `Traveler`
*   `Payout`
*   `PromoCode`
*   `Dispute`
*   `AdminUser` & Roles/Permissions

### 6.2. Authentication
*   **Endpoint:** The frontend expects a single login endpoint (e.g., `POST /api/auth/login`).
*   **Logic:** This endpoint should check the user's credentials against the `AdminUser`, `Organizer`, and `User` tables to determine their role.
*   **Response:** On successful login, the API should return a session token (e.g., JWT) and a user object containing `id`, `name`, `email`, `role`, and `avatar`.
*   **Session Management:** The frontend uses `localStorage` to persist the session. All subsequent API calls should include the token in the `Authorization` header for validation.

### 6.3. Key API Endpoints Expected by the Frontend
The frontend is built to call these (or similar) API endpoints. You will find `// BACKEND:` comments in the code pointing to these specific integration points.

*   **Auth:** `POST /api/auth/login`, `POST /api/auth/signup`, `POST /api/auth/logout`
*   **Users (Public):** `GET /api/trips`, `GET /api/trips/slug/{slug}`, `POST /api/bookings/create`
*   **Users (Authenticated):** `GET /api/users/me/profile`, `PUT /api/users/me/profile`, `GET /api/users/me/bookings`
*   **Organizers:** `GET /api/organizers/me/dashboard`, `GET /api/organizers/me/trips`, `POST /api/trips`, `PUT /api/trips/{id}`, `GET /api/organizers/me/bookings`, `GET /api/organizers/me/payouts`, `POST /api/organizers/me/payouts/request`
*   **Admin:**
    *   `GET /api/admin/dashboard`
    *   `GET /api/admin/trips`, `PATCH /api/admin/trips/{id}`
    *   `GET /api/admin/bookings`, `GET /api/admin/bookings/{id}`
    *   `GET /api/admin/organizers`, `GET /api/admin/organizers/{id}`, `PATCH /api/admin/organizers/{id}/status`
    *   `GET /api/admin/payouts`, `POST /api/admin/payouts/{id}/process`
    *   `GET /api/admin/users`, `PUT /api/admin/users/{id}`
    *   `GET /api/admin/roles`, `POST /api/admin/roles`, `PUT /api/admin/roles/{id}`

### 6.4. Critical Server-Side Validations
**Do not trust the frontend.** The client-side logic is for user experience only. The backend **MUST** re-validate all critical business logic:
*   **Pricing & Payments:** Recalculate the final booking price, including coupon discounts and wallet credits, on the server before processing any payment.
*   **Permissions & Roles:** Every API endpoint must be protected by role-based access control (RBAC). An organizer should not be able to access admin data, and vice-versa.
*   **Cancellation Logic:** The rules for booking cancellations (e.g., refund percentages based on time) must be enforced on the backend.
*   **Booking Availability:** Check `availableSlots` for a trip batch *before* creating a booking to prevent overbooking.

---

## 7. Frequently Asked Questions (FAQs)

**Q: Why do I need to run two servers?**
A: The main application is a Next.js app (`localhost:3000`). The AI features are powered by Google's Genkit, which runs as a separate local server (`localhost:4000`). The Next.js app makes API calls to the Genkit server for things like destination suggestions.

**Q: I get an error about a missing `GOOGLE_API_KEY`. What do I do?**
A: You need to create a `.env` file in the project root and add your Google AI Studio API key to it, as described in Step 3.3.

**Q: Some images are placeholders. How do I change them?**
A: The project uses `https://placehold.co` for mock images. In a production environment, you would integrate a file storage service (like Firebase Storage, AWS S3, or Cloudinary) for image uploads and replace the placeholder URLs with the URLs from your storage service.

**Q: Where is the data stored?**
A: Currently, all data is mocked and lives in `src/lib/mock-data.ts`. The next step is to replace these mock data imports with API calls to your backend database.
