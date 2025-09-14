# T3 Stack AI Girlfriend Application - Complete Migration & Implementation Prompt

You are an expert full-stack engineer tasked with analyzing the existing Python AI Girlfriend application and recreating it as a modern, production-ready Next.js application using the T3 stack. 

## 📋 Your Mission

**FIRST:** Thoroughly analyze the entire existing Python repository at `/Users/rishabh/Desktop/ai_gf/` to understand:
- Current architecture and all components
- All personality management features (15+ traits)  
- Relationship progression system (4 stages)
- Temporal awareness behaviors
- Memory system and conversation history
- Agentic behaviors and human-like responses
- AI integration patterns
- Data structures and storage

**SECOND:** Create a complete T3 stack implementation in a new `/web` folder that replicates ALL functionality with modern web technologies.

## 🛠️ Required Tech Stack (T3 Stack + Adaptations)

### Core T3 Components
- **Framework**: Next.js 14+ (App Router) 
- **Language**: TypeScript (strict mode)
- **API**: tRPC for type-safe APIs
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **ORM**: Prisma (adapted for DynamoDB)
- **Validation**: Zod schemas

### Additional Required Technologies  
- **Database**: AWS DynamoDB (single-table design)
- **State Management**: Zustand + tRPC React Query
- **UI Components**: shadcn/ui
- **AI Integration**: Hugging Face + OpenAI (fallback)
- **Real-time**: Server-Sent Events or WebSockets
- **Deployment**: Vercel

## 📁 Target Project Structure

```
/web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (dashboard)/
│   │   │   ├── chat/
│   │   │   ├── personality/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── trpc/
│   │   │   └── webhooks/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── chat/
│   │   ├── personality/
│   │   └── layout/
│   ├── server/                       # tRPC server
│   │   ├── api/
│   │   │   ├── routers/
│   │   │   │   ├── chat.ts
│   │   │   │   ├── personality.ts
│   │   │   │   ├── relationship.ts
│   │   │   │   ├── memory.ts
│   │   │   │   └── temporal.ts
│   │   │   ├── root.ts
│   │   │   └── trpc.ts
│   │   ├── auth.ts
│   │   └── db.ts
│   ├── lib/
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── db.ts                     # DynamoDB client
│   │   ├── ai.ts                     # AI service clients
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── types/
│   │   ├── personality.ts
│   │   ├── relationship.ts
│   │   ├── memory.ts
│   │   └── database.ts
│   ├── hooks/
│   ├── stores/                       # Zustand stores
│   └── trpc/                         # tRPC client setup
├── prisma/
│   └── schema.prisma                 # For type generation (DynamoDB adapter)
├── prompts/                          # AI system prompts (migrated)
├── public/
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── components.json
├── package.json
└── README.md
```

## 🏗️ Implementation Requirements

### 1. Python Code Analysis & Migration
Analyze each Python file and recreate equivalent TypeScript modules:

```typescript
// Example: Migrate personality_manager.py to tRPC router
// server/api/routers/personality.ts
export const personalityRouter = createTRPCRouter({
  getPersonality: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Replicate PersonalityManager functionality
    }),
    
  updateTraits: privateProcedure
    .input(PersonalityUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      // Replicate trait evolution logic
    }),
});
```

### 2. DynamoDB Single-Table Design
Create a Prisma schema that works with DynamoDB adapter:

```typescript
// prisma/schema.prisma (for type generation)
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  personality   Json?         // Personality traits object
  relationship  Json?         // Relationship state
  memories      Memory[]
  conversations Conversation[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Conversation {
  id        String   @id @default(cuid())
  userId    String
  messages  Json     // Array of message objects
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

// Actual DynamoDB table structure
interface DynamoRecord {
  PK: string          // USER#{userId} | CONV#{conversationId}
  SK: string          // PROFILE | MEMORY#{type} | MSG#{timestamp}
  GSI1PK?: string     // EMAIL#{email} | TIME#{date}
  GSI1SK?: string     // USER | CONV
  type: string        // user | personality | relationship | memory | conversation
  data: any           // Actual record data
  ttl?: number        // Auto-expire for old conversations
}
```

### 3. tRPC Router Structure
Create comprehensive tRPC routers that replicate all Python functionality:

```typescript
// server/api/root.ts
export const appRouter = createTRPCRouter({
  auth: authRouter,
  chat: chatRouter,
  personality: personalityRouter,
  relationship: relationshipRouter,
  memory: memoryRouter,
  temporal: temporalRouter,
  agentic: agenticRouter,
});

// Example chat router replicating main.py chat logic
export const chatRouter = createTRPCRouter({
  sendMessage: privateProcedure
    .input(z.object({
      message: z.string(),
      conversationId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Analyze user message (replicate analyze_and_update_from_text)
      // 2. Update personality traits
      // 3. Check relationship progression
      // 4. Generate AI response with context
      // 5. Store conversation
      // 6. Return response with typing simulation
    }),
    
  getConversationHistory: privateProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      // Replicate conversation loading logic
    }),
});
```

### 4. Real-time Chat Interface
Create modern chat UI with typing indicators:

