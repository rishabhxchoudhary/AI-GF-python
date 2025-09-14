# AI Girlfriend App - Troubleshooting Guide

This guide helps you resolve common issues when setting up and running the AI Girlfriend application.

## 🚨 Quick Fix for Hugging Face API Key Error

If you're getting this error:
```
OpenAIError: The OPENAI_API_KEY environment variable is missing or empty
```

This means the app is trying to use OpenAI when it should use Hugging Face (like your Python version).

### Solution:
1. **Get a Hugging Face API Token**:
   - Visit https://huggingface.co/settings/tokens
   - Create a new token (same one you use for your Python app)
   - Copy the token (starts with `hf_`)

2. **Add it to your .env file**:
   ```bash
   # Create or edit your .env file in the web directory
   cd ai_gf/web
   touch .env
   ```

3. **Add the token to .env** (this matches your Python setup):
   ```
   HUGGINGFACE_API_KEY="hf-your-actual-token-here"
   NEXTAUTH_SECRET="generate-this-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   DATABASE_URL="file:./db.sqlite"
   ```

4. **Restart your development server**:
   ```bash
   npm run dev
   ```

## 🔧 Common Issues and Solutions

### 1. Database Connection Issues

**Error**: `DATABASE_URL is not defined`
```bash
# Add to .env file
DATABASE_URL="file:./db.sqlite"

# Then run database setup
npm run db:push
```

### 2. NextAuth Configuration Issues

**Error**: `NEXTAUTH_SECRET is not defined`
```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env file
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Credit System Not Working

**Error**: Credits not deducting or showing
- Check that `ENABLE_FREE_TRIAL` is set to `"true"`
- Ensure user has credits in database
- Verify tRPC endpoints are working

### 4. AI Responses Not Working

**Symptoms**: 
- Getting fallback responses only
- AI not responding at all

**Solutions**:
1. **Check API Keys**:
   ```bash
   # Test Hugging Face connection (primary provider)
   curl -H "Authorization: Bearer YOUR_HF_TOKEN" \
        https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium
   ```

2. **Check Provider Status**:
   - Navigate to `/api/test-providers` (if available)
   - Check browser console for errors
   - Verify HUGGINGFACE_API_KEY is loaded

3. **Fallback Configuration**:
   ```bash
   # Add backup provider (optional)
   OPENAI_API_KEY="sk_your-openai-key-here"
   ```

### 5. Stripe Payment Issues

**Error**: Payment processing not working
```bash
# Add Stripe configuration
STRIPE_SECRET_KEY="sk_test_your-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

### 6. Session/Auth Issues

**Symptoms**:
- Users can't log in
- Session not persisting

**Solutions**:
1. **Check Auth Configuration**:
   ```bash
   # Verify in .env
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Clear Browser Data**:
   - Clear cookies and local storage
   - Try incognito mode

3. **Database Issues**:
   ```bash
   # Reset database schema
   npm run db:reset
   npm run db:push
   ```

### 7. Build/Compilation Errors

**Error**: TypeScript or build errors

**Solutions**:
1. **Clear Next.js Cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Update Dependencies**:
   ```bash
   npm install
   npm audit fix
   ```

3. **Check Environment Variables**:
   ```bash
   # Validate env vars
   npm run build
   ```

## 🛠️ Development Setup Checklist

- [ ] Node.js 18+ installed
- [ ] `.env` file created with required variables
- [ ] OpenAI API key configured
- [ ] Database initialized (`npm run db:push`)
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)

## 📋 Required Environment Variables

### Minimum Required:
```bash
DATABASE_URL="file:./db.sqlite"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
HUGGINGFACE_API_KEY="hf_your-token-here"
```

### For Full Features:
```bash
# AI Providers (Hugging Face is primary)
HUGGINGFACE_API_KEY="hf_..."
OPENAI_API_KEY="sk_..."  # Optional fallback

# Stripe Payments
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 🔍 Debugging Steps

### 1. Check Environment Variables
```bash
# In your terminal - check Hugging Face token (primary provider)
node -e "console.log(process.env.HUGGINGFACE_API_KEY ? 'HF Token found' : 'HF Token missing')"

# Check OpenAI key (fallback provider) 
node -e "console.log(process.env.OPENAI_API_KEY ? 'OpenAI Key found' : 'OpenAI Key missing')"
```

### 2. Test Database Connection
```bash
npm run db:studio
```

### 3. Verify API Endpoints
Visit these URLs in your browser:
- http://localhost:3000/api/auth/providers
- http://localhost:3000/api/trpc/health (if available)

### 4. Check Server Logs
- Look for errors in terminal where `npm run dev` is running
- Check browser developer console
- Monitor network requests for failed API calls

### 5. Test AI Providers
```javascript
// In browser console (on your app)
fetch('/api/test-ai', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

## 🆘 Getting Help

### Before asking for help:
1. Check this troubleshooting guide
2. Look at terminal/console errors
3. Verify environment variables
4. Try clearing cache and restarting

### Where to get help:
- GitHub Issues
- Discord/Community channels
- Stack Overflow with relevant tags

### Information to include:
- Error message (full stack trace)
- Your environment (.env structure, no keys!)
- Node.js version (`node --version`)
- Operating system
- Steps to reproduce

## 📁 File Structure Check

Make sure your project structure looks like this:
```
ai_gf/web/
├── .env                 # Your environment variables
├── .env.example         # Template file
├── package.json         # Dependencies
├── prisma/
│   └── schema.prisma    # Database schema
├── src/
│   ├── app/            # Next.js app router
│   ├── lib/            # Utilities
│   ├── server/         # tRPC server
│   └── types/          # TypeScript types
└── public/             # Static assets
```

## 🔄 Reset Everything (Nuclear Option)

If nothing works, try a clean reset:

```bash
# Stop the server (Ctrl+C)

# Clean everything
rm -rf .next
rm -rf node_modules
rm -f db.sqlite
rm -f package-lock.json

# Reinstall
npm install

# Reset database
npm run db:push

# Restart
npm run dev
```

⚠️ **Warning**: This will delete your local database and all data!

## 📞 Quick Contact

If you're still stuck, make sure you have:
1. A valid Hugging Face API token (same one from your Python app)
2. All required environment variables set
3. Latest dependencies installed
4. Database properly initialized

The most common issue is missing HUGGINGFACE_API_KEY. Use the same token from your Python .env file!