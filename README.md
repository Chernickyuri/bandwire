# Coco Demo MVP - Revenue Management Platform

## Deployment

This project is configured for deployment on Vercel.

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository to Vercel
3. Vercel will automatically detect the Vite framework and configure the build settings
4. The project will be deployed automatically

### Manual Deployment

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Environment Variables

No environment variables are required for this demo. All data is stored in-memory.

---

# Coco Demo MVP

An interactive demo MVP for Coco, a dental clinic management system for Band & Wire Orthodontics.

## Features

- **Consultation Screen**: Patient selection, treatment planning, and payment proposal
- **AI Objection Handling**: Rule-based AI suggestions for handling patient objections
- **Financial Rules Engine**: Automatic validation and enforcement of payment rules
- **Agreement & Signature**: PDF preview and touch-enabled signature canvas
- **Payment Processing**: Mock payment flow with credit card and ACH options
- **Follow-up Management**: Timeline visualization and queue management
- **Admin Panel**: Rules editor and analytics dashboard

## Tech Stack

- React 18 + Vite
- React Router v6
- Tailwind CSS (tablet-first design)
- React Context API for state management

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Demo Flow

1. Start at the **Consultation** screen
2. Select a patient and configure treatment/payment plan
3. Navigate to **Objection Handling** to test AI suggestions
4. Go to **Agreement** to finalize and sign
5. Complete payment in the **Payment** screen
6. Set up follow-ups in the **Follow-up** screen
7. View the **Queue** to see all patients
8. Check the **Admin Panel** for rules and analytics

## Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/         # Main screen components
├── context/         # React Context for global state
├── utils/           # Utilities (AI, rules engine, helpers)
├── data/            # Demo data
└── App.jsx          # Main router
```

## Notes

- This is a demo MVP - all integrations are mocked
- AI responses are rule-based, not from a real LLM
- Payment processing is simulated
- Signature canvas supports both mouse and touch input
- Designed for tablet-first (768px-1024px width)

