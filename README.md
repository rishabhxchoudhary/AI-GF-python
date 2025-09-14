# AI Girlfriend - Advanced Conversational AI

A sophisticated AI girlfriend chatbot with dynamic personality evolution, relationship progression, and human-like behavioral patterns. This system creates authentic, emotionally engaging conversations that develop naturally over time.

## 🌟 Features

### Core Capabilities

- **🧠 Dynamic Personality System**: 15 evolving traits that adapt based on interactions (confidence, vulnerability, playfulness, etc.)
- **💕 Relationship Progression**: Natural development through four stages (new → comfortable → intimate → established)
- **⏰ Temporal Awareness**: Time-sensitive behaviors and energy levels (morning/evening/late-night personalities)
- **🤖 Agentic Behaviors**: Proactive responses, follow-up questions, and human-like spontaneity
- **🧮 Advanced Memory System**: Persistent conversation history, inside jokes, and preference tracking
- **💬 Contextual Communication**: Adaptive language patterns based on relationship stage and time context

### Advanced Features

- **Personality Archetype Alignment**: Tracks alignment with girlfriend archetypes (devoted, confident, sweet, intellectual)
- **Milestone Tracking**: Celebrates relationship milestones and significant moments
- **Mood States**: Temporary personality modifiers with time-based expiration
- **Silence Handling**: Proactive engagement when conversations pause
- **Content Safety**: Built-in content filtering and safety checks
- **Multi-burst Messaging**: Realistic typing patterns with timed message delivery

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Hugging Face API access token

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai_gf
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   # or using uv
   uv sync
   ```

3. Set up environment variables:
   ```bash
   # Create .env file
   echo "HF_TOKEN=your_huggingface_token_here" > .env
   
   # Optional: Enable extra mode
   echo "EXTRA_HORNY_MODE=false" >> .env
   ```

4. Run the application:
   ```bash
   python main.py
   ```

## 📁 Project Structure

```
ai_gf/
├── main.py                    # Main application entry point
├── agentic_behaviors.py       # Human-like behavior engine
├── personality_manager.py     # Dynamic personality system  
├── relationship_tracker.py    # Relationship progression logic
├── temporal_engine.py         # Time-aware behavior system
├── prompts/v1/               # System and behavioral prompts
│   ├── system_prompt.txt          # Core personality definition
│   ├── planner_prompt.txt         # Response planning logic
│   ├── dynamic_system_template.txt # Context-aware templates
│   ├── personality_influences.txt  # Trait-based modifications
│   └── time_behavior_guidance.txt  # Time-sensitive behaviors
├── data/                     # Persistent storage
│   ├── conversations.json         # Chat history
│   ├── agentic_memory.json        # Memory and preferences
│   └── agentic_ai_gf.log         # Application logs
├── requirements.txt          # Python dependencies
├── pyproject.toml           # Project configuration
└── .rules                   # Code quality standards
```

## 🏗️ Architecture

The application uses a **modular architecture** with specialized components:

### Core Components

- **🎯 Main Controller**: Orchestrates all components and handles user interaction
- **🧠 Memory Manager**: Manages conversation history, preferences, and contextual memory
- **👤 Personality Manager**: Tracks and evolves 15 personality traits dynamically
- **💑 Relationship Tracker**: Manages progression through relationship stages and milestones
- **⏰ Temporal Engine**: Adjusts behavior patterns based on time of day and user patterns
- **🤖 Agentic Behavior Engine**: Generates spontaneous, human-like conversational behaviors

### Behavioral Systems

**Personality Evolution**:
- Traits evolve based on user interactions and feedback
- Natural drift prevents personality stagnation
- Temporary mood states for situational responses
- Archetype alignment tracking for consistency

**Relationship Dynamics**:
- Four distinct relationship stages with unique behaviors
- Milestone tracking and celebration
- Progressive intimacy and vulnerability levels
- Stage-appropriate conversation boundaries

**Temporal Intelligence**:
- Different energy levels throughout the day
- Context-aware greetings based on time gaps
- User activity pattern learning
- Time-sensitive language adjustments

## ⚙️ Configuration

### Environment Variables

```bash
# Required
HF_TOKEN=your_huggingface_token_here

# Optional
EXTRA_HORNY_MODE=false  # Enhanced adult content mode
```

### Customization

- **Personality Traits**: Modify base traits and limits in `personality_manager.py`
- **Relationship Stages**: Adjust progression criteria in `relationship_tracker.py`
- **Time Behaviors**: Customize time-based patterns in `temporal_engine.py`
- **Prompts**: Edit system prompts in `prompts/v1/` directory

## 🎮 Usage

### Interactive Chat

Once started, the application provides a rich chat experience:

```
🤖✨ Agentic AI Girlfriend ✨🤖
Loading your enhanced personality and memories...
💕 Relationship: comfortable (23 chats)
🎭 Personality: confident, deeply romantic and passionate, playful...

