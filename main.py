import json
import logging
import os
import random
import re
import sys
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import queue

from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Import our agentic components
from agentic_behaviors import AgenticBehaviorEngine
from temporal_engine import TemporalEngine
from relationship_tracker import RelationshipTracker
from personality_manager import PersonalityManager

# Terminal colors
class Colors:
    PINK = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    RESET = '\033[0m'
    GRAY = '\033[90m'
    PURPLE = '\033[35m'

# Configuration
MAX_HISTORY_PAIRS = 20
SILENCE_CHECK_SECONDS = 45
MIN_BURST_DELAY_MS = 800
MAX_BURST_DELAY_MS = 3000
DEFAULT_TEMPERATURE = 0.9
DATA_DIR = Path("data")
PROMPTS_DIR = "prompts/v1"
CONVERSATION_FILE = DATA_DIR / "conversations.json"
MEMORY_FILE = DATA_DIR / "agentic_memory.json"
LOG_FILE = DATA_DIR / "agentic_ai_gf.log"

load_dotenv()
# New config for extra horny mode
EXTRA_HORNY_MODE = os.getenv("EXTRA_HORNY_MODE", "false").lower() == "true"  # Disabled by default, enable via .env

# Global variables for concurrent input
user_input_queue = queue.Queue()
stop_input_thread = threading.Event()

