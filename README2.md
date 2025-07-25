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

**Important:** Run `npm install` before executing commands like `npm run lint` to avoid errors such as `next: command not found`. If you work with the Express backend, run `cd backend && npm install` in that folder before using its scripts.

If system libraries required by the tests are missing (for example `libssl1.1` used by `mongodb-memory-server`), you can run the bundled setup script which installs them along with project dependencies:

```bash
bash scripts/setup.sh
```
The script installs Node.js 20, the OpenSSL 1.1 library and runs `npm install` in both the root and `backend` directories.

### Step 3.3: Configure Environment Variables
The application uses environment variables for configuration, particularly for the AI features powered by Genkit.

1.  Create a new file named `.env` in the root of the project.
2.  Add the following lines to the `.env` file:

    ```env
    # This key is required for Genkit to communicate with Google AI services.
    # Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    NEXT_PUBLIC_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
    CORS_ORIGIN=http://localhost:3000
    NEXT_PUBLIC_BASE_URL=http://localhost:3000

    # Firebase client SDK configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
    ```

3.  **Important**: Replace `YOUR_GOOGLE_API_KEY` with your actual API key from Google AI Studio, and set `YOUR_RAZORPAY_KEY_ID` to the key from your Razorpay dashboard. `CORS_ORIGIN` should be the URL of your frontend (e.g., `http://localhost:3000`). Fill in the Firebase values with the details from your Firebase project if you deploy your own instance.

### Step 3.4: Backend Environment Variables
The Express backend in the `backend` folder uses its own `.env` file. Copy `backend/.env.example` to `.env` inside that folder and fill in your MongoDB URI, Firebase service account credentials, JWT secret, and Razorpay keys.

> **Note**: The `.env.example` files in this repository contain dummy values. Copy them to `.env` and replace each placeholder with your real credentials before running the project.

### Step 3.5: Set `BACKEND_URL`
The Next.js API routes in `src/app/api` proxy requests to your backend server. Specify its base URL in the same `.env` file created in Step&nbsp;3.3.

```env
BACKEND_URL=http://localhost:5000
```

Replace `http://localhost:5000` with the address of your deployed backend when running in production.

---

## 4. Running the Application Locally

The Travonex platform consists of two main parts that need to run concurrently for full functionality:

1.  **The Next.js Frontend**: The main user interface.
2.  **The Genkit Server**: Powers the AI features.

You will need to open **two separate terminals** in VS Code to run both.

If you are integrating the optional Express backend, open a **third terminal** for it.

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

### Terminal 3: Run the Express Backend

```bash
cd backend && npm install
npm run dev
```
This starts the REST API server using Express and MongoDB. It listens on **http://localhost:5000** by default and exposes endpoints consumed by the frontend, including payment order creation via Razorpay.

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
*   `src/lib/`: Utility functions and type definitions.
    *   `src/lib/types.ts`: **Crucial file**. Contains all TypeScript type definitions for the application's data models.
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
*   **Signup:** Users and organizers register using phone number verification. The frontend obtains a Firebase ID token after OTP verification and sends it to `POST /api/auth/signup` along with the user's name, email, and desired role. The signup page is available at `/auth/signup` (the former `/auth/otp-signup` route now simply redirects here).
*   **Login:** Phone-based logins also use Firebase verification. After confirming the OTP, the frontend sends the resulting ID token as the `credential` in `POST /api/auth/login`.
    On success, the API responds with a `redirectPath` indicating the role-specific
    dashboard (`/trip-organiser/dashboard` for organizers, `/` for regular users, or
    `/admin/dashboard` for admins). The frontend automatically navigates to this
    path after storing the session token.
*   **Signup:** Users and organizers register with their name, email, and password. Phone verification is not required.
*   **Phone Verification:** During signup, the client verifies the phone number with Firebase and sends the resulting `idToken` to `POST /api/auth/signup`. The backend validates this token using the Firebase Admin SDK before creating the account.

### 6.3. Key API Endpoints Expected by the Frontend
The frontend is built to call these (or similar) API endpoints. You will find `// BACKEND:` comments in the code pointing to these specific integration points.

