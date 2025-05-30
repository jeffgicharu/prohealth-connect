# ProHealth Connect

ProHealth Connect is a full-stack web application designed to simplify access to wellness services. It offers AI-powered health insights, a seamless service booking system, and integrated payment options via Stripe and M-Pesa, built with Next.js, TypeScript, and Prisma.

[View Live Demo](https://prohealth-connect.vercel.app/)

## Screenshots

![Homepage](./public/images/screenshots/Home.jpg)
![AI Assistant](./public/images/screenshots/AI-Assistant.jpg)
![Bookings Dashboard](./public/images/screenshots/Bookings.jpg)

## Tech Stack

- **Next.js 15 (App Router)**: For its robust full-stack capabilities, server components, and optimized performance.
- **TypeScript**: For type safety and improved developer experience.
- **Prisma ORM**: For intuitive and type-safe database access to PostgreSQL.
- **Tailwind CSS & shadcn/ui**: For rapid UI development with a modern, utility-first approach and accessible components.
- **NextAuth.js**: For handling user authentication seamlessly.
- **Stripe & M-Pesa**: To provide diverse and secure payment options.
- **Google Gemini API**: To power the AI Health Assistant feature.

## Features

- **User Authentication**
  - Secure signup and login with NextAuth.js
  - Protected routes and API endpoints
  - Session management

- **Service Management**
  - Browse available wellness services
  - Detailed service views with pricing
  - Category-based filtering

- **AI Health Assistant**
  - Symptom analysis using Google Gemini
  - Personalized health insights
  - Rate-limited API for optimal performance

- **Booking System**
  - Intuitive service booking interface
  - Real-time availability checking
  - Booking history management

- **Payment Integration**
  - Stripe for card payments
  - M-Pesa STK Push for mobile payments
  - Secure transaction handling

- **User Dashboard**
  - Profile management
  - Booking history and status
  - Payment tracking
  - Service recommendations

- **Additional Features**
  - Responsive design for all devices
  - Form validation with Zod
  - Toast notifications for user feedback
  - Rate limiting for API protection

## UI/UX Enhancements

This project recently underwent a significant UI/UX overhaul based on the "UI-UX Enhancement Plan" to elevate the user experience and visual polish, aiming for a modern, trustworthy, and intuitive health-tech platform suitable for a standout portfolio piece.

**Key Design Principles Guiding the Enhancement:**

* **Clarity & Intuition First:** Ensuring every interaction is understandable and navigation is seamless.
* **Build Trust Through Professionalism & Empathy:** Creating a secure, reliable, and considerate user experience.
* **Modern Simplicity & Seamless Performance:** Adopting a clean visual style with fast, responsive interactions.
* **User-Centric & Accessible by Design:** Focusing on the needs and accessibility for all potential users.

**Highlights of the UI/UX improvements include:**

* A revamped visual identity with consistent application of the brand color palette (Primary Blue: `#2563EB` and its hover state `#1D4ED8`, as defined in `tailwind.config.ts`) and the Poppins font.
* Enhanced depth and dimension on card components (`ServiceCard`, `BookingCard`, auth pages, etc.) using refined shadows, borders, and subtle hover/focus transform effects with smooth transitions.
* Implementation of consistent "reveal on scroll" animations for major page sections and list items using `react-intersection-observer` for a more dynamic and engaging experience.
* Standardized hover effects for buttons (default, outline, link variants now aligned with brand colors) and links, with consistent transition durations.
* Improved and standardized loading state indicators, including spinners on buttons (`LoadingButton`), skeleton loaders for content (`ServicesLoading`), and a new `CenteredSpinnerMessage` component for page/section level loading.
* Refined page layouts and typography for key areas including the Homepage, Services Page (with a new placeholder for filters/search), Service Detail Page, AI Assistant Page (with added guided text), Booking Confirmation Page, Dashboard (Bookings and Profile), Authentication Pages (with new input field icons), and the Payment Page (with new tab icons).
* Enhanced iconography using `lucide-react` for clearer visual communication across the application.
* Significant performance improvements, achieving a Lighthouse performance score of 98%.
* Addressed accessibility issues, including ARIA attribute conformance.

## Getting Started (Local Development)

### Prerequisites

- Node.js (v18.18.0 or later)
- npm (v9.0.0 or later)
- PostgreSQL database instance

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jeffgicharu/prohealth-connect.git
   cd prohealth-connect
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in all required environment variables (see below)

4. Database setup:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini AI
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_SECRET_KEY="sk_test_your_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# M-Pesa Configuration
MPESA_CONSUMER_KEY="your_consumer_key"
MPESA_CONSUMER_SECRET="your_consumer_secret"
MPESA_SHORTCODE="your_shortcode"
MPESA_PASSKEY="your_passkey"
MPESA_TRANSACTION_TYPE="CustomerPayBillOnline"
MPESA_PUBLIC_BASE_URL="your_public_url"
```

## API Endpoints (Brief Overview)

- `POST /api/auth/register` - User registration
- `POST /api/ai/get-symptom-insights` - Get AI health insights
- `POST /api/stripe/create-payment-intent` - Initialize Stripe payment
- `POST /api/mpesa/stk-push` - Initiate M-Pesa STK push

## Challenges & Learnings

- **M-Pesa Integration**: Implementing the M-Pesa STK Push API required careful handling of callbacks and webhooks, teaching valuable lessons about payment gateway integration and security.
- **AI Prompt Engineering**: Fine-tuning the Google Gemini API prompts for accurate health insights while maintaining user privacy and safety was a significant challenge that improved my understanding of AI integration.

## Future Improvements

- Practitioner dashboard for service providers
- Advanced appointment scheduling with calendar integration
- Admin panel for service and user management
- Enhanced AI interactions with medical history context
- Profile picture uploads and social authentication
- Real-time chat support

## Author

Jeff Gicharu

- GitHub: [jeffgicharu](https://github.com/jeffgicharu)
- LinkedIn: [My LinkedIn Profile](https://www.linkedin.com/in/jeff-gicharu-0924a4217/)