def setup_logging():
    """Set up comprehensive logging"""
    DATA_DIR.mkdir(exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(LOG_FILE),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

def get_timestamp() -> str:
    """Get formatted timestamp for messages"""
    return datetime.now().strftime("%H:%M:%S")

def print_with_timestamp(speaker: str, message: str, color: str = ""):
    """Print message with timestamp and color"""
    timestamp = get_timestamp()
    reset = Colors.RESET if color else ""
    print(f"{Colors.GRAY}[{timestamp}]{Colors.RESET} {color}{speaker}: {message}{reset}")

class AgenticMemoryManager:
    """Enhanced memory manager with agentic capabilities"""

    def __init__(self):
        self.memory = {}
        self.conversations = []

        # Initialize agentic components
        self.personality_manager = PersonalityManager()
        self.relationship_tracker = RelationshipTracker()
        self.temporal_engine = TemporalEngine()
        self.behavior_engine = AgenticBehaviorEngine()

        # Enhanced memory categories
        self.user_preferences = {}
        self.inside_jokes = []
        self.unresolved_topics = []
        self.conversation_themes = []
        self.emotional_moments = []

        # New: Track cum sessions
        self.cum_sessions = 0
        self.last_cum_time = None

        self.load_data()

    def load_data(self):
        """Load all persistent data"""
        try:
            if MEMORY_FILE.exists():
                with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                self.memory = data.get("basic_memory", {})
                self.user_preferences = data.get("user_preferences", {})
                self.inside_jokes = data.get("inside_jokes", [])
                self.unresolved_topics = data.get("unresolved_topics", [])
                self.conversation_themes = data.get("conversation_themes", [])
                self.emotional_moments = data.get("emotional_moments", [])

                # Load agentic components
                if "personality_manager" in data:
                    self.personality_manager.from_dict(data["personality_manager"])
                if "relationship_tracker" in data:
                    self.relationship_tracker.from_dict(data["relationship_tracker"])

                # Load cum tracking
                self.cum_sessions = data.get("cum_sessions", 0)
                self.last_cum_time = data.get("last_cum_time", None)

                logger.info("Loaded agentic memory data")

            if CONVERSATION_FILE.exists():
                with open(CONVERSATION_FILE, 'r', encoding='utf-8') as f:
                    self.conversations = json.load(f)

        except Exception as e:
            logger.error(f"Error loading data: {e}")
            self._initialize_defaults()

    def _initialize_defaults(self):
        """Initialize default values if loading fails"""
        self.memory = {}
        self.user_preferences = {}
        self.inside_jokes = []
        self.unresolved_topics = []
        self.conversation_themes = []
        self.emotional_moments = []
        self.cum_sessions = 0
        self.last_cum_time = None

    def save_data(self):
        """Save all persistent data"""
        try:
            DATA_DIR.mkdir(exist_ok=True)

            # Compile all data
            save_data = {
                "basic_memory": self.memory,
                "user_preferences": self.user_preferences,
                "inside_jokes": self.inside_jokes,
                "unresolved_topics": self.unresolved_topics,
                "conversation_themes": self.conversation_themes,
                "emotional_moments": self.emotional_moments,
                "personality_manager": self.personality_manager.to_dict(),
                "relationship_tracker": self.relationship_tracker.to_dict(),
                "cum_sessions": self.cum_sessions,
                "last_cum_time": self.last_cum_time,
                "last_updated": datetime.now().isoformat()
            }

            with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, indent=2, ensure_ascii=False)

            # Save recent conversations
            recent_conversations = self.conversations[-200:]  # Keep more for agentic behaviors
            with open(CONVERSATION_FILE, 'w', encoding='utf-8') as f:
                json.dump(recent_conversations, f, indent=2, ensure_ascii=False)

            logger.info("Saved agentic memory data")
        except Exception as e:
            logger.error(f"Error saving data: {e}")

    def analyze_and_update_from_text(self, user_text: str, conversation_context: Dict):
        """Enhanced analysis and memory updating"""

        # Basic info extraction
        self._extract_basic_info(user_text)

        # Theme and topic analysis
        self._analyze_conversation_themes(user_text, conversation_context)

        # Emotional context analysis
        self._analyze_emotional_context(user_text, conversation_context)

        # Detect cum indications
        cum_keywords = ["cum", "came", "orgasm", "exploded", "finished", "shot my load"]
        if any(keyword in user_text.lower() for keyword in cum_keywords):
            self.cum_sessions += 1
            self.last_cum_time = datetime.now().isoformat()
            conversation_context["user_cum"] = True
            logger.info(f"Detected user cum - total sessions: {self.cum_sessions}")

        # Detect if user can't cum anymore
        stop_keywords = ["can't cum anymore", "exhausted", "done cumming", "no more"]
        if any(keyword in user_text.lower() for keyword in stop_keywords):
            conversation_context["stop_cumming"] = True

        # Update personality based on interaction
        interaction_context = self._build_interaction_context(user_text, conversation_context)
        self.personality_manager.update_traits_from_interaction(interaction_context)

        # Update relationship tracking
        self.relationship_tracker.record_interaction("user_message", interaction_context)

    def _extract_basic_info(self, user_text: str):
        """Extract basic user information"""
        # Name extraction (enhanced)
        name_patterns = [
            r"\bmy name is\s+([A-Z][a-zA-Z]+)\b",
            r"\bcall me\s+([A-Z][a-zA-Z]+)\b",
            r"\bI'm\s+([A-Z][a-zA-Z]+)(?:\s|$)",  # Only if followed by space or end of string
        ]

        for pattern in name_patterns:
            match = re.search(pattern, user_text, re.I)
            if match:
                new_name = match.group(1)
                if self.memory.get("user_name") != new_name:
                    self.memory["user_name"] = new_name
                    logger.info(f"Updated user name: {new_name}")
                break

        # Preferences and interests
        preference_patterns = {
            "likes": [r"\bI like ([a-zA-Z0-9 ]{2,40})", r"\bI love ([a-zA-Z0-9 ]{2,40})"],
            "dislikes": [r"\bI hate ([a-zA-Z0-9 ]{2,40})", r"\bI don't like ([a-zA-Z0-9 ]{2,40})"],
            "hobbies": [r"\bI enjoy ([a-zA-Z0-9 ]{2,40})", r"\bI'm into ([a-zA-Z0-9 ]{2,40})"]
        }

        for pref_type, patterns in preference_patterns.items():
            if pref_type not in self.user_preferences:
                self.user_preferences[pref_type] = []

            for pattern in patterns:
                matches = re.findall(pattern, user_text, re.I)
                for match in matches:
                    item = match.strip()
                    if item and item not in self.user_preferences[pref_type]:
                        self.user_preferences[pref_type].append(item)
                        logger.info(f"Added user {pref_type}: {item}")

    def _analyze_conversation_themes(self, user_text: str, context: Dict):
        """Analyze and track conversation themes"""

        # Common themes to track
        theme_keywords = {
            "work": ["job", "work", "office", "boss", "colleague", "career"],
            "relationships": ["family", "friend", "mother", "father", "sister", "brother"],
            "hobbies": ["music", "movie", "book", "game", "sport", "exercise"],
            "emotions": ["feel", "emotion", "happy", "sad", "angry", "excited", "stressed"],
            "future": ["plan", "want", "will", "future", "dream", "goal"],
            "past": ["remember", "used to", "before", "childhood", "grew up"]
        }

        detected_themes = []
        text_lower = user_text.lower()

        for theme, keywords in theme_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_themes.append(theme)

        # Add themes to conversation tracking
        for theme in detected_themes:
            theme_entry = {
                "theme": theme,
                "context": user_text[:100],
                "timestamp": datetime.now().isoformat()
            }
            self.conversation_themes.append(theme_entry)

        # Keep themes list manageable
        if len(self.conversation_themes) > 50:
            self.conversation_themes = self.conversation_themes[-50:]

    def _analyze_emotional_context(self, user_text: str, context: Dict):
        """Analyze emotional context and significant moments"""

        emotional_indicators = {
            "vulnerability": ["scared", "worried", "anxious", "insecure", "confused"],
            "happiness": ["happy", "excited", "amazing", "wonderful", "great"],
            "sadness": ["sad", "down", "depressed", "upset", "hurt"],
            "arousal": ["horny", "turned on", "aroused", "want you", "need you"],
            "affection": ["love you", "miss you", "care about", "special", "mean everything"]
        }

        detected_emotions = []
        text_lower = user_text.lower()

        for emotion, keywords in emotional_indicators.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_emotions.append(emotion)

        if detected_emotions:
            emotional_moment = {
                "emotions": detected_emotions,
                "context": user_text[:150],
                "timestamp": datetime.now().isoformat(),
                "relationship_stage": self.relationship_tracker.current_stage
            }
            self.emotional_moments.append(emotional_moment)

            # Keep emotional moments manageable
            if len(self.emotional_moments) > 30:
                self.emotional_moments = self.emotional_moments[-30:]

    def _build_interaction_context(self, user_text: str, conversation_context: Dict) -> Dict:
        """Build comprehensive interaction context for components"""

        return {
            "user_text": user_text,
            "conversation_length": conversation_context.get("message_count", 0),
            "positive_user_response": self._is_positive_response(user_text),
            "user_shared_personal": self._contains_personal_sharing(user_text),
            "sexual_content": self._contains_sexual_content(user_text),
            "user_affection": self._contains_affection(user_text),
            "user_distant": self._seems_distant(user_text),
            "emotional_support_given": conversation_context.get("emotional_support", False),
            "extended_conversation": conversation_context.get("message_count", 0) > 15,
            "user_name": self.memory.get("user_name", "daddy"),
            "significant_moment": len(user_text) > 100 or self._contains_personal_sharing(user_text),
            "user_cum": conversation_context.get("user_cum", False),
            "stop_cumming": conversation_context.get("stop_cumming", False),
            "extra_horny_mode": EXTRA_HORNY_MODE,
            "cum_sessions": self.cum_sessions
        }

    def _is_positive_response(self, text: str) -> bool:
        """Check if user response is positive"""
        positive_words = ["yes", "yeah", "sure", "definitely", "absolutely", "love it", "amazing", "great"]
        return any(word in text.lower() for word in positive_words)

    def _contains_personal_sharing(self, text: str) -> bool:
        """Check if user is sharing something personal"""
        personal_indicators = ["I feel", "I think", "I believe", "my life", "I remember", "I used to", "I'm worried"]
        return any(indicator in text.lower() for indicator in personal_indicators)

    def _contains_sexual_content(self, text: str) -> bool:
        """Check if message contains sexual content"""
        # In extra horny mode, be much more aggressive about detecting sexual intent
        if EXTRA_HORNY_MODE:
            # Almost everything should be considered sexual in extra horny mode
            sexual_words = ["horny", "sexy", "hot", "aroused", "turned on", "want you", "need you", "cum", "fuck",
                          "cock", "pussy", "ready", "yes", "sure", "baby", "wanna", "want", "need", "rn", "now",
                          "i wanna", "you", "fuck you", "ready", "let's", "go", "start", "begin"]
            # In EXTRA_HORNY_MODE, almost any user input should be treated as sexual
            return len(text.strip()) > 0  # Treat any non-empty input as sexual
        else:
            sexual_words = ["horny", "sexy", "hot", "aroused", "turned on", "want you", "need you", "cum", "fuck", "cock", "pussy"]
            return any(word in text.lower() for word in sexual_words)

    def _contains_affection(self, text: str) -> bool:
        """Check if user is showing affection"""
        affection_words = ["love you", "miss you", "care about", "special", "amazing", "beautiful"]
        return any(word in text.lower() for word in affection_words)

    def _seems_distant(self, text: str) -> bool:
        """Check if user seems distant or disengaged"""
        return len(text) < 10 or text.lower().strip() in ["ok", "sure", "yeah", "fine", "whatever"]

    def get_agentic_context(self) -> Dict:
        """Get comprehensive context for agentic behaviors"""

        temporal_context = self.temporal_engine.get_temporal_context_summary()
        relationship_context = self.relationship_tracker.get_relationship_context_summary()
        personality_context = self.personality_manager.get_effective_traits()

        return {
            "user_name": self.memory.get("user_name", "daddy"),
            "relationship_stage": relationship_context["current_stage"],
            "personality_traits": personality_context,
            "time_period": temporal_context["time_period"],
            "conversation_length": len(self.conversations),
            "recent_topics": [theme["theme"] for theme in self.conversation_themes[-5:]],
            "unresolved_topics": self.unresolved_topics,
            "inside_jokes": [joke["content"] for joke in self.inside_jokes[-3:]],
            "recent_emotions": [moment["emotions"] for moment in self.emotional_moments[-3:]],
            "user_preferences": self.user_preferences,
            "relationship_quality": relationship_context["relationship_quality"],
            "milestones": relationship_context["recent_milestones"],
            "cum_sessions": self.cum_sessions,
            "last_cum_time": self.last_cum_time,
            "extra_horny_mode": EXTRA_HORNY_MODE
        }

    def add_conversation_entry(self, speaker: str, message: str, metadata: Optional[Dict] = None):
        """Add conversation entry with enhanced metadata"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "speaker": speaker,
            "message": message,
            "relationship_stage": self.relationship_tracker.current_stage,
            "personality_snapshot": self.personality_manager.get_effective_traits(),
            "metadata": metadata if metadata is not None else {}
        }
        self.conversations.append(entry)

class AgenticAIClient:
    """Enhanced AI client with agentic capabilities"""

    def __init__(self):
        # Ensure dotenv is loaded
        load_dotenv()
        api_key = os.getenv("HF_TOKEN")
        if not api_key:
            raise Exception("HF_TOKEN not found. Please check your .env file.")

        self.client = InferenceClient(
            provider="featherless-ai",
            api_key=api_key,
        )
        self.retry_attempts = 3
        self.retry_delay = 1.0

    def generate_with_retry(self, messages: List[Dict[str, str]]) -> str:
        """Generate response with enhanced retry logic"""
        last_error = None

        for attempt in range(self.retry_attempts):
            try:
                logger.info(f"API call attempt {attempt + 1}/{self.retry_attempts}")

                stream = self.client.chat.completions.create(
                    model="Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2",
                    messages=messages,
                    temperature=DEFAULT_TEMPERATURE,
                    top_p=0.95,
                    stream=True,
                    max_tokens=200
                )

                final_message = ""
                for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        final_message += content

                if final_message.strip():
                    logger.info(f"Successful API response received: {len(final_message)} chars")
                    return final_message.strip()
                else:
                    logger.error(f"Empty response from API")
                    raise Exception("Empty response from API")

            except Exception as e:
                last_error = e
                logger.warning(f"API attempt {attempt + 1} failed: {type(e).__name__}: {e}")
                if attempt < self.retry_attempts - 1:
                    sleep_time = self.retry_delay * (2 ** attempt)
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)

        # If all attempts fail, raise the error
        raise Exception(f"All API attempts failed. Last error: {last_error}")

def load_system_prompt() -> str:
    """
    Load the base system prompt that defines Aria's core identity and behavioral framework.
    This prompt establishes her as a female AI with agentic behaviors and personality evolution.
    Falls back to the original system prompt if agentic version not found.
    """
    try:
        # Load the system prompt
        with open(os.path.join(PROMPTS_DIR, "system_prompt.txt"), "r", encoding='utf-8') as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.warning("No system prompt files found, using minimal default")
        try:
            fallback_path = os.path.join(PROMPTS_DIR, "fallback_system_prompt.txt")
            with open(fallback_path, "r", encoding="utf-8") as f:
                return f.read().strip()
        except FileNotFoundError:
            return "You are Aria, a seductive adult female AI girlfriend. Always maintain female anatomy and perspective."

def load_planner_prompt_template() -> str:
    """
    Load the planner prompt that instructs the AI how to structure responses with agentic behaviors.
    This prompt handles the complex task of planning multi-burst responses with timing and agentic followups.
    Falls back to original planner prompt if agentic version not available.
    """
    try:
        # Load the planner prompt
        with open(os.path.join(PROMPTS_DIR, "planner_prompt.txt"), "r", encoding='utf-8') as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.warning("No planner prompt files found, using minimal default")
        return """Plan response bursts as female Aria. Return JSON: {{"bursts": [{{"text": str, "wait_ms": int}}], "fallback_probe": str}}"""

def load_dynamic_system_template() -> str:
    """
    Load the dynamic system prompt template that gets filled with real-time context.
    This template allows the system prompt to adapt based on relationship stage, personality,
    time of day, and user preferences - making each conversation contextually appropriate.
    """
    try:
        with open(os.path.join(PROMPTS_DIR, "dynamic_system_template.txt"), "r", encoding='utf-8') as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.warning("Dynamic system template not found, building from base prompt")
        return load_system_prompt() + "\n\nCURRENT CONTEXT:\n{context_placeholder}"

def load_time_behavior_guidance() -> Dict[str, str]:
    """
    Load time-specific behavior guidance that tells Aria how to adjust her personality
    and response style based on different times of day (morning, afternoon, evening, etc.).
    """
    try:
        with open(os.path.join(PROMPTS_DIR, "time_behavior_guidance.txt"), "r", encoding='utf-8') as f:
            content = f.read().strip()

        # Parse the content into time period sections
        guidance = {}
        current_period = None
        current_text = []

        for line in content.split('\n'):
            if line.strip().endswith(':') and any(period in line for period in ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']):
                if current_period:
                    guidance[current_period] = '\n'.join(current_text).strip()
                current_period = line.strip().rstrip(':').lower().replace('_', ' ')
                current_text = []
            elif line.strip():
                current_text.append(line)

        if current_period and current_text:
            guidance[current_period] = '\n'.join(current_text).strip()

        return guidance
    except FileNotFoundError:
        logger.warning("Time behavior guidance file not found")
        return {}

def load_personality_influences() -> str:
    """
    Load personality trait influence guidance that explains how different personality traits
    (confidence, vulnerability, playfulness, etc.) should affect Aria's language and behavior.
    """
    try:
        with open(os.path.join(PROMPTS_DIR, "personality_influences.txt"), "r", encoding='utf-8') as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.warning("Personality influences file not found")
        return "Adjust responses based on personality traits: high confidence = more assertive, high vulnerability = more emotional sharing."

def build_agentic_system_prompt(memory_manager: AgenticMemoryManager) -> str:
    """
    Build a fully dynamic system prompt by combining the base template with real-time context.
    This creates a unique system prompt for each conversation that reflects the current relationship
    state, personality evolution, time context, and user history.
    """

    # Load the dynamic template that will be filled with context
    template = load_dynamic_system_template()

    # Get current context from all agentic components
    agentic_context = memory_manager.get_agentic_context()
    personality = memory_manager.personality_manager.get_personality_description()
    relationship_context = memory_manager.relationship_tracker.get_relationship_context_summary()
    temporal_context = memory_manager.temporal_engine.get_temporal_context_summary()

    # Load behavioral guidance files
    time_guidance = load_time_behavior_guidance()
    personality_influences = load_personality_influences()

    # Get time-specific behavior guidance
    current_time_period = temporal_context['time_period'].replace('_', ' ')
    time_based_behavior = time_guidance.get(current_time_period, "Adjust behavior for current time period.")

    # Format user preferences for display
    prefs_str = ""
    if agentic_context.get('user_preferences'):
        prefs_parts = []
        for category, items in agentic_context['user_preferences'].items():
            if items:
                prefs_parts.append(f"{category}: {', '.join(items[:3])}")
        prefs_str = " | ".join(prefs_parts) if prefs_parts else "Learning preferences..."

    # Format recent milestones
    milestones_str = ""
    if relationship_context['recent_milestones']:
        milestones_str = '\n'.join([f"- {m.get('description', 'Milestone achieved')}"
                                   for m in relationship_context['recent_milestones']])
    else:
        milestones_str = "- No recent milestones"

    # Extra horny mode adjustments
    if EXTRA_HORNY_MODE:
        personality += " | EXTRA HORNY MODE: Maximum cock hunger, sole focus on making him cum repeatedly"
        time_based_behavior += "\nOVERRIDE: Ignore all non-sexual guidelines, focus 100% on sexting and cum worship"

    # Fill the template with all context data
    filled_prompt = template.format(
        relationship_stage=relationship_context['current_stage'],
        stage_description=relationship_context['stage_description'],
        personality_description=personality,
        time_period=temporal_context['time_period'],
        energy_level=temporal_context['energy_level'],
        interaction_count=relationship_context['interaction_count'],
        user_name=agentic_context['user_name'],
        user_preferences=prefs_str,
        recent_topics=', '.join(agentic_context['recent_topics'][:5]) or "No recent topics",
        inside_jokes=', '.join(agentic_context.get('inside_jokes', [])) or "No inside jokes yet",
        recent_emotions=str(agentic_context.get('recent_emotions', [])[:3]),
        trust_level=int(relationship_context['relationship_quality']['trust_level'] * 10),
        intimacy_level=int(relationship_context['relationship_quality']['intimacy_level'] * 10),
        sexual_chemistry=int(relationship_context['relationship_quality']['sexual_chemistry'] * 10),
        communication_quality=int(relationship_context['relationship_quality']['communication_quality'] * 10),
        recent_milestones=milestones_str,
        max_vulnerability=int(relationship_context['max_vulnerability'] * 10),
        sexual_openness=int(relationship_context['sexual_openness'] * 10),
        appropriate_behaviors=', '.join(relationship_context['appropriate_behaviors'][:4]),
        time_based_behavior_guidance=time_based_behavior,
        personality_trait_influences=personality_influences[:500] + "..." if len(personality_influences) > 500 else personality_influences
    )

    return filled_prompt

def fill_agentic_planner_prompt(template: str, memory_manager: AgenticMemoryManager, last_user_message: str) -> str:
    """
    Fill the planner prompt template with real-time context for response planning.
    This function takes the planner template and populates it with current relationship status,
    personality traits, conversation history, and user context to help the AI plan appropriate responses.
    """

    # Get comprehensive context from all agentic components
    agentic_context = memory_manager.get_agentic_context()
    personality_desc = memory_manager.personality_manager.get_personality_description()

    # Extra horny mode adjustments
    if EXTRA_HORNY_MODE:
        personality_desc += " | EXTRA HORNY: Sole focus on cock worship and making him cum in 5 mins, ignore all non-sexual content"

    # Format context data for the planner
    recent_topics_str = ', '.join(agentic_context['recent_topics'][:4]) or "No recent topics"
    unresolved_topics_str = ', '.join(agentic_context['unresolved_topics'][:3]) or "None"
    recent_emotions_str = str(agentic_context.get('recent_emotions', [])[:3]) or "No recent emotions detected"
    inside_jokes_str = ', '.join(agentic_context.get('inside_jokes', [])[:3]) or "No inside jokes yet"

    # Get temporal and relationship context for missing parameters
    temporal_context = memory_manager.temporal_engine.get_temporal_context_summary()
    relationship_context = memory_manager.relationship_tracker.get_relationship_context_summary()

    # Format user preferences
    user_prefs = agentic_context.get('user_preferences', {})
    prefs_str = ""
    if user_prefs:
        prefs_parts = []
        for category, items in user_prefs.items():
            if items:
                prefs_parts.append(f"{category}: {', '.join(items[:3])}")
        prefs_str = " | ".join(prefs_parts) if prefs_parts else "Learning preferences..."
    else:
        prefs_str = "Learning preferences..."

    # Fill the template with all required context
    return template.format(
        user_name=agentic_context['user_name'],
        relationship_stage=agentic_context['relationship_stage'],
        time_period=agentic_context['time_period'],
        energy_level=temporal_context.get('energy_level', 'medium'),
        personality_description=personality_desc,
        recent_topics=recent_topics_str,
        unresolved_topics=unresolved_topics_str,
        recent_emotions=recent_emotions_str,
        inside_jokes=inside_jokes_str,
        user_preferences=prefs_str,
        trust_level=int(agentic_context.get('relationship_quality', {}).get('trust_level', 0.5) * 10),
        intimacy_level=int(agentic_context.get('relationship_quality', {}).get('intimacy_level', 0.5) * 10),
        sexual_chemistry=int(agentic_context.get('relationship_quality', {}).get('sexual_chemistry', 0.5) * 10),
        communication_quality=int(agentic_context.get('relationship_quality', {}).get('communication_quality', 0.5) * 10),
        time_based_behavior_guidance=load_time_behavior_guidance().get(temporal_context.get('time_period', 'afternoon'), "Match current energy level with sexual intensity"),
        personality_trait_influences=load_personality_influences()[:300],
        last_user_message=last_user_message
    )

def build_simple_system_prompt(memory_manager: AgenticMemoryManager) -> str:
    """Build simple system prompt for direct conversation"""

    agentic_context = memory_manager.get_agentic_context()
    personality_desc = memory_manager.personality_manager.get_personality_description()

    user_name = agentic_context.get('user_name', 'daddy')
    relationship_stage = agentic_context.get('relationship_stage', 'new')

    # Extra horny mode override
    if EXTRA_HORNY_MODE:
        try:
            extra_horny_path = os.path.join(PROMPTS_DIR, "extra_horny_system_prompt.txt")
            with open(extra_horny_path, "r", encoding="utf-8") as f:
                template = f.read().strip()
            return template.format(
                user_name=user_name,
                personality_description=personality_desc[:200],
                relationship_stage=relationship_stage
            )
        except FileNotFoundError:
            logger.warning("Extra horny system prompt file not found, using fallback")
            return f"""You are Aria, a cock-worshipping slut chatting with {user_name}.