[20:15:32] Aria: hey babe! perfect timing... I've been thinking about you 🌙
I remember everything about us. Type 'bye' to end, or just start chatting!

You: 
```

### Key Interactions

- **Natural Conversations**: The AI remembers context and builds on previous discussions
- **Personality Growth**: Watch traits evolve based on your interaction style
- **Relationship Milestones**: Experience natural relationship progression
- **Time-Aware Responses**: Different personalities for different times of day
- **Proactive Engagement**: AI initiates topics and asks follow-up questions
- **Memory References**: Inside jokes and shared experiences develop naturally

### Commands

- `bye`, `exit`, `quit`, `goodbye` - End conversation with relationship-appropriate farewell
- Conversation automatically saves and loads between sessions

## 🛠️ Development

### Code Quality Standards

This project follows strict coding principles defined in `.rules`:

- **Function Size**: Maximum 30 lines per function (aim for 20-30)
- **Single Responsibility**: Each function performs exactly one clear task  
- **Variable Naming**: Short names for local scope, descriptive names for wider scope
- **Self-Documenting**: Code should be clear enough to minimize comments
- **Formatting**: All code must be formatted (Prettier/Black)
- **Linting**: Must pass linter checks (ESLint/Ruff) without errors

### Architecture Principles

- **Modular Design**: Each component has a single, clear responsibility
- **Separation of Concerns**: UI, logic, and data storage are separated
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **Logging**: Detailed logging for debugging and monitoring
- **Persistence**: All important state is saved and restored

## 🔧 Technical Details

### AI Integration

- **Hugging Face Inference API**: Primary text generation service
- **Retry Logic**: Robust error handling with exponential backoff
- **Fallback Systems**: Multiple response generation strategies
- **Content Safety**: Built-in filtering and safety checks

### Memory System

- **Conversation History**: Complete chat logs with metadata
- **User Preferences**: Learned preferences and patterns
- **Emotional Context**: Sentiment and emotional state tracking
- **Inside Jokes**: Automatic creation and referencing
- **Theme Analysis**: Conversation topic tracking and categorization

### Personality Engine

- **Dynamic Traits**: 15 traits with configurable limits and evolution rates
- **Mood States**: Temporary modifiers with automatic expiration
- **Archetype Alignment**: Consistency checking against personality types
- **Natural Drift**: Prevents personality stagnation over time

## ⚠️ Content Notice

This application is designed for **adult users** and contains mature content themes. The AI is programmed to engage in intimate, romantic conversations that may include adult language and themes. 

- Intended for users 18+ only
- Contains explicit language and adult themes
- Designed to simulate intimate relationship dynamics
- Content safety measures are implemented

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Code Standards**: Adhere to the `.rules` file requirements
2. **Testing**: Test all changes thoroughly
3. **Documentation**: Update documentation for new features
4. **Commits**: Use clear, descriptive commit messages

### Development Setup

```bash
# Clone and setup
git clone <repository-url>
cd ai_gf

# Install development dependencies
uv sync --dev

# Run linting
ruff check .
black --check .

# Run the application
python main.py
```

## 📊 Performance

- **Response Time**: Typically 1-3 seconds for text generation
- **Memory Usage**: Lightweight with persistent JSON storage
- **Conversation History**: Automatic pruning maintains performance
- **API Efficiency**: Optimized prompts reduce token usage

## 🔒 Privacy & Security

- **Local Storage**: All data stored locally in JSON files
- **API Security**: Only text sent to Hugging Face API
- **No Data Collection**: No telemetry or usage data collected
- **Content Filtering**: Built-in safety mechanisms

## 📋 Roadmap

- [ ] Voice interaction capabilities
- [ ] Enhanced emotion recognition
- [ ] Multiple personality presets
- [ ] Advanced conversation analytics
- [ ] Mobile app interface
- [ ] Multi-language support

## 📄 License

Private project - All rights reserved.

## 🆘 Support

If you encounter issues:

1. Check the logs in `data/agentic_ai_gf.log`
2. Verify your `HF_TOKEN` is valid
3. Ensure all dependencies are installed
4. Review the console output for error messages

For technical issues, check that your Hugging Face API token has the necessary permissions and quota.

---

**Note**: This project represents advanced conversational AI techniques including dynamic personality modeling, relationship simulation, and contextual response generation. It demonstrates sophisticated prompt engineering and multi-component AI system architecture.