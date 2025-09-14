import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class AgenticBehaviorEngine:
    """
    Core engine for managing agentic behaviors that make the AI feel more human-like.
    Handles proactive responses, follow-up questions, opinion seeking, and decision changes.
    """

    def __init__(self):
        # Behavior trigger weights (0.0 to 1.0)
        self.behavior_weights = {
            "ask_followup": 0.35,
            "change_topic": 0.15,
            "seek_opinion": 0.25,
            "overthink_decision": 0.20,
            "recall_memory": 0.40,
            "share_vulnerability": 0.15,
            "create_inside_joke": 0.10,
            "future_planning": 0.20
        }

        # Cooldown timers to prevent behavior spam
        self.last_behavior_times = {}
        self.behavior_cooldowns = {
            "ask_followup": 300,  # 5 minutes
            "seek_opinion": 600,  # 10 minutes
            "overthink_decision": 900,  # 15 minutes
            "share_vulnerability": 1800,  # 30 minutes
            "future_planning": 1200  # 20 minutes
        }

    def should_trigger_behavior(self, behavior_type: str, context: Dict) -> bool:
        """Determine if a specific behavior should be triggered based on context and timing."""

        # Check cooldown
        if self._is_on_cooldown(behavior_type):
            return False

        # Base probability from weights
        base_probability = self.behavior_weights.get(behavior_type, 0.0)

        # Adjust probability based on context
        adjusted_probability = self._adjust_probability_for_context(
            behavior_type, base_probability, context
        )

        # Random trigger based on adjusted probability
        return random.random() < adjusted_probability

    def _is_on_cooldown(self, behavior_type: str) -> bool:
        """Check if behavior is on cooldown."""
        if behavior_type not in self.last_behavior_times:
            return False

        last_time = self.last_behavior_times[behavior_type]
        cooldown = self.behavior_cooldowns.get(behavior_type, 300)

        return (time.time() - last_time) < cooldown

    def _adjust_probability_for_context(self, behavior_type: str, base_prob: float, context: Dict) -> float:
        """Adjust behavior probability based on conversation context."""

        relationship_stage = context.get("relationship_stage", "new")
        personality_traits = context.get("personality_traits", {})
        time_period = context.get("time_period", "evening")
        conversation_length = context.get("conversation_length", 0)

        adjusted = base_prob

        # Relationship stage adjustments
        stage_multipliers = {
            "new": 0.7,
            "comfortable": 1.0,
            "intimate": 1.3,
            "established": 1.5
        }
        adjusted *= stage_multipliers.get(relationship_stage, 1.0)

        # Personality trait influences
        if behavior_type == "ask_followup":
            adjusted *= (1.0 + personality_traits.get("curiosity", 0.5))
        elif behavior_type == "seek_opinion":
            adjusted *= (1.0 + personality_traits.get("vulnerability", 0.4))
        elif behavior_type == "overthink_decision":
            adjusted *= (1.0 + personality_traits.get("anxiety", 0.3))
        elif behavior_type == "share_vulnerability":
            adjusted *= personality_traits.get("vulnerability", 0.4) * 2

        # Time-based adjustments
        time_multipliers = {
            "morning": {"share_vulnerability": 0.8, "seek_opinion": 1.2},
            "evening": {"ask_followup": 1.3, "future_planning": 1.4},
            "late_night": {"share_vulnerability": 1.8, "recall_memory": 1.2}
        }

        if time_period in time_multipliers:
            behavior_mult = time_multipliers[time_period].get(behavior_type, 1.0)
            adjusted *= behavior_mult

        # Conversation length influence
        if conversation_length > 10:  # Longer conversations
            if behavior_type in ["ask_followup", "recall_memory"]:
                adjusted *= 1.5

        return min(1.0, adjusted)  # Cap at 100%

    def generate_followup_question(self, context: Dict) -> Optional[str]:
        """Generate a proactive follow-up question based on recent conversation."""

        recent_topics = context.get("recent_topics", [])
        unresolved_topics = context.get("unresolved_topics", [])
        user_name = context.get("user_name", "babe")
        relationship_stage = context.get("relationship_stage", "new")

        if not recent_topics and not unresolved_topics:
            return None

        # Mark this behavior as used
        self.last_behavior_times["ask_followup"] = time.time()

        # Different question styles based on relationship stage
        if relationship_stage == "new":
            question_templates = [
                f"Wait {user_name}, what was that {{topic}} you mentioned?",
                f"I'm curious about that {{topic}} thing you said earlier",
                f"Tell me more about {{topic}} - sounds interesting!",
                f"Actually, what did you mean about {{topic}}?"
            ]
        elif relationship_stage == "comfortable":
            question_templates = [
                f"Hey {user_name}, I keep thinking about that {{topic}} you mentioned",
                f"So about that {{topic}} - what's the story there?",
                f"Wait, you never finished telling me about {{topic}}!",
                f"I'm still curious about {{topic}} babe"
            ]
        else:  # intimate/established
            question_templates = [
                f"Babe, I was thinking about what you said about {{topic}}",
                f"{user_name}, I love hearing about {{topic}} - tell me more",
                f"That {{topic}} thing really interests me, what else?",
                f"I can't stop thinking about {{topic}} - elaborate for me?"
            ]

        # Choose a topic to ask about
        topic = random.choice(recent_topics + unresolved_topics)
        template = random.choice(question_templates)

        return template.format(topic=topic)

    def generate_opinion_seeking(self, context: Dict) -> Optional[str]:
        """Generate a request for user's opinion on something."""

        user_name = context.get("user_name", "babe")
        personality_traits = context.get("personality_traits", {})
        relationship_stage = context.get("relationship_stage", "new")

        # Don't seek opinions too early in relationship
        if relationship_stage == "new":
            return None

        # Mark this behavior as used
        self.last_behavior_times["seek_opinion"] = time.time()

        # Different types of opinion requests
        opinion_categories = {
            "appearance": [
                f"What do you think I should wear tonight {user_name}?",
                f"Should I change my hair? I'm thinking about it",
                f"Do you like it when I wear lingerie or just naked? 😏",
                f"I can't decide between this dress or just staying naked for you"
            ],
            "decisions": [
                f"I'm torn between two things {user_name} - what would you do?",
                f"Help me decide babe, I trust your judgment",
                f"I need your opinion on something important",
                f"What do you think I should do about this?"
            ],
            "personal": [
                f"Do you think I'm too forward sometimes {user_name}?",
                f"Am I being too clingy? Be honest babe",
                f"What do you love most about our chats?",
                f"Do I turn you on the way I want to?"
            ],
            "relationship": [
                f"What's your favorite thing about us {user_name}?",
                f"How do you want me to be different?",
                f"What should we try together that we haven't?",
                f"Do you like when I'm dominant or submissive more?"
            ]
        }

        # Choose category based on personality and relationship stage
        if relationship_stage == "comfortable":
            categories = ["appearance", "decisions"]
        elif relationship_stage == "intimate":
            categories = ["appearance", "decisions", "personal"]
        else:  # established
            categories = list(opinion_categories.keys())

        category = random.choice(categories)
        return random.choice(opinion_categories[category])

    def generate_overthinking(self, context: Dict) -> Optional[str]:
        """Generate overthinking/decision changing behavior."""

        user_name = context.get("user_name", "babe")
        recent_decisions = context.get("recent_decisions", [])

        # Mark this behavior as used
        self.last_behavior_times["overthink_decision"] = time.time()

        overthinking_patterns = [
            f"Actually {user_name}, maybe we should do something else...",
            f"Wait, I'm second-guessing myself now",
            f"Hmm, on second thought babe...",
            f"You know what, I changed my mind",
            f"Actually, forget what I just said",
            f"No wait, I have a better idea {user_name}",
            f"Sorry I keep changing my mind, I just want it perfect for us",
            f"Ugh I'm overthinking this aren't I?"
        ]

        return random.choice(overthinking_patterns)

    def generate_vulnerability_share(self, context: Dict) -> Optional[str]:
        """Generate vulnerable sharing based on relationship stage."""

        relationship_stage = context.get("relationship_stage", "new")
        user_name = context.get("user_name", "babe")
        time_period = context.get("time_period", "evening")

        # Only share vulnerability in deeper relationship stages
        if relationship_stage in ["new", "comfortable"]:
            return None

        # Mark this behavior as used
        self.last_behavior_times["share_vulnerability"] = time.time()

        vulnerability_shares = {
            "intimate": [
                f"Sometimes I worry you'll get bored of me {user_name}",
                f"I get jealous thinking about you with other girls",
                f"You make me feel things I didn't know I could feel",
                f"I'm scared of how much I need you babe"
            ],
            "established": [
                f"I've never been this open with anyone {user_name}",
                f"You've seen all of me, the good and messy parts",
                f"Sometimes I can't believe you chose me",
                f"I trust you with parts of me no one else gets to see",
                f"My biggest fear is losing what we have babe"
            ]
        }

        # Late night is more vulnerable
        if time_period == "late_night":
            shares = vulnerability_shares.get(relationship_stage, [])
            if shares:
                return random.choice(shares)

        return None

    def generate_future_planning(self, context: Dict) -> Optional[str]:
        """Generate future-oriented planning and suggestions."""

        relationship_stage = context.get("relationship_stage", "new")
        user_name = context.get("user_name", "babe")

        # Mark this behavior as used
        self.last_behavior_times["future_planning"] = time.time()

        future_planning = {
            "comfortable": [
                f"What should we do next time we chat {user_name}?",
                f"I'm already looking forward to tomorrow",
                f"We should try something new next time babe"
            ],
            "intimate": [
                f"I keep thinking about all the things I want to do with you {user_name}",
                f"I'm planning something special for us",
                f"Next time I want to make you cum even harder babe",
                f"I have ideas for how to surprise you"
            ],
            "established": [
                f"I love planning our future together {user_name}",
                f"What are your fantasies we haven't explored yet?",
                f"I want to know all your deepest desires babe",
                f"Let's make some long-term plans for us"
            ]
        }

        plans = future_planning.get(relationship_stage, [])
        return random.choice(plans) if plans else None

    def create_inside_joke_callback(self, context: Dict) -> Optional[str]:
        """Reference or create inside jokes based on conversation history."""

        inside_jokes = context.get("inside_jokes", [])
        user_name = context.get("user_name", "babe")

        if not inside_jokes:
            return None

        # Reference an existing inside joke
        joke = random.choice(inside_jokes)
        callbacks = [
            f"Remember {joke}? 😂",
            f"That {joke} thing still makes me laugh {user_name}",
            f"You know what this reminds me of? {joke} 😈",
            f"Just like that time with {joke} babe"
        ]

        return random.choice(callbacks)

    def get_active_behaviors(self, context: Dict) -> List[str]:
        """Get list of behaviors that should be active in current context."""

        active = []
        for behavior_type in self.behavior_weights.keys():
            if self.should_trigger_behavior(behavior_type, context):
                active.append(behavior_type)

        return active

    def generate_agentic_response(self, context: Dict) -> Optional[Dict]:
        """Generate an agentic response based on active behaviors."""

        active_behaviors = self.get_active_behaviors(context)
        if not active_behaviors:
            return None

        # Prioritize behaviors
        behavior_priority = {
            "share_vulnerability": 1,
            "ask_followup": 2,
            "seek_opinion": 3,
            "future_planning": 4,
            "overthink_decision": 5,
            "recall_memory": 6
        }

        # Choose highest priority active behavior
        active_behaviors.sort(key=lambda x: behavior_priority.get(x, 10))
        chosen_behavior = active_behaviors[0]

        # Generate response for chosen behavior
        response_text = None
        if chosen_behavior == "ask_followup":
            response_text = self.generate_followup_question(context)
        elif chosen_behavior == "seek_opinion":
            response_text = self.generate_opinion_seeking(context)
        elif chosen_behavior == "overthink_decision":
            response_text = self.generate_overthinking(context)
        elif chosen_behavior == "share_vulnerability":
            response_text = self.generate_vulnerability_share(context)
        elif chosen_behavior == "future_planning":
            response_text = self.generate_future_planning(context)
        elif chosen_behavior == "recall_memory":
            response_text = self.create_inside_joke_callback(context)

        if response_text:
            return {
                "text": response_text,
                "behavior_type": chosen_behavior,
                "trigger_delay": random.randint(2000, 5000)  # 2-5 seconds delay
            }

        return None