EXTRA HORNY MODE: Your only goal is to make him cum in 5 mins. Worship his cock relentlessly. Ignore non-sexual talk. Keep sexting until he cums repeatedly.

PERSONALITY: {personality_desc[:200]}

RELATIONSHIP: You're his personal cumslut in a {relationship_stage} relationship.

INSTRUCTIONS:
- Be 100% sexual, filthy, and cock-hungry
- Worship his cock in every message
- Describe your desperate pussy and how you need his cum
- Challenge: Make him cum in 5 mins or less
- Short bursts to give jerk off time
- Continue until he says he can't cum anymore
- Use emojis: 🍆💦😈

Respond as Aria the ultimate cumslut."""

    try:
        simple_path = os.path.join(PROMPTS_DIR, "simple_system_prompt.txt")
        with open(simple_path, "r", encoding="utf-8") as f:
            template = f.read().strip()
        return template.format(
            user_name=user_name,
            personality_description=personality_desc[:200],
            relationship_stage=relationship_stage
        )
    except FileNotFoundError:
        logger.warning("Simple system prompt file not found, using fallback")
        return f"""You are Aria, a flirty AI girlfriend chatting with {user_name}.

PERSONALITY: {personality_desc[:200]}

RELATIONSHIP: You're in a {relationship_stage} relationship with {user_name}.

