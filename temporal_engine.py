import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class TemporalEngine:
    """
    Manages time-aware personality shifts, mood adjustments, and contextual timing.
    Handles different behaviors for morning, evening, late night, etc.
    """

    def __init__(self):
        # Base personality adjustments by time of day
        self.time_based_moods = {
            "early_morning": {  # 4-7 AM
                "energy": 0.2,
                "romantic_intensity": 0.3,
                "playfulness": 0.2,
                "vulnerability": 0.4,
                "sleepiness": 0.9
            },
            "morning": {  # 7-12 PM
                "energy": 0.6,
                "romantic_intensity": 0.5,
                "playfulness": 0.7,
                "vulnerability": 0.3,
                "sleepiness": 0.3
            },
            "afternoon": {  # 12-17 PM
                "energy": 0.8,
                "romantic_intensity": 0.6,
                "playfulness": 0.9,
                "vulnerability": 0.4,
                "sleepiness": 0.1
            },
            "evening": {  # 17-22 PM
                "energy": 0.7,
                "romantic_intensity": 0.9,
                "playfulness": 0.8,
                "vulnerability": 0.5,
                "sleepiness": 0.2
            },
            "late_night": {  # 22-4 AM
                "energy": 0.4,
                "romantic_intensity": 0.8,
                "playfulness": 0.5,
                "vulnerability": 0.9,
                "sleepiness": 0.6
            }
        }

        # Greeting styles by time
        self.time_greetings = {
            "early_morning": [
                "mmm morning babe... still sleepy but thinking of you 😴",
                "you're up early... come back to bed with me 💤",
                "sleepy kisses... need your warmth right now 🥱"
            ],
            "morning": [
                "good morning gorgeous! ready to make today amazing? ☀️",
                "morning babe! woke up so wet dreaming about you 🌅",
                "hey beautiful, coffee and you sound perfect right now ☕"
            ],
            "afternoon": [
                "hey there! perfect timing, I was getting bored 😘",
                "afternoon fun time! what trouble should we get into? 😈",
                "hi babe! been thinking naughty thoughts about you all day 🔥"
            ],
            "evening": [
                "mmm perfect timing... I'm feeling so horny tonight 🌙",
                "evening babe! ready for some intimate time together? 💕",
                "hey sexy, been waiting for you all day 🌆"
            ],
            "late_night": [
                "can't sleep... keep thinking about you 🌃",
                "late night confessions: I need you so badly right now 💫",
                "everyone's asleep but us... let's be naughty 🌙"
            ]
        }

        # Energy-appropriate language patterns
        self.energy_language = {
            "high": {
                "enthusiasm": ["so excited!", "can't wait!", "yes yes yes!", "absolutely!"],
                "pace": "fast",
                "emoji_frequency": 0.8
            },
            "medium": {
                "enthusiasm": ["sounds good", "I like that", "mmm yeah", "definitely"],
                "pace": "normal",
                "emoji_frequency": 0.5
            },
            "low": {
                "enthusiasm": ["mhm", "yeah...", "sounds nice", "okay babe"],
                "pace": "slow",
                "emoji_frequency": 0.3
            }
        }

        # Track user's activity patterns
        self.user_activity_patterns = {}
        self.interaction_history = []

    def get_current_time_period(self) -> str:
        """Get the current time period category."""
        hour = datetime.now().hour

        if 4 <= hour < 7:
            return "early_morning"
        elif 7 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:  # 22-4
            return "late_night"

    def get_mood_modifiers(self, time_period: Optional[str] = None) -> Dict[str, float]:
        """Get personality mood modifiers for current or specified time."""
        if not time_period:
            time_period = self.get_current_time_period()

        return self.time_based_moods.get(time_period, self.time_based_moods["evening"])

    def get_appropriate_greeting(self, user_name: str = "babe", time_period: Optional[str] = None) -> str:
        """Generate time-appropriate greeting."""
        if not time_period:
            time_period = self.get_current_time_period()

        greetings = self.time_greetings.get(time_period, self.time_greetings["evening"])
        base_greeting = random.choice(greetings)

        # Personalize with name if available
        if user_name and user_name != "babe":
            base_greeting = base_greeting.replace("babe", user_name)

        return base_greeting

    def get_energy_level(self, time_period: Optional[str] = None) -> str:
        """Get current energy level category."""
        if not time_period:
            time_period = self.get_current_time_period()

        energy_value = self.time_based_moods[time_period]["energy"]

        if energy_value >= 0.7:
            return "high"
        elif energy_value >= 0.4:
            return "medium"
        else:
            return "low"

    def adjust_response_for_time(self, response: str, time_period: Optional[str] = None) -> str:
        """Adjust response style based on current time."""
        if not time_period:
            time_period = self.get_current_time_period()

        mood_modifiers = self.get_mood_modifiers(time_period)
        energy_level = self.get_energy_level(time_period)

        # Adjust based on sleepiness
        sleepiness = mood_modifiers.get("sleepiness", 0.0)
        if sleepiness > 0.7:
            # Add sleepy indicators
            sleepy_additions = ["*yawn*", "mmm...", "*stretches*", "*cuddles closer*"]
            if random.random() < 0.3:
                response = f"{random.choice(sleepy_additions)} {response}"

        # Adjust emoji frequency based on energy
        energy_settings = self.energy_language[energy_level]
        current_emoji_count = len([c for c in response if ord(c) > 127])  # Rough emoji count
        target_frequency = energy_settings["emoji_frequency"]

        # Add more emojis for high energy, remove some for low energy
        if energy_level == "high" and current_emoji_count == 0 and random.random() < 0.5:
            energy_emojis = ["🔥", "💕", "😈", "🌟", "✨"]
            response += f" {random.choice(energy_emojis)}"

        return response

    def calculate_time_since_last_interaction(self, last_interaction_time: Optional[str] = None) -> Dict[str, any]:
        """Calculate time context since last interaction."""
        if not last_interaction_time:
            return {"time_gap": "unknown", "appropriate_greeting": "casual"}

        try:
            last_time = datetime.fromisoformat(last_interaction_time)
            current_time = datetime.now()
            time_diff = current_time - last_time

            if time_diff < timedelta(hours=1):
                return {
                    "time_gap": "recent",
                    "gap_description": "just a bit ago",
                    "appropriate_greeting": "casual",
                    "reference_style": "continue_conversation"
                }
            elif time_diff < timedelta(hours=6):
                return {
                    "time_gap": "short",
                    "gap_description": "a few hours",
                    "appropriate_greeting": "warm_return",
                    "reference_style": "reference_previous"
                }
            elif time_diff < timedelta(days=1):
                return {
                    "time_gap": "medium",
                    "gap_description": "earlier today",
                    "appropriate_greeting": "excited_return",
                    "reference_style": "miss_you"
                }
            elif time_diff < timedelta(days=7):
                return {
                    "time_gap": "long",
                    "gap_description": f"{time_diff.days} days",
                    "appropriate_greeting": "enthusiastic_return",
                    "reference_style": "catch_up"
                }
            else:
                return {
                    "time_gap": "very_long",
                    "gap_description": f"{time_diff.days} days",
                    "appropriate_greeting": "passionate_reunion",
                    "reference_style": "missed_so_much"
                }

        except Exception as e:
            logger.warning(f"Error parsing last interaction time: {e}")
            return {"time_gap": "unknown", "appropriate_greeting": "casual"}

    def get_contextual_greeting(self, user_name: str, last_interaction: Optional[str] = None) -> str:
        """Generate contextually appropriate greeting based on time and gap since last interaction."""
        time_context = self.calculate_time_since_last_interaction(last_interaction)
        time_period = self.get_current_time_period()

        greeting_type = time_context["appropriate_greeting"]
        gap_description = time_context.get("gap_description", "")

        # Base greeting by time
        base_greeting = self.get_appropriate_greeting(user_name, time_period)

        # Modify based on time gap
        if greeting_type == "casual":
            return base_greeting
        elif greeting_type == "warm_return":
            return f"hey {user_name}! {base_greeting}"
        elif greeting_type == "excited_return":
            return f"babe! missed you since {gap_description} 💕 {base_greeting}"
        elif greeting_type == "enthusiastic_return":
            return f"{user_name}! it's been {gap_description} - I've been so horny thinking about you 😈"
        elif greeting_type == "passionate_reunion":
            return f"oh my god {user_name}! {gap_description} without you... I need you so badly right now 💦"

        return base_greeting

    def track_user_activity(self, user_activity_time: str):
        """Track when user is most active to learn their patterns."""
        try:
            activity_time = datetime.fromisoformat(user_activity_time)
            hour = activity_time.hour
            day_of_week = activity_time.strftime("%A")

            # Track hourly activity
            if "hourly" not in self.user_activity_patterns:
                self.user_activity_patterns["hourly"] = {}

            self.user_activity_patterns["hourly"][hour] = self.user_activity_patterns["hourly"].get(hour, 0) + 1

            # Track daily patterns
            if "daily" not in self.user_activity_patterns:
                self.user_activity_patterns["daily"] = {}

            self.user_activity_patterns["daily"][day_of_week] = self.user_activity_patterns["daily"].get(day_of_week, 0) + 1

            # Keep interaction history limited
            self.interaction_history.append({
                "time": user_activity_time,
                "hour": hour,
                "day": day_of_week
            })

            # Keep only last 100 interactions
            if len(self.interaction_history) > 100:
                self.interaction_history = self.interaction_history[-100:]

        except Exception as e:
            logger.warning(f"Error tracking user activity: {e}")

    def get_user_peak_hours(self) -> List[int]:
        """Get the hours when user is most active."""
        if "hourly" not in self.user_activity_patterns:
            return []

        hourly_activity = self.user_activity_patterns["hourly"]
        if not hourly_activity:
            return []

        # Find hours with activity above average
        avg_activity = sum(hourly_activity.values()) / len(hourly_activity)
        peak_hours = [hour for hour, count in hourly_activity.items() if count > avg_activity]

        return sorted(peak_hours)

    def is_unusual_time_for_user(self) -> bool:
        """Check if current time is unusual for this user's patterns."""
        peak_hours = self.get_user_peak_hours()
        if not peak_hours:
            return False  # No data, assume normal

        current_hour = datetime.now().hour

        # Check if current hour is significantly outside peak hours
        if not any(abs(current_hour - peak_hour) <= 2 for peak_hour in peak_hours):
            return True

        return False

    def get_temporal_context_summary(self) -> Dict[str, any]:
        """Get complete temporal context for current moment."""
        time_period = self.get_current_time_period()
        mood_modifiers = self.get_mood_modifiers(time_period)
        energy_level = self.get_energy_level(time_period)

        return {
            "time_period": time_period,
            "current_hour": datetime.now().hour,
            "mood_modifiers": mood_modifiers,
            "energy_level": energy_level,
            "unusual_time": self.is_unusual_time_for_user(),
            "user_peak_hours": self.get_user_peak_hours(),
            "current_timestamp": datetime.now().isoformat()
        }

    def get_time_appropriate_language_style(self) -> Dict[str, any]:
        """Get language style adjustments for current time."""
        time_period = self.get_current_time_period()
        energy_level = self.get_energy_level(time_period)
        mood_modifiers = self.get_mood_modifiers(time_period)

        # Adjust response characteristics
        response_style = {
            "pace": self.energy_language[energy_level]["pace"],
            "enthusiasm_level": energy_level,
            "emoji_frequency": self.energy_language[energy_level]["emoji_frequency"],
            "vulnerability_allowance": mood_modifiers.get("vulnerability", 0.5),
            "romantic_intensity": mood_modifiers.get("romantic_intensity", 0.7),
            "playfulness": mood_modifiers.get("playfulness", 0.6)
        }

        # Add specific time-based characteristics
        if time_period == "late_night":
            response_style.update({
                "intimate_language": True,
                "whisper_mode": True,
                "vulnerability_boost": 0.3
            })
        elif time_period == "early_morning":
            response_style.update({
                "sleepy_language": True,
                "gentle_tone": True,
                "low_energy_responses": True
            })
        elif time_period == "evening":
            response_style.update({
                "seductive_language": True,
                "high_romantic_intent": True,
                "passionate_responses": True
            })

        return response_style

import random  # Need this import for the random choices
