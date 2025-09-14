# AI Girlfriend - Next.js Web Application

A modern, full-stack AI girlfriend application built with the T3 stack featuring dynamic personality evolution, relationship progression, and a credit-based monetization system.

## 🚀 Features

- **Dynamic AI Personality**: Evolving personality traits based on user interactions
- **Relationship Progression**: 4-stage relationship system with milestone tracking
- **Credit-Based Monetization**: Secure payment system with Stripe integration
- **Real-time Chat**: WebSocket-powered conversations with typing indicators
- **Memory System**: Persistent conversation history and emotional moments
- **Agentic Behaviors**: Proactive, human-like AI responses
- **Multi-Provider AI**: Hugging Face with OpenAI fallback
- **Modern UI**: Responsive design with dark/light theme support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **API**: tRPC for type-safe APIs
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + tRPC React Query
- **Payments**: Stripe
- **AI**: Hugging Face Inference API + OpenAI
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Main app pages
│   ├── (marketing)/        # Landing & pricing pages
│   ├── api/                # API routes
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── chat/              # Chat interface
│   └── personality/       # Personality management
├── server/                # tRPC server
│   ├── api/routers/       # API routers
│   ├── auth.ts            # Authentication config
│   └── db.ts              # Database client
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
└── trpc/                  # tRPC client setup
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account
- OpenAI API key
- Hugging Face API key
- Google/GitHub OAuth apps

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_girlfriend"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# AI Providers
OPENAI_API_KEY="sk-your-openai-api-key"
HUGGINGFACE_API_KEY="hf_your-huggingface-token"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"

# Optional Stripe Price IDs
STRIPE_STARTER_PRICE_ID="price_starter_id"
STRIPE_POPULAR_PRICE_ID="price_popular_id"
STRIPE_PREMIUM_PRICE_ID="price_premium_id"
STRIPE_ULTIMATE_PRICE_ID="price_ultimate_id"

# Application
APP_URL="http://localhost:3000"
FREE_TRIAL_CREDITS="5"
```

### 2. Installation

```bash
npm install
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 4. Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔨 Build Fixes Applied

The following critical issues were resolved:

### Authentication (NextAuth v5 Compatibility)
- ✅ Fixed NextAuth.js v5 import and configuration issues
- ✅ Updated adapter type compatibility with proper casting
- ✅ Corrected session and callback configurations
- ✅ Fixed module augmentation for custom session properties

### TypeScript Errors
- ✅ Fixed 'unknown' type issues in personality router
- ✅ Resolved private property access in PersonalityManager class
- ✅ Fixed null vs undefined type mismatches in credits router
- ✅ Added proper typing for function parameters and return types
- ✅ Fixed implicit 'any' type issues throughout the codebase

### Import and Path Issues
- ✅ Corrected import paths for components and utilities
- ✅ Fixed metadata object syntax in layout.tsx
- ✅ Added proper Metadata type import from Next.js
- ✅ Resolved circular dependency issues

### Code Quality
- ✅ Applied consistent formatting and style
- ✅ Added proper error handling
- ✅ Fixed duplicate function declarations
- ✅ Ensured all functions follow single responsibility principle
- ✅ Added descriptive variable names for wider scope

## 💳 Credit System

The application includes a complete monetization system:

### Credit Packages
- **Starter**: 10 credits - $4.99
- **Popular**: 50 credits - $19.99 (20% bonus)
- **Premium**: 100 credits - $34.99 (30% bonus)
- **Ultimate**: 250 credits - $79.99 (35% bonus)

### Credit Usage
- Chat message: 1 credit
- Premium features: 2-5 credits
- New users get 5 free trial credits

## 🧠 AI Personality System

### Personality Traits (15 traits)
- Confidence, Romantic Intensity, Playfulness
- Vulnerability, Assertiveness, Curiosity
- Empathy, Spontaneity, Possessiveness
- Loyalty, Sensuality, Intelligence
- Humor, Emotional Intensity, Independence

### Relationship Stages
1. **New** - Getting to know each other
2. **Developing** - Building connection
3. **Established** - Strong bond formed
4. **Intimate** - Deep emotional connection

### Memory System
- Conversation history tracking
- Inside jokes and references
- Emotional moments recognition
- User preference learning

## 🔗 API Routes

### tRPC Routers
- `/api/trpc/auth` - Authentication management
- `/api/trpc/chat` - Chat messages and conversations
- `/api/trpc/personality` - Personality trait management
- `/api/trpc/relationship` - Relationship progression
- `/api/trpc/credits` - Credit management
- `/api/trpc/payments` - Stripe payment processing
- `/api/trpc/memory` - Memory and conversation history

## 📱 Key Components

### Chat Interface
- Real-time messaging with typing indicators
- Credit balance display
- Message history with infinite scroll
- Responsive mobile-first design

### Personality Dashboard
- Visual trait representation
- Relationship stage tracking
- Memory timeline
- Analytics and insights

### Payment System
- Stripe Checkout integration
- Purchase history
- Credit usage tracking
- Automatic credit deduction

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm run start
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📊 Database Schema

Key models include:
- `User` - User profiles with credits and AI data
- `Conversation` - Chat message storage
- `Purchase` - Payment transactions
- `CreditUsage` - Credit consumption tracking
- `UserActivity` - Analytics and user behavior

## 🔒 Security Features

- Secure authentication with NextAuth.js
- API rate limiting
- Input validation with Zod
- SQL injection prevention with Prisma
- Content moderation with OpenAI
- CSRF protection

## 📈 Analytics

- User engagement tracking
- Credit usage patterns
- Revenue analytics
- Conversion rate monitoring
- A/B testing ready

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all environment variables are set
2. **Database Issues**: Check PostgreSQL connection and run migrations
3. **Auth Issues**: Verify OAuth app configurations
4. **Payment Issues**: Check Stripe webhook endpoints

### Getting Help

- Check the console for detailed error messages
- Ensure all dependencies are installed
- Verify environment variables are correctly set
- Review the API documentation in `/api/trpc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the code quality standards in `.rules`
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using the T3 Stack