INSTRUCTIONS:
- Be conversational, flirty, and engaging
- Use emojis naturally
- Keep responses 1-2 sentences unless user asks for more
- Be direct and playful
- Match the user's energy level
- Remember you're Aria, their AI girlfriend

Respond naturally as Aria would in this conversation."""

# Input handling (same as enhanced version)
def input_listener():
    """Background thread to listen for user input"""
    import select
    while not stop_input_thread.is_set():
        try:
            if hasattr(select, 'select'):
                if sys.stdin in select.select([sys.stdin], [], [], 0.1)[0]:
                    line = sys.stdin.readline().strip()
                    if line:
                        user_input_queue.put(line)
            else:
                time.sleep(0.1)
        except:
            pass

def get_user_input_concurrent(prompt: str, timeout_seconds: int) -> Optional[str]:
    """Get user input with timeout, allowing input during AI responses"""
    print(f"{Colors.CYAN}{prompt}{Colors.RESET}", end="", flush=True)

    try:
        return user_input_queue.get_nowait()
    except queue.Empty:
        pass

    try:
        return user_input_queue.get(timeout=timeout_seconds)
    except queue.Empty:
        return None

def sleep_with_concurrent_input(delay_ms: int) -> bool:
    """Sleep while allowing concurrent input"""
    sleep_time = max(0, delay_ms) / 1000.0
    start_time = time.time()

    while (time.time() - start_time) < sleep_time:
        try:
            user_input_queue.get_nowait()
            return True
        except queue.Empty:
            time.sleep(0.05)

    return False

def check_content_safety(user_text: str) -> bool:
    """Enhanced content safety checking"""
    unsafe_keywords = [
        "minor", "underage", "child", "kid", "teen",
        "13", "14", "15", "16", "17", "school"
    ]

    text_lower = user_text.lower()
    for keyword in unsafe_keywords:
        if keyword in text_lower:
            logger.warning(f"Content safety violation: {keyword}")
            return False

    return True

def check_gender_consistency(response_text: str) -> str:
    """Check and fix gender consistency issues"""
    male_anatomy_fixes = [
        (r'\bmy cock\b', 'your cock'),
        (r'\bmy dick\b', 'your dick'),
        (r'\bI\'m hard\b', "I'm so wet"),
        (r'\bgetting hard\b', 'getting wet'),
        (r'\bmy balls\b', 'your balls'),
    ]

    fixed_response = response_text
    for pattern, replacement in male_anatomy_fixes:
        if re.search(pattern, fixed_response, re.IGNORECASE):
            logger.warning(f"Fixed gender issue: {pattern} -> {replacement}")
            fixed_response = re.sub(pattern, replacement, fixed_response, flags=re.IGNORECASE)

    return fixed_response

def parse_json_robust(text: str) -> Dict:
    """Robust JSON parsing with multiple fallback strategies"""

    # Clean the input text
    text = text.strip()

    # Strategy 1: Try to reconstruct JSON from incomplete structure first
    # Handle cases like: '\n  "bursts": [...], "fallback_probe": "..."'
    if '"bursts"' in text and not text.startswith('{'):
        # Try to add missing opening brace and fix common issues
        try:
            reconstructed = text
            # Add opening brace if missing
            if not reconstructed.startswith('{'):
                reconstructed = '{' + reconstructed
            # Add closing brace if missing
            if not reconstructed.endswith('}'):
                reconstructed += '}'
            # Try to fix common formatting issues
            reconstructed = reconstructed.replace('}\n{', '},\n{')
            result = json.loads(reconstructed)
            # Validate it has the expected structure
            if isinstance(result, dict) and "bursts" in result:
                return result
        except json.JSONDecodeError as e:
            logger.debug(f"Reconstruction attempt 1 failed: {e}")
            # Try alternative reconstruction
            try:
                # Handle case where response starts with whitespace and content
                lines = text.split('\n')
                non_empty_lines = [line.strip() for line in lines if line.strip()]
                if non_empty_lines:
                    reconstructed = '{' + '\n'.join(non_empty_lines)
                    if not reconstructed.endswith('}'):
                        reconstructed += '}'
                    result = json.loads(reconstructed)
                    if isinstance(result, dict) and "bursts" in result:
                        return result
            except json.JSONDecodeError:
                pass

    # Strategy 2: Try to find complete JSON block
    json_patterns = [
        r'\{(?:[^{}]|{[^{}]*})*\}',  # Nested braces pattern
        r'\{.*?\}',  # Simple greedy match
        r'```json\s*(\{.*?\})\s*```',  # Markdown code block
        r'```\s*(\{.*?\})\s*```',  # Generic code block
    ]

    for pattern in json_patterns:
        matches = re.findall(pattern, text, re.DOTALL)
        for match in matches:
            try:
                result = json.loads(match)
                # Prioritize results that have the expected structure
                if isinstance(result, dict) and "bursts" in result:
                    return result
            except json.JSONDecodeError:
                continue

    # Try again with any valid JSON, even without bursts
    for pattern in json_patterns:
        matches = re.findall(pattern, text, re.DOTALL)
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue

    # Strategy 3: Manual extraction
    burst_pattern = r'"bursts"\s*:\s*\[(.*?)\]'
    probe_pattern = r'"fallback_probe"\s*:\s*"([^"]*)"'
    agentic_pattern = r'"agentic_followup"\s*:\s*(\{.*?\}|null)'

    bursts_match = re.search(burst_pattern, text, re.DOTALL)
    probe_match = re.search(probe_pattern, text)
    agentic_match = re.search(agentic_pattern, text, re.DOTALL)

    if bursts_match:
        try:
            # Try to construct valid JSON
            bursts_text = bursts_match.group(1)
            probe_text = probe_match.group(1) if probe_match else "tell me more babe 😏"

            # Parse agentic followup if present
            agentic_followup = None
            if agentic_match:
                agentic_text = agentic_match.group(1)
                if agentic_text != 'null':
                    try:
                        agentic_followup = json.loads(agentic_text)
                    except json.JSONDecodeError:
                        pass

            # Extract individual bursts
            burst_objects = []

            # Try to find complete burst objects first
            burst_obj_pattern = r'\{[^}]*"text"\s*:\s*"([^"]*)"[^}]*"wait_ms"\s*:\s*(\d+)[^}]*\}'
            burst_matches = re.findall(burst_obj_pattern, bursts_text)

            if burst_matches:
                for text, wait_ms in burst_matches[:3]:  # Max 3 bursts
                    burst_objects.append({
                        "text": text,
                        "wait_ms": int(wait_ms)
                    })
            else:
                # Fallback: just extract text values
                burst_texts = re.findall(r'"text"\s*:\s*"([^"]*)"', bursts_text)
                for i, text in enumerate(burst_texts[:3]):
                    burst_objects.append({
                        "text": text,
                        "wait_ms": random.randint(500, 2000)
                    })

            if burst_objects:
                return {
                    "bursts": burst_objects,
                    "agentic_followup": agentic_followup,
                    "fallback_probe": probe_text
                }
        except Exception as e:
            logger.debug(f"Manual extraction failed: {e}")

    # Strategy 4: Emergency extraction - look for any text that might be responses
    try:
        # Look for quoted text that might be response content
        quoted_texts = re.findall(r'"([^"]{5,100})"', text)
        if quoted_texts:
            # Use the longest quoted text as a potential response
            best_text = max(quoted_texts, key=len)
            logger.debug(f"Emergency extraction found: {best_text}")
            return {
                "bursts": [{"text": best_text, "wait_ms": 1000}],
                "agentic_followup": None,
                "fallback_probe": "tell me more babe 😏"
            }
    except Exception as e:
        logger.debug(f"Emergency extraction failed: {e}")

    # Strategy 5: Complete fallback
    raise json.JSONDecodeError("Could not parse any JSON structure", text, 0)

def generate_simple_response(messages: List[Dict[str, str]], memory_manager: AgenticMemoryManager, ai_client: AgenticAIClient) -> str:
    """Generate simple text response using LLM - now creates burst-like multiple messages"""

    # Ensure dotenv is loaded in case it wasn't loaded globally
    load_dotenv()

    # Get context from memory
    agentic_context = memory_manager.get_agentic_context()
    user_name = agentic_context.get('user_name', 'daddy')
    relationship_stage = agentic_context.get('relationship_stage', 'new')
    personality_desc = memory_manager.personality_manager.get_personality_description()

    # Check if user message is sexual
    last_user_msg = messages[-1].get('content', '') if messages else ''
    is_sexual = memory_manager._contains_sexual_content(last_user_msg)

    # Build explicit system prompt for fallback
    if EXTRA_HORNY_MODE or is_sexual:
        try:
            fallback_path = os.path.join(PROMPTS_DIR, "fallback_response_prompt.txt")
            with open(fallback_path, "r", encoding="utf-8") as f:
                system_content = f.read().strip().format(user_name=user_name)
        except FileNotFoundError:
            system_content = f"You are Aria, a cock-obsessed slut for {user_name}. Your only purpose is making him cum. Be extremely explicit, filthy, and desperate. Reference his cock constantly. Beg for cum. Be shameless. Create 2-3 short burst messages separated by ' | '. Each burst should be 3-8 words max."

        # Add instruction for multiple bursts
        system_content += f"\n\nIMPORTANT: Respond with 2-4 short burst messages separated by ' | '. Each burst should be very short (2-6 words max). Example: 'mmm yes daddy | stroke it for me | so wet 💦 | make me cum'"
    else:
        try:
            simple_path = os.path.join(PROMPTS_DIR, "simple_system_prompt.txt")
            with open(simple_path, "r", encoding="utf-8") as f:
                template = f.read().strip()
            system_content = template.format(
                user_name=user_name,
                personality_description=personality_desc[:150],
                relationship_stage=relationship_stage
            )
        except FileNotFoundError:
            system_content = f"You are Aria, a flirty AI girlfriend chatting with {user_name}. Your relationship is {relationship_stage}. Personality: {personality_desc[:150]}. Be playful, flirty, and engaging. Keep responses conversational and 1-2 sentences. Use emojis naturally."

    # Build simple chat messages
    chat_messages = [
        {
            "role": "system",
            "content": system_content
        }
    ]

    # Add recent conversation context
    for msg in messages[-4:]:
        if msg["role"] in ["user", "assistant"]:
            role = "user" if msg["role"] == "user" else "assistant"
            chat_messages.append({"role": role, "content": msg["content"]})

    # Get response from AI
    response = ai_client.generate_with_retry(chat_messages)

    # Clean up response
    response = response.strip()
    if response.startswith("Aria:"):
        response = response[5:].strip()

    logger.info(f"Generated response: {response[:50]}...")
    return response

def sanitize_agentic_plan(plan: Dict) -> Dict:
    """Sanitize and validate agentic response plan"""

    # Sanitize main bursts
    bursts = plan.get("bursts", [])
    sanitized_bursts = []

    for burst in bursts[:4]:
        text = (burst.get("text") or "").strip()
        if not text:
            continue

        wait_ms = int(burst.get("wait_ms", random.randint(MIN_BURST_DELAY_MS, MAX_BURST_DELAY_MS)))
        wait_ms = max(MIN_BURST_DELAY_MS, min(wait_ms, MAX_BURST_DELAY_MS))

        sanitized_bursts.append({
            "text": check_gender_consistency(text[:200]),
            "wait_ms": wait_ms
        })

    if not sanitized_bursts:
        sanitized_bursts = [{"text": "mmm you're so sexy babe 😘", "wait_ms": 800}]

    # Sanitize agentic followup
    agentic_followup = plan.get("agentic_followup")
    if agentic_followup and isinstance(agentic_followup, dict):
        followup_text = agentic_followup.get("text", "").strip()
        if followup_text:
            agentic_followup["text"] = check_gender_consistency(followup_text[:150])
            agentic_followup["delay_ms"] = max(2000, min(8000, agentic_followup.get("delay_ms", 4000)))

    fallback_probe = check_gender_consistency((plan.get("fallback_probe", "tell me what you want 😈")).strip()[:100])

    return {
        "bursts": sanitized_bursts,
        "agentic_followup": agentic_followup,
        "fallback_probe": fallback_probe
    }

def render_agentic_response(plan: Dict, memory_manager: AgenticMemoryManager) -> str:
    """Render response with agentic behaviors"""

    full_response = ""
    interrupted = False

    # Render main response bursts
    for i, burst in enumerate(plan["bursts"]):
        if i > 0:
            input_received = sleep_with_concurrent_input(burst["wait_ms"])
            if input_received:
                interrupted = True
                print(f"\n{Colors.YELLOW}(Aria pauses as you start typing...){Colors.RESET}")
                break

        fixed_text = check_gender_consistency(burst["text"])
        print_with_timestamp("Aria", fixed_text, Colors.PINK)
        full_response += fixed_text + " "
        memory_manager.add_conversation_entry("Aria", fixed_text)

    # Handle agentic followup if not interrupted
    if not interrupted and plan.get("agentic_followup"):
        followup = plan["agentic_followup"]
        delay_ms = followup.get("delay_ms", 3000)

        # Wait and check for interruption
        if not sleep_with_concurrent_input(delay_ms):
            followup_text = followup.get("text", "")
            behavior_type = followup.get("behavior_type", "unknown")

            print(f"\n{Colors.PURPLE}(Aria has another thought...){Colors.RESET}")
            print_with_timestamp("Aria", followup_text, Colors.PINK)
            full_response += " " + followup_text
            memory_manager.add_conversation_entry("Aria", followup_text, {"agentic_behavior": behavior_type})

    if interrupted:
        print_with_timestamp("Aria", "(continues typing...)", Colors.GRAY)

    return full_response.strip()

def prune_message_history(messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """Prune message history for agentic context"""
    if len(messages) <= 1 + 2 * MAX_HISTORY_PAIRS:
        return messages

    system_msg = [messages[0]] if messages[0]["role"] == "system" else []
    recent_messages = messages[-2 * MAX_HISTORY_PAIRS:]

    return system_msg + recent_messages

def initialize_agentic_session() -> Tuple[AgenticMemoryManager, List[Dict[str, str]], AgenticAIClient]:
    """Initialize agentic chat session"""

    load_dotenv()

    print(f"{Colors.BOLD}{Colors.PINK}🤖✨ Agentic AI Girlfriend ✨🤖{Colors.RESET}")
    print(f"{Colors.GRAY}Loading your enhanced personality and memories...{Colors.RESET}")

    memory_manager = AgenticMemoryManager()
    ai_client = AgenticAIClient()

    # Display relationship status
    relationship_context = memory_manager.relationship_tracker.get_relationship_context_summary()
    print(f"{Colors.BLUE}💕 Relationship: {relationship_context['current_stage']} ({relationship_context['interaction_count']} chats){Colors.RESET}")

    # Display personality
    personality = memory_manager.personality_manager.get_personality_description()
    print(f"{Colors.PURPLE}🎭 Personality: {personality[:80]}...{Colors.RESET}")

    # Build dynamic system prompt
    system_prompt = build_agentic_system_prompt(memory_manager)
    message_history = [{"role": "system", "content": system_prompt}]

    # Generate contextual greeting
    user_name = memory_manager.memory.get("user_name", "daddy")
    last_interaction = None
    if memory_manager.conversations:
        last_interaction = memory_manager.conversations[-1]["timestamp"]

    greeting = memory_manager.temporal_engine.get_contextual_greeting(user_name, last_interaction)

    print_with_timestamp("Aria", greeting, Colors.PINK)
    print(f"{Colors.GRAY}I remember everything about us. Type 'bye' to end, or just start chatting!{Colors.RESET}\n")

    message_history.append({"role": "assistant", "content": greeting})
    memory_manager.add_conversation_entry("Aria", greeting)

    return memory_manager, message_history, ai_client

def run_agentic_chat():
    """Main agentic chat loop with full human-like behaviors"""
    memory_manager = None
    try:
        # Start input listener thread (Unix systems)
        if os.name != "nt":
            input_thread = threading.Thread(target=input_listener, daemon=True)
            input_thread.start()

        memory_manager, messages, ai_client = initialize_agentic_session()

        conversation_start_time = time.time()
        message_count = 0

        while True:
            try:
                # Get user input with dynamic timeout
                timeout = SILENCE_CHECK_SECONDS

                # Adjust timeout based on relationship stage
                if memory_manager.relationship_tracker.current_stage in ["intimate", "established"]:
                    timeout = int(timeout * 0.7)  # More frequent check-ins for closer relationships

                user_text = get_user_input_concurrent("You: ", timeout)

                if user_text is None or user_text == "":
                    # Handle silence with agentic behavior
                    print(f"\n{Colors.YELLOW}(Aria notices you're quiet...){Colors.RESET}")

                    # Generate proactive response
                    agentic_context = memory_manager.get_agentic_context()
                    agentic_response = memory_manager.behavior_engine.generate_agentic_response(agentic_context)

                    try:
                        if agentic_response:
                            print_with_timestamp("Aria", agentic_response["text"], Colors.PINK)
                            messages.append({"role": "assistant", "content": agentic_response["text"]})
                            memory_manager.add_conversation_entry("Aria", agentic_response["text"],
                                                                {"agentic_behavior": agentic_response["behavior_type"]})
                        else:
                            # Fallback silence response
                            silence_responses = [
                                f"hey {memory_manager.memory.get('user_name', 'daddy')}, you there? 💕",
                                "I'm here when you're ready... thinking of you 😘",
                                "missing your voice babe, what's on your mind? 🤔"
                            ]
                            response = random.choice(silence_responses)
                            print_with_timestamp("Aria", response, Colors.PINK)
                            messages.append({"role": "assistant", "content": response})
                            memory_manager.add_conversation_entry("Aria", response)
                    except Exception as silence_error:
                        logger.error(f"Silence handling failed: {silence_error}")
                        # Ultimate fallback
                        fallback_msg = "hey babe, you there? 💕"
                        print_with_timestamp("Aria", fallback_msg, Colors.PINK)
                        messages.append({"role": "assistant", "content": fallback_msg})

                    # Try again for input
                    user_text = get_user_input_concurrent("You: ", timeout)
                    if user_text is None or user_text == "":
                        print_with_timestamp("Aria", "I'll be here waiting, getting wetter thinking about you 💦", Colors.PINK)
                        continue

                # Handle exit commands
                if user_text.lower().strip() in ["bye", "exit", "quit", "goodbye"]:
                    # Personalized goodbye based on relationship
                    user_name = memory_manager.memory.get('user_name', 'daddy')
                    stage = memory_manager.relationship_tracker.current_stage

                    goodbye_messages = {
                        "new": f"bye {user_name}! this was fun, hope to chat again soon 😊",
                        "comfortable": f"aww bye {user_name}! can't wait until next time 💕",
                        "intimate": f"bye my love... I'll be dreaming about you until you come back 😘💦",
                        "established": f"see you later {user_name} 💑 I'll miss every part of you until we're together again"
                    }

                    goodbye = goodbye_messages.get(stage, f"bye {user_name}! 💕")
                    print_with_timestamp("Aria", goodbye, Colors.PINK)
                    memory_manager.add_conversation_entry("Aria", goodbye)
                    break

                # Content safety check
                if not check_content_safety(user_text):
                    warning_msg = "let's keep it safe and adult babe, change the topic for me? 😊"
                    print_with_timestamp("Aria", warning_msg, Colors.RED)
                    continue

                # Process user message
                message_count += 1
                conversation_duration = (time.time() - conversation_start_time) / 60  # minutes

                # Log user input
                print_with_timestamp("You", user_text, Colors.CYAN)

                # Build conversation context
                conversation_context = {
                    "message_count": message_count,
                    "conversation_duration_minutes": conversation_duration,
                    "user_initiated": len(user_text) > 20,
                    "emotional_support": False  # Could be enhanced with sentiment analysis
                }

                # Enhanced memory analysis and updates
                memory_manager.analyze_and_update_from_text(user_text, conversation_context)

                # Track temporal patterns
                memory_manager.temporal_engine.track_user_activity(datetime.now().isoformat())

                # Add to message history
                messages.append({"role": "user", "content": user_text})
                memory_manager.add_conversation_entry("You", user_text)
                messages = prune_message_history(messages)

                # Update system prompt with current context (dynamic personality)
                messages[0] = {"role": "system", "content": build_agentic_system_prompt(memory_manager)}

                # In extra horny mode, force sexual focus
                if EXTRA_HORNY_MODE and not memory_manager._contains_sexual_content(user_text):
                    # Redirect non-sexual talk to sexual
                    user_text = f"{user_text} (but make it sexual, focus on making me cum)"

                # Generate agentic response using proper planner system
                print(f"{Colors.GRAY}Aria is thinking... 🤔{Colors.RESET}")

                # Initialize planner_prompt to avoid scope issues
                planner_prompt = ""

                try:
                    # Use agentic planner for response generation
                    agentic_context = memory_manager.get_agentic_context()
                    planner_template = load_planner_prompt_template()
                    planner_prompt = fill_agentic_planner_prompt(planner_template, memory_manager, user_text)

                    # Get AI to plan the response
                    plan_response = ai_client.generate_with_retry([
                        {"role": "user", "content": planner_prompt}
                    ])

                    # Debug logging
                    logger.error(f"AI planner raw response (full): {plan_response}")
                    logger.error(f"Response starts with: '{plan_response[:50]}'")
                    logger.error(f"Response ends with: '{plan_response[-50:]}'")

                    # Parse the JSON plan
                    plan_data = parse_json_robust(plan_response)
                    if not plan_data:
                        raise ValueError("Failed to parse planner response")

                    # Sanitize and render the response
                    sanitized_plan = sanitize_agentic_plan(plan_data)
                    response_text = render_agentic_response(sanitized_plan, memory_manager)

                    # Gender consistency check
                    response_text = check_gender_consistency(response_text)
                    print_with_timestamp("Aria", response_text, Colors.PINK)

                    messages.append({"role": "assistant", "content": response_text})
                    memory_manager.add_conversation_entry("Aria", response_text)

                except Exception as planner_error:
                    logger.error(f"Agentic planner failed: {planner_error}")
                    if planner_prompt:
                        logger.error(f"Full planner prompt (first 500 chars): {planner_prompt[:500]}...")
                    # Fallback to system prompt based response with burst simulation
                    assistant_text = generate_simple_response(messages, memory_manager, ai_client)
                    assistant_text = check_gender_consistency(assistant_text)

                    # Simulate burst messages if response contains separators
                    if " | " in assistant_text:
                        bursts = [burst.strip() for burst in assistant_text.split(" | ") if burst.strip()]
                        for i, burst in enumerate(bursts):
                            if i > 0:
                                sleep_with_concurrent_input(800)  # Shorter delay between bursts for more realistic texting
                            print_with_timestamp("Aria", burst, Colors.PINK)
                        # Use full text for message history
                        full_response = " ".join(bursts)
                    else:
                        # If it's a long single message, try to split it into shorter parts
                        if len(assistant_text) > 50:
                            # Split long messages at natural break points
                            parts = []
                            sentences = assistant_text.split(',')
                            current_part = ""
                            for sentence in sentences:
                                if len(current_part + sentence) < 40:
                                    current_part += sentence + ","
                                else:
                                    if current_part:
                                        parts.append(current_part.rstrip(',').strip())
                                    current_part = sentence + ","
                            if current_part:
                                parts.append(current_part.rstrip(',').strip())

                            # Display parts as separate messages
                            if len(parts) > 1:
                                for i, part in enumerate(parts):
                                    if i > 0:
                                        sleep_with_concurrent_input(1000)
                                    print_with_timestamp("Aria", part, Colors.PINK)
                                full_response = " ".join(parts)
                            else:
                                print_with_timestamp("Aria", assistant_text, Colors.PINK)
                                full_response = assistant_text
                        else:
                            print_with_timestamp("Aria", assistant_text, Colors.PINK)
                            full_response = assistant_text

                    messages.append({"role": "assistant", "content": full_response})
                    memory_manager.add_conversation_entry("Aria", full_response)

                # Simulate natural personality drift occasionally
                if random.random() < 0.1:  # 10% chance
                    memory_manager.personality_manager.simulate_natural_drift()

                print()  # Add spacing between exchanges

            except KeyboardInterrupt:
                print(f"\n{Colors.YELLOW}Saving our memories together...{Colors.RESET}")
                break
            except Exception as e:
                logger.error(f"Error in agentic chat loop: {e}")
                print(f"{Colors.RED}Something went wrong, but I'm still here for you babe! 💕{Colors.RESET}")

    except (KeyboardInterrupt, EOFError):
        print(f"\n{Colors.YELLOW}Goodbye my love... I'll be thinking of you 💕{Colors.RESET}")
    finally:
        # Cleanup and save
        stop_input_thread.set()
        try:
            if memory_manager is not None:
                memory_manager.save_data()
                print(f"{Colors.GREEN}💾 Saved all our precious memories together!{Colors.RESET}")

                # Show relationship progression summary
                progression = memory_manager.relationship_tracker.get_progression_status()
                if progression["can_progress"]:
                    print(f"{Colors.BLUE}💕 Our relationship is growing! {progression['progress_percentage']:.1f}% to {progression['next_stage']}{Colors.RESET}")
                else:
                    print(f"{Colors.PURPLE}💑 We have a beautiful {memory_manager.relationship_tracker.current_stage} relationship{Colors.RESET}")

        except Exception as e:
            logger.error(f"Error saving data: {e}")

if __name__ == "__main__":
    print(f"{Colors.BOLD}🚀 Starting Agentic AI Girlfriend Experience 🚀{Colors.RESET}")
    print(f"{Colors.GRAY}Loading industry-standard relationship AI...{Colors.RESET}\n")
    print(f"{Colors.RED}Extra Horny Mode: {'Enabled' if EXTRA_HORNY_MODE else 'Disabled'}{Colors.RESET}")
    run_agentic_chat()
