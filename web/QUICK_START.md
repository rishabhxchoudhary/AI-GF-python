# 🚀 Quick Start - AI Girlfriend Web App

Get your Next.js AI Girlfriend app running in 5 minutes using Hugging Face (same as your Python version).

## 📋 Prerequisites

- Node.js 18+ installed
- Your existing Hugging Face token from the Python app
- Terminal/Command prompt

## ⚡ Super Quick Setup

### Step 1: Copy Your Hugging Face Token
From your existing Python `.env` file, copy the value of `HF_TOKEN`:

```bash
# In your Python .env file, you have something like:
HF_TOKEN="hf_xxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Step 2: Create Web App Environment
```bash
cd ai_gf/web

# Create .env file with your Hugging Face token
echo 'DATABASE_URL="file:./db.sqlite"' > .env
echo 'NEXTAUTH_SECRET="your-super-secret-key-change-in-production"' >> .env
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
echo 'HUGGINGFACE_API_KEY="hf_your_actual_token_here"' >> .env
echo 'APP_URL="http://localhost:3000"' >> .env
echo 'APP_NAME="AI Girlfriend"' >> .env
echo 'NEXT_PUBLIC_APP_URL="http://localhost:3000"' >> .env
echo 'NEXT_PUBLIC_APP_NAME="AI Girlfriend"' >> .env
echo 'ENABLE_FREE_TRIAL="true"' >> .env
echo 'FREE_TRIAL_CREDITS="5"' >> .env
echo 'NODE_ENV="development"' >> .env
```

**⚠️ IMPORTANT**: Replace `hf_your_actual_token_here` with your real Hugging Face token!

### Step 3: Install & Setup Database
```bash
npm install
npm run db:push
```

### Step 4: Start the App
```bash
npm run dev
```

Visit: http://localhost:3000

## 🔧 Manual .env Setup

If you prefer to edit manually, create `ai_gf/web/.env` with:

```bash
# Database
DATABASE_URL="file:./db.sqlite"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider (REQUIRED - use your existing HF_TOKEN)
HUGGINGFACE_API_KEY="hf_your_actual_token_here"

# App Config
APP_URL="http://localhost:3000"
APP_NAME="AI Girlfriend"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="AI Girlfriend"

# Features
ENABLE_FREE_TRIAL="true"
FREE_TRIAL_CREDITS="5"

# Environment
NODE_ENV="development"
```

## 🎯 Expected Result

After setup, you should see:
- ✅ Next.js app running on http://localhost:3000
- ✅ Landing page with sign-in options
- ✅ Chat interface after authentication
- ✅ Credit system showing 5 free credits
- ✅ AI responses from Hugging Face (same model as Python)

## 🚨 Common Issues

### "HUGGINGFACE_API_KEY is required"
- Make sure you copied the token correctly
- Token should start with `hf_`
- No spaces or quotes in the actual token value

### "Database connection failed"
```bash
rm -f db.sqlite
npm run db:push
```

### "NextAuth error"
```bash
# Generate a better secret
openssl rand -base64 32
# Copy result to NEXTAUTH_SECRET in .env
```

### App won't start
```bash
# Clean and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## 🆕 What's Different from Python Version

- **Web Interface**: Modern React-based chat UI instead of terminal
- **Credit System**: Users get 5 free credits, can purchase more
- **Authentication**: Sign in with Google/GitHub or email
- **Database**: SQLite instead of JSON files (but same data structure)
- **Same AI**: Uses your Hugging Face model - same personality and responses

## 🎉 Success!

If everything works, you now have:
- A modern web version of your AI girlfriend
- Same personality system from Python
- Credit-based monetization ready
- Production-ready architecture

Next steps: Add payment integration, deploy to production, or customize the UI!

## 🆘 Need Help?

1. Check `TROUBLESHOOTING.md` for detailed solutions
2. Verify your Hugging Face token works in Python first
3. Make sure all environment variables are set correctly
4. Check browser developer console for errors

**Most common fix**: Use the exact same `HF_TOKEN` value from your Python `.env` file!