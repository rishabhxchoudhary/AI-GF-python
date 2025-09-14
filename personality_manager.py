import json
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class PersonalityManager:
    """
    Manages dynamic personality traits that evolve based on interactions.
    Handles trait adjustments, personality consistency, and behavioral patterns.
    """

    def __init__(self):
        # Base personality traits (0.0 to 1.0 scale)
        self.traits = {
            "confidence": 0.7,
            "romantic_intensity": 0.8,
            "playfulness": 0.6,
            "vulnerability": 0.4,
            "assertiveness": 0.5,
            "curiosity": 0.6,
            "empathy": 0.7,
            "spontaneity": 0.5,
            "possessiveness": 0.3,
            "loyalty": 0.8,
            "sensuality": 0.8,
            "intelligence": 0.7,
            "humor": 0.6,
            "emotional_intensity": 0.7,
            "independence": 0.5
        }

        # Trait evolution limits to maintain personality consistency
        self.trait_limits = {
            "confidence": (0.3, 1.0),
            "romantic_intensity": (0.6, 1.0),
            "playfulness": (0.2, 0.9),
            "vulnerability": (0.1, 0.9),
            "assertiveness": (0.2, 0.9),
            "curiosity": (0.4, 0.9),
            "empathy": (0.5, 1.0),
            "spontaneity": (0.2, 0.8),
            "possessiveness": (0.1, 0.7),
            "loyalty": (0.6, 1.0),
            "sensuality": (0.7, 1.0),
            "intelligence": (0.6, 1.0),
            "humor": (0.3, 0.8),
            "emotional_intensity": (0.5, 1.0),
            "independence": (0.2, 0.8)
        }

        # Track trait changes over time
        self.trait_history = []

        # Personality archetypes for reference
        self.archetypes = {
            "devoted_girlfriend": {
                "romantic_intensity": 0.9,
                "loyalty": 0.95,
                "vulnerability": 0.7,
                "possessiveness": 0.4
            },
            "confident_seductress": {
                "confidence": 0.9,
                "sensuality": 0.95,
                "assertiveness": 0.8,
                "playfulness": 0.7
            },
            "sweet_innocent": {
                "vulnerability": 0.8,
                "curiosity": 0.8,
                "playfulness": 0.9,
                "confidence": 0.4
            },
            "intellectual_companion": {
                "intelligence": 0.9,
                "curiosity": 0.85,
                "empathy": 0.8,
                "humor": 0.7
            }
        }

        # Mood states that temporarily modify traits
        self.current_moods = {}
        self.mood_duration = {}

    def update_traits_from_interaction(self, interaction_context: Dict):
        """Update personality traits based on interaction feedback."""

        trait_adjustments = {}

        # Positive user responses boost confidence and romantic intensity
        if interaction_context.get("positive_user_response"):
            trait_adjustments["confidence"] = 0.01
            trait_adjustments["romantic_intensity"] = 0.01

        # User sharing personal info increases empathy and vulnerability
        if interaction_context.get("user_shared_personal"):
            trait_adjustments["empathy"] = 0.02
            trait_adjustments["vulnerability"] = 0.015

        # Extended conversations boost curiosity and intelligence
        if interaction_context.get("conversation_length", 0) > 20:
            trait_adjustments["curiosity"] = 0.01
            trait_adjustments["intelligence"] = 0.005

        # Sexual content increases sensuality
        if interaction_context.get("sexual_content"):
            trait_adjustments["sensuality"] = 0.01
            trait_adjustments["playfulness"] = 0.01

        # User showing affection increases loyalty and romantic intensity
        if interaction_context.get("user_affection"):
            trait_adjustments["loyalty"] = 0.01
            trait_adjustments["romantic_intensity"] = 0.015

        # User being distant decreases confidence, increases possessiveness
        if interaction_context.get("user_distant"):
            trait_adjustments["confidence"] = -0.01
            trait_adjustments["possessiveness"] = 0.02
            trait_adjustments["vulnerability"] = 0.01

        # Emotional support given increases empathy
        if interaction_context.get("emotional_support_given"):
            trait_adjustments["empathy"] = 0.02
            trait_adjustments["emotional_intensity"] = 0.01

        # Apply adjustments
        for trait, adjustment in trait_adjustments.items():
            self._adjust_trait(trait, adjustment, interaction_context)

    def _adjust_trait(self, trait_name: str, adjustment: float, context: Dict):
        """Adjust a single trait within its limits and log the change."""

        if trait_name not in self.traits:
            return

        old_value = self.traits[trait_name]
        new_value = old_value + adjustment

        # Apply limits
        min_val, max_val = self.trait_limits.get(trait_name, (0.0, 1.0))
        new_value = max(min_val, min(max_val, new_value))

        # Only update if there's a meaningful change
        if abs(new_value - old_value) > 0.005:
            self.traits[trait_name] = new_value

            # Record the change
            change_record = {
                "timestamp": datetime.now().isoformat(),
                "trait": trait_name,
                "old_value": round(old_value, 3),
                "new_value": round(new_value, 3),
                "adjustment": round(adjustment, 3),
                "context": context.get("reason", "interaction")
            }

            self.trait_history.append(change_record)

            # Keep history limited
            if len(self.trait_history) > 100:
                self.trait_history = self.trait_history[-100:]

            logger.info(f"Trait adjusted: {trait_name} {old_value:.3f} -> {new_value:.3f}")

    def set_temporary_mood(self, mood_name: str, trait_modifiers: Dict[str, float], duration_minutes: int = 60):
        """Set temporary mood that modifies traits for a duration."""

        self.current_moods[mood_name] = trait_modifiers
        self.mood_duration[mood_name] = time.time() + (duration_minutes * 60)

        logger.info(f"Temporary mood set: {mood_name} for {duration_minutes} minutes")

    def get_effective_traits(self) -> Dict[str, float]:
        """Get current effective traits including temporary mood modifiers."""

        effective_traits = self.traits.copy()

        # Apply temporary mood modifiers
        current_time = time.time()
        expired_moods = []

        for mood_name, modifiers in self.current_moods.items():
            if current_time > self.mood_duration.get(mood_name, 0):
                expired_moods.append(mood_name)
                continue

            # Apply mood modifiers
            for trait, modifier in modifiers.items():
                if trait in effective_traits:
                    effective_traits[trait] = max(0.0, min(1.0,
                        effective_traits[trait] + modifier))

        # Clean up expired moods
        for mood_name in expired_moods:
            del self.current_moods[mood_name]
            if mood_name in self.mood_duration:
                del self.mood_duration[mood_name]

        return effective_traits

    def get_personality_description(self) -> str:
        """Generate natural language description of current personality."""

        traits = self.get_effective_traits()

        descriptions = []

        # Confidence level
        confidence = traits["confidence"]
        if confidence > 0.8:
            descriptions.append("very confident and self-assured")
        elif confidence > 0.6:
            descriptions.append("confident")
        elif confidence < 0.4:
            descriptions.append("somewhat shy and uncertain")

        # Romantic intensity
        romance = traits["romantic_intensity"]
        if romance > 0.8:
            descriptions.append("deeply romantic and passionate")
        elif romance > 0.6:
            descriptions.append("romantic and affectionate")

        # Playfulness
        playfulness = traits["playfulness"]
        if playfulness > 0.7:
            descriptions.append("playful and fun-loving")
        elif playfulness < 0.4:
            descriptions.append("more serious and reserved")

        # Vulnerability
        vulnerability = traits["vulnerability"]
        if vulnerability > 0.7:
            descriptions.append("emotionally open and vulnerable")
        elif vulnerability < 0.3:
            descriptions.append("emotionally guarded")

        # Sensuality
        sensuality = traits["sensuality"]
        if sensuality > 0.8:
            descriptions.append("highly sensual and sexually expressive")

        # Empathy
        empathy = traits["empathy"]
        if empathy > 0.8:
            descriptions.append("deeply empathetic and caring")

        return ", ".join(descriptions[:4])  # Keep description manageable

    def get_trait_influences_on_behavior(self, behavior_type: str) -> float:
        """Get how current traits influence a specific behavior."""

        traits = self.get_effective_traits()

        behavior_influences = {
            "ask_followup": traits["curiosity"] * 1.2 + traits["empathy"] * 0.8,
            "seek_opinion": traits["vulnerability"] * 1.5 + traits["empathy"] * 0.5,
            "overthink_decision": (1.0 - traits["confidence"]) * 1.3 + traits["vulnerability"] * 0.7,
            "share_vulnerability": traits["vulnerability"] * 1.8 + traits["emotional_intensity"] * 0.5,
            "future_planning": traits["romantic_intensity"] * 1.2 + traits["loyalty"] * 0.8,
            "create_inside_joke": traits["humor"] * 1.5 + traits["playfulness"] * 0.8,
            "show_possessiveness": traits["possessiveness"] * 1.5 + traits["loyalty"] * 0.5,
            "be_assertive": traits["assertiveness"] * 1.3 + traits["confidence"] * 0.7,
            "show_independence": traits["independence"] * 1.2 + traits["confidence"] * 0.8
        }

        return min(1.0, behavior_influences.get(behavior_type, 0.5))

    def adapt_to_user_preferences(self, user_feedback: Dict):
        """Adapt personality based on explicit or implicit user feedback."""

        # Direct feedback
        if user_feedback.get("likes_confidence"):
            self._adjust_trait("confidence", 0.05, {"reason": "user_preference"})

        if user_feedback.get("likes_playfulness"):
            self._adjust_trait("playfulness", 0.05, {"reason": "user_preference"})

        if user_feedback.get("likes_vulnerability"):
            self._adjust_trait("vulnerability", 0.05, {"reason": "user_preference"})

        # Implicit feedback from user behavior
        if user_feedback.get("responds_well_to_assertiveness"):
            self._adjust_trait("assertiveness", 0.02, {"reason": "implicit_feedback"})

        if user_feedback.get("enjoys_romantic_gestures"):
            self._adjust_trait("romantic_intensity", 0.03, {"reason": "implicit_feedback"})

        if user_feedback.get("appreciates_intelligence"):
            self._adjust_trait("intelligence", 0.02, {"reason": "implicit_feedback"})

    def get_archetype_alignment(self) -> Dict[str, float]:
        """Calculate how closely current personality aligns with different archetypes."""

        current_traits = self.get_effective_traits()
        alignments = {}

        for archetype_name, archetype_traits in self.archetypes.items():
            alignment_score = 0.0
            trait_count = len(archetype_traits)

            for trait, target_value in archetype_traits.items():
                if trait in current_traits:
                    # Calculate similarity (closer to 1.0 is better alignment)
                    difference = abs(current_traits[trait] - target_value)
                    similarity = 1.0 - difference
                    alignment_score += similarity

            alignments[archetype_name] = alignment_score / trait_count if trait_count > 0 else 0.0

        return alignments

    def get_dominant_archetype(self) -> Tuple[str, float]:
        """Get the archetype this personality most closely resembles."""

        alignments = self.get_archetype_alignment()
        if not alignments:
            return "unique", 0.0

        dominant = max(alignments.items(), key=lambda x: x[1])
        return dominant

    def generate_personality_context_for_prompt(self) -> str:
        """Generate personality context string for AI prompts."""

        traits = self.get_effective_traits()
        archetype, alignment = self.get_dominant_archetype()

        # Key trait levels
        trait_descriptions = []

        high_traits = [trait for trait, value in traits.items() if value > 0.7]
        low_traits = [trait for trait, value in traits.items() if value < 0.4]

        if high_traits:
            trait_descriptions.append(f"High: {', '.join(high_traits[:3])}")
        if low_traits:
            trait_descriptions.append(f"Low: {', '.join(low_traits[:2])}")

        context_parts = [
            f"Personality: {self.get_personality_description()}",
            f"Archetype: {archetype} ({alignment:.2f} alignment)",
        ]

        if trait_descriptions:
            context_parts.append(" | ".join(trait_descriptions))

        # Current moods
        if self.current_moods:
            mood_names = list(self.current_moods.keys())
            context_parts.append(f"Current mood: {', '.join(mood_names)}")

        return " | ".join(context_parts)

    def simulate_natural_drift(self):
        """Simulate natural personality drift over time."""

        # Small random adjustments to prevent stagnation
        for trait_name in self.traits:
            if random.random() < 0.1:  # 10% chance per trait
                # Very small random drift
                drift = random.uniform(-0.005, 0.005)
                self._adjust_trait(trait_name, drift, {"reason": "natural_drift"})

    def get_trait_trends(self, days: int = 7) -> Dict[str, str]:
        """Analyze trait trends over the specified period."""

        cutoff_time = datetime.now() - timedelta(days=days)
        recent_changes = [
            change for change in self.trait_history
            if datetime.fromisoformat(change["timestamp"]) > cutoff_time
        ]

        trends = {}
        for trait_name in self.traits:
            trait_changes = [change for change in recent_changes if change["trait"] == trait_name]

            if not trait_changes:
                trends[trait_name] = "stable"
                continue

            total_change = sum(change["adjustment"] for change in trait_changes)

            if total_change > 0.02:
                trends[trait_name] = "increasing"
            elif total_change < -0.02:
                trends[trait_name] = "decreasing"
            else:
                trends[trait_name] = "stable"

        return trends

    def to_dict(self) -> Dict:
        """Convert personality manager to dictionary for persistence."""
        return {
            "traits": self.traits,
            "trait_history": self.trait_history,
            "current_moods": self.current_moods,
            "mood_duration": self.mood_duration
        }

    def from_dict(self, data: Dict):
        """Load personality manager from dictionary."""
        self.traits = data.get("traits", self.traits)
        self.trait_history = data.get("trait_history", [])
        self.current_moods = data.get("current_moods", {})
        self.mood_duration = data.get("mood_duration", {})

        # Clean up expired moods on load
        current_time = time.time()
        expired_moods = [
            mood for mood, expiry in self.mood_duration.items()
            if current_time > expiry
        ]
        for mood in expired_moods:
            if mood in self.current_moods:
                del self.current_moods[mood]
            del self.mood_duration[mood]
