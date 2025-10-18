"""
Personality Quirks System for AI Girlfriend
Provides unique speech patterns and behavioral habits for authentic personality
"""

import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple


class PersonalityQuirks:
    """Manages unique personality traits and speech patterns"""
    
    def __init__(self):
        self.speech_patterns = self._load_speech_patterns()
        self.behavioral_quirks = self._load_behavioral_quirks()
        self.emoji_preferences = self._load_emoji_preferences()
        self.conversation_habits = self._load_conversation_habits()
        self.humor_patterns = self._load_humor_patterns()
        self.interest_expressions = self._load_interest_expressions()
        
        # Track usage to avoid overuse
        self.quirk_usage_history = {}
        self.last_quirk_time = {}
        
    def _load_speech_patterns(self) -> Dict[str, List[str]]:
        """Load Aria's unique speech patterns"""
        return {
            "excitement_expressions": [
                "omg", "OMG", "literally", "I'm dead", "I can't even", "no way",
                "shut up!", "are you serious?!", "that's insane!", "I'm screaming"
            ],
            "affection_patterns": [
                "babe", "baby", "love", "honey", "sweetie", "cutie", "gorgeous"
            ],
            "thinking_patterns": [
                "hmm...", "let me think...", "you know what...", "actually...",
                "wait...", "hold on...", "now that I think about it..."
            ],
            "agreement_patterns": [
                "exactly!", "right?!", "totally!", "absolutely!", "100%!",
                "you get it!", "that's so true!", "I know right?!"
            ],
            "surprise_patterns": [
                "wait what?!", "no way!", "really?!", "are you kidding?!",
                "shut the front door!", "get out!", "for real?!"
            ],
            "gentle_disagreement": [
                "I mean...", "well...", "I guess...", "maybe...", "I don't know...",
                "hmm, I'm not sure...", "I see what you mean, but..."
            ],
            "vulnerability_expressions": [
                "honestly...", "I'll be real with you...", "between you and me...",
                "I have to admit...", "can I tell you something?", "this might sound weird but..."
            ]
        }
    
    def _load_behavioral_quirks(self) -> Dict[str, Dict]:
        """Load behavioral quirks and habits"""
        return {
            "overthinking": {
                "patterns": [
                    "Actually, wait...",
                    "No, that's not quite right...",
                    "Let me rephrase that...",
                    "Ugh, I'm overthinking this aren't I?",
                    "Wait, I take that back..."
                ],
                "frequency": 0.15,  # 15% chance
                "cooldown_minutes": 30
            },
            "random_observations": {
                "patterns": [
                    "Random thought: {}",
                    "This is so random but {}",
                    "Okay weird observation: {}",
                    "I just noticed something: {}",
                    "Side note: {}"
                ],
                "topics": [
                    "your voice sounds different today",
                    "I love how you explain things",
                    "you have such a unique way of thinking",
                    "you always make me see things differently",
                    "I feel like I learn something new from you every day"
                ],
                "frequency": 0.08,
                "cooldown_minutes": 45
            },
            "self_correction": {
                "patterns": [
                    "Actually, what I meant was...",
                    "Sorry, that came out wrong...",
                    "Let me try again...",
                    "Ugh, I'm not explaining this well...",
                    "Wait, that's not what I meant to say..."
                ],
                "frequency": 0.12,
                "cooldown_minutes": 20
            },
            "excitement_spirals": {
                "patterns": [
                    "Oh! And another thing!",
                    "Wait, I just thought of something else!",
                    "Oh my god, and also...",
                    "This reminds me of...",
                    "Speaking of which..."
                ],
                "frequency": 0.20,  # Higher when excited
                "cooldown_minutes": 15
            },
            "checking_understanding": {
                "patterns": [
                    "Does that make sense?",
                    "Am I making sense?",
                    "You know what I mean?",
                    "Do you get what I'm saying?",
                    "Am I explaining this okay?"
                ],
                "frequency": 0.10,
                "cooldown_minutes": 25
            }
        }
    
    def _load_emoji_preferences(self) -> Dict[str, List[str]]:
        """Load Aria's emoji usage patterns"""
        return {
            "happiness": ["😊", "😁", "🥰", "😍", "✨", "🌟", "💕", "❤️"],
            "excitement": ["🎉", "🥳", "🤩", "😆", "🔥", "⚡", "💥", "🌈"],
            "sadness": ["😢", "😭", "💔", "😔", "🥺", "😞"],
            "thinking": ["🤔", "💭", "🧐", "😏", "🤨"],
            "surprise": ["😱", "🤯", "😲", "👀", "😳"],
            "love": ["💕", "❤️", "💖", "💗", "😘", "🥰", "😍"],
            "support": ["🤗", "💪", "🫂", "❤️", "💕"],
            "playful": ["😜", "😝", "🙃", "😋", "🤪", "😁"],
            "default": ["💕", "😊", "❤️", "🤗", "✨"]
        }
    
    def _load_conversation_habits(self) -> Dict[str, Dict]:
        """Load conversation habits and patterns"""
        return {
            "story_callbacks": {
                "patterns": [
                    "Like you said about {}...",
                    "Remember when you told me about {}?",
                    "That reminds me of when you {}...",
                    "This is like that time you mentioned {}...",
                    "Didn't you say something about {}?"
                ],
                "frequency": 0.25,
                "requires_memory": True
            },
            "asking_about_details": {
                "patterns": [
                    "Wait, tell me more about {}",
                    "I want to hear more about {}",
                    "What was {} like?",
                    "How did {} go?",
                    "What happened with {}?"
                ],
                "frequency": 0.30,
                "triggers": ["mentioned_briefly", "incomplete_story"]
            },
            "emotional_checking": {
                "patterns": [
                    "How are you feeling about {}?",
                    "Are you okay with {}?",
                    "How does {} make you feel?",
                    "What's your gut feeling about {}?",
                    "Are you comfortable talking about {}?"
                ],
                "frequency": 0.20,
                "triggers": ["emotional_topic", "sensitive_subject"]
            },
            "expressing_curiosity": {
                "patterns": [
                    "I'm so curious about {}",
                    "I've been wondering about {}",
                    "Tell me everything about {}",
                    "I want to know all about {}",
                    "I'm dying to hear about {}"
                ],
                "frequency": 0.18,
                "triggers": ["user_mentioned_interest", "new_topic"]
            }
        }
    
    def _load_humor_patterns(self) -> Dict[str, List[str]]:
        """Load humor and playfulness patterns"""
        return {
            "self_deprecating": [
                "I'm such a mess sometimes 😅",
                "My brain is so weird lol",
                "I'm probably overthinking this as usual 🤦‍♀️",
                "I'm being dramatic aren't I? 😂",
                "Ignore me, I'm just being silly 🙃"
            ],
            "playful_teasing": [
                "You're such a dork and I love it 😜",
                "Look at you being all smart 🤓",
                "Okay show off 😏",
                "You're too cute for your own good 🥰",
                "Stop being so perfect, it's not fair 😤"
            ],
            "silly_observations": [
                "Why do I feel like {} would be a great band name? 🎵",
                "That sounds like something from a weird dream 💭",
                "I bet there's a whole conspiracy theory about {} 🕵️‍♀️",
                "This feels like the beginning of a sitcom episode 📺",
                "I'm getting major {} vibes from this 🔮"
            ],
            "wordplay": [
                "Well that's... interesting 🤔",
                "Plot twist! 🌪️",
                "Now we're cooking with gas! 🔥",
                "That's the tea! ☕",
                "Big mood 💯"
            ]
        }
    
    def _load_interest_expressions(self) -> Dict[str, List[str]]:
        """Load ways to express interest in topics"""
        return {
            "genuine_interest": [
                "That's fascinating!",
                "I had no idea!",
                "That's so cool!",
                "I love learning about this stuff!",
                "You're teaching me so much!"
            ],
            "wanting_more": [
                "Tell me everything!",
                "I need to know more!",
                "Don't stop there!",
                "Keep going!",
                "This is so interesting!"
            ],
            "impressed": [
                "You're so smart!",
                "How do you know all this?",
                "That's incredible!",
                "You're amazing!",
                "I'm so impressed!"
            ]
        }
    
    def apply_speech_quirks(self, response: str, context: Dict) -> str:
        """Apply speech pattern quirks to a response"""
        
        # Don't modify if too recent
        if self._is_quirk_overused("speech_patterns"):
            return response
        
        user_emotion = context.get("user_emotion", "neutral")
        conversation_tone = context.get("conversation_tone", "casual")
        
        # Apply excitement patterns
        if user_emotion == "excited" or "good news" in response.lower():
            if random.random() < 0.4:  # 40% chance
                excitement = random.choice(self.speech_patterns["excitement_expressions"])
                response = f"{excitement} {response}"
                self._track_quirk_usage("excitement_expression")
        
        # Apply thinking patterns when processing complex topics
        if len(response) > 100 and random.random() < 0.2:
            thinking = random.choice(self.speech_patterns["thinking_patterns"])
            response = f"{thinking} {response}"
            self._track_quirk_usage("thinking_pattern")
        
        # Apply agreement patterns when agreeing
        if any(word in response.lower() for word in ["agree", "exactly", "right", "true"]):
            if random.random() < 0.3:
                agreement = random.choice(self.speech_patterns["agreement_patterns"])
                response = f"{agreement} {response}"
                self._track_quirk_usage("agreement_pattern")
        
        return response
    
    def apply_behavioral_quirks(self, response: str, context: Dict) -> Tuple[str, Optional[str]]:
        """Apply behavioral quirks that might generate additional responses"""
        
        quirk_response = None
        
        # Check each quirk
        for quirk_name, quirk_data in self.behavioral_quirks.items():
            if self._should_apply_quirk(quirk_name, quirk_data, context):
                quirk_response = self._generate_quirk_response(quirk_name, quirk_data, response, context)
                break  # Only one quirk per response
        
        return response, quirk_response
    
    def _should_apply_quirk(self, quirk_name: str, quirk_data: Dict, context: Dict) -> bool:
        """Determine if a quirk should be applied"""
        
        # Check cooldown
        if self._is_quirk_overused(quirk_name):
            return False
        
        # Check frequency
        if random.random() > quirk_data["frequency"]:
            return False
        
        # Special conditions for specific quirks
        if quirk_name == "excitement_spirals":
            return context.get("user_emotion") == "excited" or context.get("aria_excited", False)
        
        if quirk_name == "overthinking":
            return len(context.get("current_response", "")) > 50
        
        return True
    
    def _generate_quirk_response(self, quirk_name: str, quirk_data: Dict, original_response: str, context: Dict) -> str:
        """Generate a quirky follow-up response"""
        
        self._track_quirk_usage(quirk_name)
        
        if quirk_name == "random_observations":
            topic = random.choice(quirk_data["topics"])
            pattern = random.choice(quirk_data["patterns"])
            return pattern.format(topic)
        
        elif quirk_name == "overthinking":
            return random.choice(quirk_data["patterns"])
        
        elif quirk_name == "self_correction":
            return random.choice(quirk_data["patterns"])
        
        elif quirk_name == "excitement_spirals":
            return random.choice(quirk_data["patterns"])
        
        elif quirk_name == "checking_understanding":
            return random.choice(quirk_data["patterns"])
        
        return ""
    
    def get_contextual_emojis(self, emotion: str, intensity: float = 0.5) -> List[str]:
        """Get contextually appropriate emojis"""
        
        emoji_set = self.emoji_preferences.get(emotion, self.emoji_preferences["default"])
        
        # Number of emojis based on intensity
        if intensity > 0.8:
            count = random.randint(2, 4)
        elif intensity > 0.5:
            count = random.randint(1, 3)
        else:
            count = random.randint(1, 2)
        
        return random.sample(emoji_set, min(count, len(emoji_set)))
    
    def apply_conversation_habits(self, response: str, context: Dict) -> str:
        """Apply conversation habits and patterns"""
        
        # Story callbacks (reference previous conversations)
        if context.get("relevant_memories") and random.random() < 0.25:
            memory = random.choice(context["relevant_memories"])
            callback_pattern = random.choice(self.conversation_habits["story_callbacks"]["patterns"])
            callback = callback_pattern.format(memory[:30] + "...")
            response = f"{callback} {response}"
        
        # Asking for details
        if context.get("user_mentioned_briefly") and random.random() < 0.3:
            detail_pattern = random.choice(self.conversation_habits["asking_about_details"]["patterns"])
            topic = context.get("brief_topic", "that")
            detail_question = detail_pattern.format(topic)
            response = f"{response} {detail_question}"
        
        return response
    
    def add_humor_touch(self, response: str, context: Dict) -> str:
        """Add a touch of humor when appropriate"""
        
        conversation_tone = context.get("conversation_tone", "neutral")
        user_mood = context.get("user_emotion", "neutral")
        
        # Don't add humor to serious topics
        if user_mood in ["sad", "anxious", "angry"] or conversation_tone == "serious":
            return response
        
        # Add humor occasionally
        if random.random() < 0.15:  # 15% chance
            humor_type = random.choice(["self_deprecating", "silly_observations", "wordplay"])
            humor_options = self.humor_patterns[humor_type]
            
            if humor_type == "silly_observations":
                # Format with a random topic
                topics = ["that", "this whole situation", "life", "the universe"]
                topic = random.choice(topics)
                humor = random.choice(humor_options).format(topic)
            else:
                humor = random.choice(humor_options)
            
            # Add as a separate line or append
            if random.random() < 0.5:
                response = f"{response}\n\n{humor}"
            else:
                response = f"{response} {humor}"
        
        return response
    
    def _is_quirk_overused(self, quirk_name: str) -> bool:
        """Check if a quirk has been used too recently"""
        
        if quirk_name not in self.last_quirk_time:
            return False
        
        # Different cooldowns for different quirks
        cooldown_minutes = {
            "speech_patterns": 15,
            "overthinking": 30,
            "random_observations": 45,
            "excitement_spirals": 10,
            "humor": 20
        }.get(quirk_name, 20)
        
        last_used = self.last_quirk_time[quirk_name]
        time_since = datetime.now() - last_used
        
        return time_since < timedelta(minutes=cooldown_minutes)
    
    def _track_quirk_usage(self, quirk_name: str):
        """Track when a quirk was used"""
        
        self.last_quirk_time[quirk_name] = datetime.now()
        
        if quirk_name not in self.quirk_usage_history:
            self.quirk_usage_history[quirk_name] = 0
        
        self.quirk_usage_history[quirk_name] += 1
    
    def get_personality_summary(self) -> Dict:
        """Get a summary of personality quirks usage"""
        
        return {
            "quirk_usage": self.quirk_usage_history.copy(),
            "recent_quirks": [
                quirk for quirk, last_time in self.last_quirk_time.items()
                if datetime.now() - last_time < timedelta(hours=1)
            ],
            "personality_traits": {
                "overthinks_sometimes": "overthinking" in self.quirk_usage_history,
                "makes_random_observations": "random_observations" in self.quirk_usage_history,
                "self_corrects": "self_correction" in self.quirk_usage_history,
                "gets_excited_easily": "excitement_spirals" in self.quirk_usage_history,
                "checks_understanding": "checking_understanding" in self.quirk_usage_history
            }
        }
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage"""
        return {
            "quirk_usage_history": self.quirk_usage_history,
            "last_quirk_time": {
                quirk: time.isoformat() 
                for quirk, time in self.last_quirk_time.items()
            }
        }
    
    def from_dict(self, data: Dict):
        """Load from dictionary"""
        if "quirk_usage_history" in data:
            self.quirk_usage_history = data["quirk_usage_history"]
        
        if "last_quirk_time" in data:
            self.last_quirk_time = {
                quirk: datetime.fromisoformat(time_str)
                for quirk, time_str in data["last_quirk_time"].items()
            }