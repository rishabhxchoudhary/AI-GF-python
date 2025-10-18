"""
Realistic Texting Patterns for AI Girlfriend
Simulates natural typing patterns and response timing
"""

import random
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class TypingPattern:
    """Represents a typing behavior pattern"""
    pattern_type: str
    duration_ms: int
    pause_after_ms: int
    description: str


@dataclass
class MessageTiming:
    """Represents timing for a message"""
    typing_duration: float
    pause_before: float
    pause_after: float
    should_show_typing: bool


class RealisticTypingEngine:
    """Simulates realistic typing patterns and message timing"""
    
    def __init__(self):
        self.base_typing_speed = 60  # Words per minute
        self.typing_patterns = self._load_typing_patterns()
        self.message_behaviors = self._load_message_behaviors()
        self.interruption_patterns = self._load_interruption_patterns()
        
        # Track conversation state
        self.conversation_energy = "medium"
        self.last_message_time = None
        self.user_typing_speed = 50  # Estimated user typing speed
        
    def _load_typing_patterns(self) -> Dict[str, Dict]:
        """Load different typing behavior patterns"""
        return {
            "excited": {
                "speed_multiplier": 1.4,  # Types faster when excited
                "typo_chance": 0.15,      # More likely to make typos
                "correction_chance": 0.8,  # Likely to correct typos
                "multi_message_chance": 0.4,  # Break into multiple messages
                "pause_variety": 0.3      # More variation in pauses
            },
            "thoughtful": {
                "speed_multiplier": 0.7,  # Types slower when thinking
                "typo_chance": 0.05,      # Fewer typos
                "correction_chance": 0.9,  # Almost always corrects
                "multi_message_chance": 0.1,  # Usually single messages
                "pause_variety": 0.6,     # Longer pauses while thinking
                "thinking_pauses": True   # Shows typing then pauses
            },
            "casual": {
                "speed_multiplier": 1.0,  # Normal speed
                "typo_chance": 0.08,      # Occasional typos
                "correction_chance": 0.6,  # Sometimes corrects
                "multi_message_chance": 0.2,  # Sometimes splits messages
                "pause_variety": 0.2      # Normal pause variation
            },
            "emotional": {
                "speed_multiplier": 0.9,  # Slightly slower, more careful
                "typo_chance": 0.12,      # More typos when emotional
                "correction_chance": 0.7,  # Usually corrects
                "multi_message_chance": 0.3,  # Sometimes breaks up thoughts
                "pause_variety": 0.4,     # Variable pauses
                "emotional_pauses": True  # Pauses to process emotions
            },
            "playful": {
                "speed_multiplier": 1.2,  # Faster, more energetic
                "typo_chance": 0.10,      # Some typos from quick typing
                "correction_chance": 0.5,  # Sometimes leaves typos for effect
                "multi_message_chance": 0.6,  # Often breaks into multiple
                "pause_variety": 0.2,     # Quick responses
                "rapid_fire": True        # Sometimes sends multiple quick messages
            }
        }
    
    def _load_message_behaviors(self) -> Dict[str, Dict]:
        """Load message-specific behaviors"""
        return {
            "message_splitting": {
                "short_thought": {
                    "triggers": ["but", "also", "and", "oh"],
                    "split_chance": 0.3,
                    "pause_between": (500, 1500)  # ms
                },
                "excitement": {
                    "triggers": ["omg", "wow", "amazing", "incredible"],
                    "split_chance": 0.5,
                    "pause_between": (200, 800)
                },
                "storytelling": {
                    "triggers": ["so", "then", "and then", "after that"],
                    "split_chance": 0.4,
                    "pause_between": (800, 2000)
                }
            },
            "typing_indicators": {
                "start_typing": 0.8,      # 80% chance to show typing
                "pause_and_resume": 0.2,  # 20% chance to pause mid-typing
                "false_starts": 0.1       # 10% chance to start and stop typing
            },
            "response_delays": {
                "immediate": (100, 500),    # Quick responses
                "normal": (1000, 3000),     # Normal thinking time
                "thoughtful": (3000, 8000), # Longer consideration
                "distracted": (5000, 15000) # Doing something else
            }
        }
    
    def _load_interruption_patterns(self) -> Dict[str, Dict]:
        """Load patterns for handling interruptions"""
        return {
            "user_interrupts": {
                "acknowledge": [
                    "Oh wait, you said something!",
                    "Sorry, go ahead!",
                    "Oops, didn't see your message!",
                    "Wait, what were you saying?"
                ],
                "continue_after": [
                    "Anyway, as I was saying...",
                    "But yeah, back to what I was saying...",
                    "Oh right, so...",
                    "Where was I? Oh yeah..."
                ]
            },
            "self_interrupts": {
                "change_direction": [
                    "Actually, wait...",
                    "Hold on, that's not right...",
                    "No wait, I meant...",
                    "Actually, forget that..."
                ],
                "add_thought": [
                    "Oh! And also...",
                    "Wait, I just thought of something...",
                    "Oh my god, and another thing...",
                    "This reminds me..."
                ]
            }
        }
    
    def calculate_typing_time(self, message: str, context: Dict) -> MessageTiming:
        """Calculate realistic typing time for a message"""
        
        # Determine typing pattern based on context
        pattern_type = self._determine_typing_pattern(context)
        pattern = self.typing_patterns[pattern_type]
        
        # Base calculation
        word_count = len(message.split())
        base_time = (word_count / self.base_typing_speed) * 60  # seconds
        
        # Apply speed multiplier
        typing_time = base_time * pattern["speed_multiplier"]
        
        # Add pause variation
        pause_factor = pattern["pause_variety"]
        pause_variation = random.uniform(-pause_factor, pause_factor)
        typing_time *= (1 + pause_variation)
        
        # Add complexity factors
        if "?" in message:
            typing_time *= 1.1  # Questions take slightly longer
        
        if any(word in message.lower() for word in ["actually", "hmm", "well"]):
            typing_time *= 1.2  # Thinking words add time
        
        # Calculate pauses
        pause_before = self._calculate_pause_before(context, pattern_type)
        pause_after = random.uniform(0.2, 0.8)  # Short pause after sending
        
        # Determine if typing indicator should show
        show_typing = random.random() < self.message_behaviors["typing_indicators"]["start_typing"]
        
        return MessageTiming(
            typing_duration=max(typing_time, 0.5),  # Minimum 0.5 seconds
            pause_before=pause_before,
            pause_after=pause_after,
            should_show_typing=show_typing
        )
    
    def _determine_typing_pattern(self, context: Dict) -> str:
        """Determine which typing pattern to use"""
        
        user_emotion = context.get("user_emotion", "neutral")
        aria_emotion = context.get("aria_emotion", "neutral")
        conversation_tone = context.get("conversation_tone", "casual")
        
        # Emotional states override others
        if aria_emotion == "excited" or user_emotion == "excited":
            return "excited"
        elif aria_emotion in ["sad", "anxious"] or user_emotion in ["sad", "anxious"]:
            return "emotional"
        elif conversation_tone == "playful":
            return "playful"
        elif context.get("complex_topic", False):
            return "thoughtful"
        else:
            return "casual"
    
    def _calculate_pause_before(self, context: Dict, pattern_type: str) -> float:
        """Calculate pause before starting to type"""
        
        # Base pause based on message complexity
        message_complexity = context.get("response_complexity", "normal")
        
        if message_complexity == "simple":
            base_pause = random.uniform(0.5, 2.0)
        elif message_complexity == "complex":
            base_pause = random.uniform(2.0, 6.0)
        else:
            base_pause = random.uniform(1.0, 3.0)
        
        # Adjust based on pattern
        if pattern_type == "excited":
            base_pause *= 0.6  # Quicker responses when excited
        elif pattern_type == "thoughtful":
            base_pause *= 1.8  # Longer pauses when thinking
        elif pattern_type == "emotional":
            base_pause *= 1.3  # Slight delay when emotional
        
        # Consider time since last message
        if self.last_message_time:
            time_since_last = datetime.now() - self.last_message_time
            if time_since_last < timedelta(seconds=30):
                base_pause *= 0.7  # Quicker in active conversation
        
        return base_pause
    
    def split_message_naturally(self, message: str, context: Dict) -> List[Tuple[str, float]]:
        """Split a message into natural chunks with timing"""
        
        pattern_type = self._determine_typing_pattern(context)
        pattern = self.typing_patterns[pattern_type]
        
        # Check if message should be split
        if random.random() > pattern["multi_message_chance"]:
            return [(message, 0)]  # Don't split
        
        # Find natural split points
        split_points = self._find_split_points(message)
        
        if not split_points:
            return [(message, 0)]
        
        # Split the message
        parts = []
        last_split = 0
        
        for split_point in split_points:
            if split_point > last_split:
                part = message[last_split:split_point].strip()
                if part:
                    delay = random.uniform(0.8, 2.5)  # Delay between parts
                    parts.append((part, delay))
                last_split = split_point
        
        # Add remaining text
        remaining = message[last_split:].strip()
        if remaining:
            parts.append((remaining, 0))
        
        return parts if len(parts) > 1 else [(message, 0)]
    
    def _find_split_points(self, message: str) -> List[int]:
        """Find natural points to split a message"""
        
        split_points = []
        
        # Split on sentence boundaries
        sentences = message.split('. ')
        if len(sentences) > 1:
            pos = 0
            for i, sentence in enumerate(sentences[:-1]):
                pos += len(sentence) + 2  # +2 for '. '
                split_points.append(pos)
        
        # Split on discourse markers
        discourse_markers = ['but ', 'also ', 'and ', 'so ', 'oh ', 'wait ']
        for marker in discourse_markers:
            marker_pos = message.lower().find(marker)
            if marker_pos > 20:  # Don't split too early
                split_points.append(marker_pos)
        
        # Split on exclamations
        exclamation_pos = message.find('!')
        if exclamation_pos > 0 and exclamation_pos < len(message) - 10:
            split_points.append(exclamation_pos + 1)
        
        # Remove duplicates and sort
        split_points = sorted(list(set(split_points)))
        
        # Filter out splits that are too close
        filtered_points = []
        for point in split_points:
            if not filtered_points or point - filtered_points[-1] > 15:
                filtered_points.append(point)
        
        return filtered_points
    
    def simulate_typing_behavior(self, message: str, context: Dict) -> Dict:
        """Simulate complete typing behavior"""
        
        timing = self.calculate_typing_time(message, context)
        parts = self.split_message_naturally(message, context)
        
        behavior = {
            "total_parts": len(parts),
            "parts": [],
            "total_time": timing.pause_before
        }
        
        for i, (part, delay_after) in enumerate(parts):
            part_timing = self.calculate_typing_time(part, context)
            
            part_behavior = {
                "text": part,
                "pause_before": timing.pause_before if i == 0 else delay_after,
                "typing_duration": part_timing.typing_duration,
                "show_typing": part_timing.should_show_typing,
                "pause_after": part_timing.pause_after
            }
            
            behavior["parts"].append(part_behavior)
            behavior["total_time"] += part_behavior["pause_before"] + part_behavior["typing_duration"]
        
        return behavior
    
    def handle_user_interruption(self, current_typing: bool = False) -> Optional[str]:
        """Handle when user interrupts Aria's typing"""
        
        if not current_typing:
            return None
        
        # Random chance to acknowledge interruption
        if random.random() < 0.3:
            acknowledgments = self.interruption_patterns["user_interrupts"]["acknowledge"]
            return random.choice(acknowledgments)
        
        return None
    
    def generate_false_start(self, context: Dict) -> Optional[Dict]:
        """Generate a false start (start typing then stop)"""
        
        # Only occasionally
        if random.random() > 0.1:
            return None
        
        return {
            "action": "false_start",
            "show_typing_duration": random.uniform(1.0, 3.0),
            "reason": "changed_mind"
        }
    
    def adapt_to_user_speed(self, user_message_time: float, user_message_length: int):
        """Adapt typing speed based on user's typing patterns"""
        
        if user_message_length > 0:
            user_wpm = (user_message_length / 5) / (user_message_time / 60)  # Rough WPM calculation
            
            # Gradually adjust to match user's speed (but not exactly)
            target_speed = user_wpm * random.uniform(0.8, 1.2)
            self.base_typing_speed = (self.base_typing_speed * 0.8) + (target_speed * 0.2)
            
            # Keep within reasonable bounds
            self.base_typing_speed = max(30, min(self.base_typing_speed, 120))
    
    def get_conversation_rhythm(self, recent_messages: List[Dict]) -> Dict:
        """Analyze conversation rhythm for timing adjustments"""
        
        if len(recent_messages) < 3:
            return {"rhythm": "establishing", "energy": "medium"}
        
        # Analyze message timing
        intervals = []
        for i in range(1, len(recent_messages)):
            time_diff = recent_messages[i]["timestamp"] - recent_messages[i-1]["timestamp"]
            intervals.append(time_diff.total_seconds())
        
        avg_interval = sum(intervals) / len(intervals)
        
        # Determine conversation energy
        if avg_interval < 10:
            energy = "high"
        elif avg_interval < 30:
            energy = "medium"
        else:
            energy = "low"
        
        # Analyze message lengths
        lengths = [len(msg["text"]) for msg in recent_messages]
        avg_length = sum(lengths) / len(lengths)
        
        return {
            "rhythm": "fast" if avg_interval < 15 else "moderate" if avg_interval < 45 else "slow",
            "energy": energy,
            "avg_interval": avg_interval,
            "avg_length": avg_length,
            "engagement": "high" if avg_length > 50 and avg_interval < 20 else "medium"
        }
    
    def should_pause_typing(self, context: Dict) -> bool:
        """Determine if typing should pause mid-message"""
        
        pause_chance = self.message_behaviors["typing_indicators"]["pause_and_resume"]
        
        # Higher chance for complex topics
        if context.get("response_complexity") == "complex":
            pause_chance *= 2
        
        # Higher chance for emotional topics
        if context.get("emotional_content", False):
            pause_chance *= 1.5
        
        return random.random() < pause_chance
    
    def update_conversation_state(self, context: Dict):
        """Update internal conversation state"""
        
        self.conversation_energy = context.get("energy_level", "medium")
        self.last_message_time = datetime.now()
        
        # Adjust base typing speed based on energy
        if self.conversation_energy == "high":
            self.base_typing_speed *= 1.1
        elif self.conversation_energy == "low":
            self.base_typing_speed *= 0.9
        
        # Keep within bounds
        self.base_typing_speed = max(30, min(self.base_typing_speed, 120))