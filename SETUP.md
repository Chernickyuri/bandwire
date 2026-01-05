# Setup Instructions

## Prerequisites

You need Node.js installed to run this project. If you don't have it:

1. **Download Node.js**: Visit https://nodejs.org/ and download the LTS version
2. **Install Node.js**: Run the installer and follow the prompts
3. **Verify Installation**: Open a new terminal and run:
   ```bash
   node --version
   npm --version
   ```

## Running the Demo

Once Node.js is installed:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to the URL shown (typically `http://localhost:5173`)

## Demo Scenario Walkthrough

### Scenario: Complete Patient Journey

**Goal**: Walk through a full patient consultation, handle an objection, finalize agreement, process payment, and set up follow-up.

#### Step 1: Start Consultation
- Navigate to **Consultation** screen (default landing page)
- **Select Patient**: Choose "John Doe" or "Emily Smith" from dropdown
- **Treatment**: "Braces – Full Treatment" (default, editable)
- **Total Cost**: $5,000 (default, editable)
- **Payment Plan**: 
  - Down Payment: $1,000
  - Installments: 12 months
  - Monthly Payment: $333.33 (auto-calculated)

#### Step 2: Test Financial Rules
- Try entering invalid values:
  - Set Down Payment to $300 → See error: "Minimum down payment is $500"
  - Click "Fix with AI" → Auto-adjusts to $500
  - Set Installments to 30 → See error: "Maximum installment duration is 24 months"
  - Click "Fix with AI" → Auto-adjusts to 24 months

#### Step 3: Handle Objection
- Click "Continue to Objection Handling"
- Enter objection: **"This is too expensive, I can't afford it right now"**
- Click "Get AI Suggestion"
- **AI Response**:
  - Explanation of the suggestion
  - Suggested changes: Lower down payment ($500), longer term (24 months)
  - Coordinator script provided
- Click "Apply Suggestion" → Returns to Consultation with updated plan

#### Step 4: Finalize Agreement
- Navigate to **Agreement** screen
- Review the PDF preview showing:
  - Patient information
  - Treatment plan
  - Payment details
- Click "Finalize Agreement"

#### Step 5: Sign Agreement
- Signature canvas appears
- Draw signature using mouse or touch
- Click "Sign" button
- Agreement is signed successfully

#### Step 6: Process Payment
- Navigate to **Payment** screen
- Select payment method: **Credit Card** or **ACH**
- Fill in payment details (all fake/mocked):
  - Credit Card: Any numbers (e.g., 1234 5678 9012 3456)
  - Or ACH: Routing and account numbers
- Click "Pay $500" (or your down payment amount)
- **Success Screen** shows:
  - Transaction ID (e.g., STRIPE_TXN_12345)
  - Elapsed time (~5 minutes)
  - Payment confirmation

#### Step 7: Set Follow-up
- Navigate to **Follow-up** screen
- Select Status: **"Patient wants to think"** → Sets to "Observation"
- Select Sequence: **"Standard 7-day follow-up"**
- Click "Activate Follow-up Sequence"
- **Timeline appears**:
  - Day 1: SMS sent ✓ (completed)
  - Day 3: Reminder (active)
  - Day 7: Final follow-up (pending)

#### Step 8: View Queue
- Navigate to **Queue** screen
- See table with all patients:
  - Patient names
  - Status (Observation, Signed, Paid, etc.)
  - Last contact dates
  - Next actions
  - Response states

#### Step 9: Admin Panel
- Navigate to **Admin** screen
- **Rules Editor**:
  - Adjust Minimum Down Payment (e.g., change to $600)
  - Adjust Maximum Installments (e.g., change to 18 months)
  - Click "Save Rules" → Rules apply instantly
- **Analytics Dashboard**:
  - Conversions today: 2/5 (40%)
  - Payment success: 100%
  - Avg decision time: 1 day
  - Monthly revenue forecast: $45,000

### Quick Test Scenarios

#### Test AI Objection Handling
Try different objections to see varied AI responses:
- "too expensive" → Suggests lower down payment, longer term
- "can't afford" → Suggests minimum down payment
- "need time to think" → Suggests flexible payment structure
- "monthly payment too high" → Reduces monthly amount

#### Test Rules Engine
- Enter down payment below $500 → See validation error
- Enter installments above 24 → See validation error
- Use "Fix with AI" buttons → Auto-corrects to valid values

#### Test Signature
- Use mouse to draw signature
- Use touch (on tablet) to draw signature
- Clear and redraw
- Sign to proceed

### Navigation Tips

- Use the top navigation bar to jump between screens
- All screens are connected - no dead ends
- State persists across navigation (patient selection, payment plan, etc.)
- Back buttons available where needed

## Troubleshooting

**Port already in use?**
- Vite will automatically try the next available port
- Check the terminal output for the actual URL

**Dependencies won't install?**
- Make sure you have Node.js 16+ installed
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

**Styles not loading?**
- Make sure Tailwind CSS compiled correctly
- Check browser console for errors