```typescript
// components/chat/ChatInterface.tsx
export function ChatInterface() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  
  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: (response) => {
      // Simulate typing with delays like Python version
      simulateTypingResponse(response);
    }
  });
  
  const { data: conversations } = api.chat.getConversationHistory.useQuery();
  
  return (
    <div className="flex h-screen flex-col">
      <ChatHeader />
      <MessageList messages={conversations?.messages || []} />
      <TypingIndicator isVisible={sendMessage.isLoading} />
      <MessageInput 
        value={message}
        onChange={setMessage}
        onSend={() => sendMessage.mutate({ message })}
        disabled={sendMessage.isLoading}
      />
    </div>
  );
}
```

### 5. Personality Management System
Recreate the dynamic personality system:

```typescript
// stores/personalityStore.ts
interface PersonalityState {
  traits: Record<string, number>;
  archetype: string;
  moodModifiers: Record<string, number>;
  lastUpdated: Date;
}

export const usePersonalityStore = create<PersonalityState>((set, get) => ({
  // Replicate all PersonalityManager methods
  updateTraits: (interaction: InteractionContext) => {
    // Port trait evolution logic from Python
  },
  
  getPersonalityContext: () => {
    // Generate context for AI prompts
  },
}));
```

### 6. AI Integration with Multiple Providers
Replicate the AI client system:

```typescript
// lib/ai.ts
interface AIProvider {
  generateResponse(prompt: string, options?: any): Promise<string>;
  isAvailable(): boolean;
}

class HuggingFaceProvider implements AIProvider {
  // Port HF integration from Python
}

class OpenAIProvider implements AIProvider {
  // Fallback provider
}

export class AIClient {
  private providers: AIProvider[] = [
    new HuggingFaceProvider(),
    new OpenAIProvider(),
  ];
  
  async generateResponse(prompt: string): Promise<string> {
    // Try providers with fallback logic
    for (const provider of this.providers) {
      try {
        if (provider.isAvailable()) {
          return await provider.generateResponse(prompt);
        }
      } catch (error) {
        console.warn(`Provider failed:`, error);
        continue;
      }
    }
    throw new Error('All AI providers failed');
  }
}
```

## 🎯 Key Features to Migrate

### From Python files, ensure you replicate:

1. **personality_manager.py** → Personality trait evolution system
2. **relationship_tracker.py** → Relationship stage progression  
3. **temporal_engine.py** → Time-aware behaviors
4. **agentic_behaviors.py** → Human-like spontaneous responses
5. **main.py** → Core chat loop and AI integration
6. **prompts/v1/** → All system prompts and templates

### Real-time Features
- Message typing simulation with realistic delays
- Proactive AI messages during silence
- Personality-driven response variations
- Context-aware greetings based on time gaps

### Advanced Memory System
- Inside joke tracking and referencing
- Preference learning and adaptation
- Conversation theme analysis
- Emotional moment recognition

## 🔧 Development Setup Commands

```bash
# Initialize T3 app in web directory
cd /Users/rishabh/Desktop/ai_gf/
npx create-t3-app@latest web --typescript --tailwind --trpc --nextAuth --prisma --src-dir --app

# Additional dependencies
cd web
npm install @aws-sdk/client-dynamodb @aws-sdk/util-dynamodb
npm install zustand @tanstack/react-query
npm install ai openai @huggingface/inference
npm install zod @hookform/resolvers react-hook-form
npm install framer-motion lucide-react
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card avatar
```

## ⚡ Code Quality Standards (From .rules)

1. **Function Size**: Maximum 30 lines per function (aim for 20-30)
2. **Single Responsibility**: Each function performs exactly one task
3. **Variable Naming**: Short names (i, tmp) for local scope, descriptive names (user_registration_timeout) for wider scope
4. **Self-Documenting**: Code should be clear enough to minimize comments
5. **Formatting**: All code must be formatted with Prettier
6. **Linting**: Must pass ESLint checks without errors

## 📋 Migration Checklist

- [ ] Analyze all Python files and understand architecture
- [ ] Set up T3 stack project in `/web` folder
- [ ] Configure DynamoDB with Prisma adapter
- [ ] Migrate personality management system
- [ ] Migrate relationship tracking system
- [ ] Migrate temporal engine
- [ ] Migrate agentic behaviors
- [ ] Migrate AI integration and prompts
- [ ] Create real-time chat interface
- [ ] Implement user authentication
- [ ] Add responsive design
- [ ] Set up deployment configuration
- [ ] Add comprehensive error handling
- [ ] Write tests for core functionality
- [ ] Performance optimization
- [ ] Security audit

## 🚀 Deployment & Production

- Configure Vercel deployment with environment variables
- Set up DynamoDB tables with proper indexes
- Configure NextAuth providers (Google, GitHub, etc.)
- Add monitoring and error tracking
- Implement rate limiting and abuse prevention
- Add comprehensive logging

## 🎯 Success Criteria

The migrated application should:
- Replicate ALL functionality from the Python version
- Use modern T3 stack technologies
- Provide better performance and user experience
- Maintain the same personality evolution algorithms
- Support real-time chat with typing indicators
- Have proper authentication and user management
- Be production-ready and scalable
- Follow all code quality standards

**Remember**: This is an adult-oriented application. Implement appropriate content warnings, age verification, and safety measures throughout the system.

Start by creating the T3 app in the `/web` folder, then systematically migrate each Python component to modern TypeScript equivalents using tRPC, ensuring no functionality is lost in translation.