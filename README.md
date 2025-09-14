# AI Girlfriend - Advanced Conversational AI

An advanced AI girlfriend with dynamic personality traits, temporal awareness, and sophisticated agentic behaviors that create authentic, engaging conversations.

## Features

### Core Capabilities

- **Dynamic Personality System**: Evolving traits that adapt based on interactions
- **Temporal Awareness**: Different behaviors and energy levels based on time of day
- **Relationship Progression**: Natural development from new to established relationship stages
- **Agentic Behaviors**: Proactive engagement, follow-up questions, and human-like spontaneity
- **Advanced Memory System**: Remembers conversations, preferences, and builds inside jokes

### Technical Highlights

- Industry-standard conversational AI architecture
- Robust error handling and fallback systems
- Modular component design for easy customization
- Professional prompt engineering with context-aware responses

## Quick Start

### Prerequisites

- Python 3.8+
- Hugging Face API access token

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env and add your HF_TOKEN
   ```

4. Run the application:
   ```bash
   python main.py
   ```

## Project Structure

```
ai_gf/
├── main.py                    # Main application entry point
├── agentic_behaviors.py       # Behavioral engine implementation
├── personality_manager.py     # Dynamic personality system
├── relationship_tracker.py    # Relationship progression logic
├── temporal_engine.py         # Time-aware behavior system
├── prompts/v1/                   # System and planner prompts
│   ├── system_prompt.txt
│   ├── planner_prompt.txt
│   ├── dynamic_system_template.txt
│   ├── personality_influences.txt
│   └── time_behavior_guidance.txt
├── .env                       # Environment configuration
├── .gitignore
└── README.md
```

## Configuration

The system uses several configuration files:

- **System Prompts**: Core personality and behavior definitions
- **Dynamic Templates**: Context-aware prompt building
- **Personality Influences**: How traits affect responses
- **Time Behavior Guidance**: Time-of-day specific behaviors

## Architecture

The application follows a modular design:

- **Main Controller**: Orchestrates all components and handles user interaction
- **Memory Manager**: Manages conversation history and context
- **Personality Manager**: Tracks and evolves personality traits
- **Relationship Tracker**: Manages relationship progression and milestones
- **Temporal Engine**: Adjusts behavior based on time context
- **Agentic Behavior Engine**: Generates human-like spontaneous behaviors

## Environment Variables

Required environment variables:

```bash
HF_TOKEN=your_huggingface_token_here
```

## Usage

Once started, the application provides an interactive chat interface. The AI will:

- Adapt its personality based on your interactions
- Show different energy levels depending on time of day
- Remember previous conversations and reference them naturally
- Ask follow-up questions and show genuine curiosity
- Develop inside jokes and shared memories over time

## Contributing

This project follows strict coding standards defined in `.rules`. Key principles:

- Functions must be under 30 lines
- Single responsibility principle
- Self-documenting code with minimal comments
- Proper error handling and logging

## License

Private project - All rights reserved.