*   **Auth:** `POST /api/auth/login`, `POST /api/auth/signup`, `POST /api/auth/logout`
*   **Users (Public):** `GET /api/trips`, `GET /api/trips/slug/{slug}`, `POST /api/bookings/create` (preferred) or `POST /api/bookings`
*   **Payments:** `POST /api/payments/create-order`, `POST /api/payments/verify`
*   **Users (Authenticated):** `GET /api/users/me/profile`, `PUT /api/users/me/profile`, `GET /api/users/me/bookings`
*   **Organizers:** `GET /api/organizers/me/dashboard`, `GET /api/organizers/me/trips`, `POST /api/trips`, `PUT /api/trips/{id}`, `DELETE /api/trips/{id}`, `GET /api/organizers/me/bookings`, `GET /api/organizers/me/payouts`, `POST /api/organizers/me/payouts/request`
*   **Admin:**
    *   `GET /api/admin/dashboard`
    *   `GET /api/admin/trips`, `PATCH /api/admin/trips/{id}`
    *   `GET /api/admin/bookings`, `GET /api/admin/bookings/{id}`
    *   `GET /api/admin/organizers`, `GET /api/admin/organizers/{id}`, `PATCH /api/admin/organizers/{id}/status`
    *   `GET /api/admin/payouts`, `POST /api/admin/payouts/{id}/process`
    *   `GET /api/admin/access/users`, `PUT /api/admin/access/users/{id}`
    *   `GET /api/admin/access/roles`, `POST /api/admin/access/roles`, `PUT /api/admin/access/roles/{id}`

### 6.4. Critical Server-Side Validations
**Do not trust the frontend.** The client-side logic is for user experience only. The backend **MUST** re-validate all critical business logic:
*   **Pricing & Payments:** Recalculate the final booking price, including coupon discounts and wallet credits, on the server before processing any payment.
*   **Permissions & Roles:** Every API endpoint must be protected by role-based access control (RBAC). An organizer should not be able to access admin data, and vice-versa.
*   **Cancellation Logic:** The rules for booking cancellations (e.g., refund percentages based on time) must be enforced on the backend.
*   **Booking Availability:** Check `availableSlots` for a trip batch *before* creating a booking to prevent overbooking.

---

## 7. Running Tests

Before running the tests, install dependencies in **both** the project root and the
`backend` folder:

```bash
npm install
cd backend && npm install
```

After the dependencies are installed, use the root `test` script to run the backend
test suite:

```bash
npm test
```

This command runs `npm --prefix backend test`, executing the tests located in the
`backend` directory.

## Deploying to Google Cloud Run

The backend can be containerized and deployed on **Google Cloud Run** for automatic scaling and load balancing. A sample `Dockerfile` is located in the `backend` folder. Build and run it locally with:

```bash
docker build -t travonex-backend ./backend
docker run -p 8080:8080 travonex-backend
```

To deploy, configure a Cloud Build trigger in Google Cloud that builds this container and deploys it to Cloud Run. Set the service port to `8080` as defined in the `Dockerfile`.


---

## 8. Frequently Asked Questions (FAQs)

**Q: Why do I need to run two servers?**
A: The main application is a Next.js app (`localhost:3000`). The AI features are powered by Google's Genkit, which runs as a separate local server (`localhost:4000`). The Next.js app makes API calls to the Genkit server for things like destination suggestions.

**Q: I get an error about a missing `GOOGLE_API_KEY`. What do I do?**
A: You need to create a `.env` file in the project root and add your Google AI Studio API key to it, as described in Step 3.3.

**Q: Some images are placeholders. How do I change them?**
A: The project uses `https://placehold.co` for mock images. In a production environment, you would integrate a file storage service (like Firebase Storage, AWS S3, or Cloudinary) for image uploads and replace the placeholder URLs with the URLs from your storage service.

**Q: Where is the data stored?**
A: All data is served by the Express backend and accessed through the Next.js `/api` routes. The old `src/lib/mock-data.ts` file is no longer used.
