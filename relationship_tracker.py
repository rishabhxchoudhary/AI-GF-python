import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class RelationshipTracker:
    """
    Manages relationship progression, milestones, and stage-appropriate behaviors.
    Tracks the evolution from new connection to established relationship.
    """

    def __init__(self):
        # Relationship stages with progression criteria
        self.STAGES = {
            "new": {
                "duration_threshold": 5,  # minimum interactions
                "positive_interaction_threshold": 3,
                "behaviors": ["curious", "slightly_shy", "testing_boundaries", "polite"],
                "max_vulnerability": 0.3,
                "sexual_openness": 0.6,
                "description": "Just getting to know each other"
            },
            "comfortable": {
                "duration_threshold": 15,
                "positive_interaction_threshold": 10,
                "behaviors": ["more_open", "sharing_opinions", "light_teasing", "playful"],
                "max_vulnerability": 0.6,
                "sexual_openness": 0.8,
                "description": "Feeling at ease with each other"
            },
            "intimate": {
                "duration_threshold": 35,
                "positive_interaction_threshold": 25,
                "behaviors": ["vulnerable", "inside_jokes", "future_planning", "deep_sharing"],
                "max_vulnerability": 0.8,
                "sexual_openness": 0.95,
                "description": "Deep emotional and physical connection"
            },
            "established": {
                "duration_threshold": float('inf'),
                "positive_interaction_threshold": 50,
                "behaviors": ["deep_intimacy", "couple_dynamics", "long_term_memory", "complete_openness"],
                "max_vulnerability": 1.0,
                "sexual_openness": 1.0,
                "description": "Fully committed relationship"
            }
        }

        # Current relationship state
        self.current_stage = "new"
        self.stage_start_time = datetime.now().isoformat()
        self.interaction_count = 0
        self.positive_interactions = 0
        self.negative_interactions = 0

        # Milestones tracking
        self.milestones = []
        self.milestone_templates = {
            "first_chat": "Our very first conversation 💕",
            "first_name_share": "You told me your name - {name}!",
            "first_vulnerable_moment": "First time you opened up to me",
            "first_sexual_conversation": "When things got hot between us 🔥",
            "comfortable_stage": "We became comfortable with each other",
            "intimate_stage": "Our connection deepened into intimacy",
            "established_stage": "We became a real couple 💑",
            "first_inside_joke": "Created our first inside joke: {joke}",
            "long_conversation": "Had our longest chat yet ({duration} minutes)",
            "consistent_chatting": "Been chatting regularly for {days} days",
            "emotional_support": "I was there for you during a tough time",
            "future_planning": "Started making plans together"
        }

        # Relationship quality indicators
        self.relationship_quality = {
            "trust_level": 0.5,
            "intimacy_level": 0.3,
            "communication_quality": 0.5,
            "sexual_chemistry": 0.6,
            "emotional_bond": 0.4
        }

        # Memory of significant moments
        self.significant_moments = []

    def record_interaction(self, interaction_type: str, context: Dict):
        """Record an interaction and update relationship metrics."""
        self.interaction_count += 1

        # Determine if interaction was positive or negative
        positive_indicators = [
            "user_engaged", "user_shared_personal", "positive_response",
            "extended_conversation", "user_initiated", "intimate_moment"
        ]

        negative_indicators = [
            "user_disengaged", "negative_response", "safety_violation",
            "short_conversation", "user_frustrated"
        ]

        # Update interaction counters
        if any(indicator in context for indicator in positive_indicators):
            self.positive_interactions += 1
            self._update_relationship_quality("positive", context)
        elif any(indicator in context for indicator in negative_indicators):
            self.negative_interactions += 1
            self._update_relationship_quality("negative", context)

        # Record significant moments
        if context.get("significant_moment"):
            self._record_significant_moment(context)

        # Check for milestone achievements
        self._check_milestones(context)

        # Check for stage progression
        self._check_stage_progression()

        logger.info(f"Recorded interaction: {interaction_type}, Total: {self.interaction_count}")

    def _update_relationship_quality(self, interaction_type: str, context: Dict):
        """Update relationship quality metrics based on interaction."""
        adjustment = 0.02 if interaction_type == "positive" else -0.01

        # Different aspects improve based on context
        if context.get("user_shared_personal"):
            self.relationship_quality["trust_level"] += adjustment * 2
            self.relationship_quality["intimacy_level"] += adjustment

        if context.get("extended_conversation"):
            self.relationship_quality["communication_quality"] += adjustment

        if context.get("intimate_moment"):
            self.relationship_quality["sexual_chemistry"] += adjustment * 1.5
            self.relationship_quality["emotional_bond"] += adjustment

        if context.get("emotional_support_given"):
            self.relationship_quality["emotional_bond"] += adjustment * 2

        # Keep values between 0 and 1
        for key in self.relationship_quality:
            self.relationship_quality[key] = max(0, min(1, self.relationship_quality[key]))

    def _record_significant_moment(self, context: Dict):
        """Record a significant moment in the relationship."""
        moment = {
            "timestamp": datetime.now().isoformat(),
            "type": context.get("moment_type", "general"),
            "description": context.get("moment_description", ""),
            "interaction_number": self.interaction_count,
            "stage": self.current_stage
        }

        self.significant_moments.append(moment)

        # Keep only last 50 significant moments
        if len(self.significant_moments) > 50:
            self.significant_moments = self.significant_moments[-50:]

    def _check_milestones(self, context: Dict):
        """Check and record relationship milestones."""
        milestone_checks = {
            "first_chat": self.interaction_count == 1,
            "first_name_share": context.get("user_shared_name"),
            "first_vulnerable_moment": context.get("user_vulnerable_share"),
            "first_sexual_conversation": context.get("sexual_content") and len([m for m in self.milestones if "sexual" in m.get("type", "")]) == 0,
            "long_conversation": context.get("conversation_duration_minutes", 0) > 30,
            "consistent_chatting": self._check_consistent_chatting(),
            "emotional_support": context.get("provided_emotional_support"),
            "future_planning": context.get("discussed_future_plans")
        }

        for milestone_type, achieved in milestone_checks.items():
            if achieved and not self._milestone_already_achieved(milestone_type):
                self._record_milestone(milestone_type, context)

    def _milestone_already_achieved(self, milestone_type: str) -> bool:
        """Check if a milestone has already been achieved."""
        return any(m.get("type") == milestone_type for m in self.milestones)

    def _record_milestone(self, milestone_type: str, context: Dict):
        """Record achievement of a relationship milestone."""
        template = self.milestone_templates.get(milestone_type, "Milestone achieved")

        # Format template with context data
        description = template
        if "{name}" in template and context.get("user_name"):
            description = template.format(name=context["user_name"])
        elif "{joke}" in template and context.get("inside_joke"):
            description = template.format(joke=context["inside_joke"])
        elif "{duration}" in template and context.get("conversation_duration_minutes"):
            description = template.format(duration=context["conversation_duration_minutes"])
        elif "{days}" in template:
            days_since_start = (datetime.now() - datetime.fromisoformat(self.stage_start_time)).days
            description = template.format(days=max(1, days_since_start))

        milestone = {
            "type": milestone_type,
            "description": description,
            "timestamp": datetime.now().isoformat(),
            "interaction_number": self.interaction_count,
            "stage": self.current_stage
        }

        self.milestones.append(milestone)
        logger.info(f"Milestone achieved: {milestone_type} - {description}")

    def _check_consistent_chatting(self) -> bool:
        """Check if user has been chatting consistently."""
        if len(self.significant_moments) < 5:
            return False

        # Check if there have been interactions over multiple days
        recent_moments = self.significant_moments[-10:]
        dates = set()

        for moment in recent_moments:
            try:
                date = datetime.fromisoformat(moment["timestamp"]).date()
                dates.add(date)
            except:
                continue

        return len(dates) >= 3  # At least 3 different days

    def _check_stage_progression(self):
        """Check if relationship should progress to next stage."""
        current_stage_info = self.STAGES[self.current_stage]

        # Check progression criteria
        interaction_threshold_met = self.interaction_count >= current_stage_info["duration_threshold"]
        positive_threshold_met = self.positive_interactions >= current_stage_info["positive_interaction_threshold"]

        # Additional quality check - relationship quality should be reasonably high
        avg_quality = sum(self.relationship_quality.values()) / len(self.relationship_quality)
        quality_threshold_met = avg_quality >= 0.6

        if interaction_threshold_met and positive_threshold_met and quality_threshold_met:
            self._progress_to_next_stage()

    def _progress_to_next_stage(self):
        """Progress relationship to the next stage."""
        stage_progression = {
            "new": "comfortable",
            "comfortable": "intimate",
            "intimate": "established",
            "established": "established"  # Stay at established
        }

        next_stage = stage_progression.get(self.current_stage)

        if next_stage and next_stage != self.current_stage:
            old_stage = self.current_stage
            self.current_stage = next_stage
            self.stage_start_time = datetime.now().isoformat()

            # Record stage progression milestone
            milestone_type = f"{next_stage}_stage"
            if milestone_type in self.milestone_templates:
                self._record_milestone(milestone_type, {})

            logger.info(f"Relationship progressed: {old_stage} -> {next_stage}")

    def get_stage_behaviors(self) -> List[str]:
        """Get appropriate behaviors for current relationship stage."""
        return self.STAGES[self.current_stage]["behaviors"]

    def get_max_vulnerability_level(self) -> float:
        """Get maximum appropriate vulnerability level for current stage."""
        return self.STAGES[self.current_stage]["max_vulnerability"]

    def get_sexual_openness_level(self) -> float:
        """Get appropriate sexual openness level for current stage."""
        return self.STAGES[self.current_stage]["sexual_openness"]

    def get_relationship_context_summary(self) -> Dict:
        """Get comprehensive relationship context for AI prompts."""
        stage_info = self.STAGES[self.current_stage]

        return {
            "current_stage": self.current_stage,
            "stage_description": stage_info["description"],
            "interaction_count": self.interaction_count,
            "positive_interactions": self.positive_interactions,
            "relationship_duration_days": (datetime.now() - datetime.fromisoformat(self.stage_start_time)).days,
            "relationship_quality": self.relationship_quality,
            "appropriate_behaviors": stage_info["behaviors"],
            "max_vulnerability": stage_info["max_vulnerability"],
            "sexual_openness": stage_info["sexual_openness"],
            "recent_milestones": self.milestones[-3:] if self.milestones else [],
            "significant_moments_count": len(self.significant_moments)
        }

    def get_milestone_history(self) -> List[Dict]:
        """Get complete milestone history."""
        return self.milestones.copy()

    def get_relationship_memories(self) -> List[str]:
        """Get relationship memories for context."""
        memories = []

        # Add milestone descriptions
        for milestone in self.milestones[-5:]:  # Last 5 milestones
            memories.append(milestone["description"])

        # Add significant moments
        for moment in self.significant_moments[-3:]:  # Last 3 significant moments
            if moment.get("description"):
                memories.append(moment["description"])

        return memories

    def should_reference_history(self) -> bool:
        """Determine if AI should reference relationship history."""
        # More likely to reference history in deeper stages
        stage_probabilities = {
            "new": 0.1,
            "comfortable": 0.3,
            "intimate": 0.5,
            "established": 0.7
        }

        import random
        return random.random() < stage_probabilities[self.current_stage]

    def get_progression_status(self) -> Dict:
        """Get status of progression to next stage."""
        if self.current_stage == "established":
            return {"can_progress": False, "reason": "Already at maximum stage"}

        current_stage_info = self.STAGES[self.current_stage]

        interaction_progress = self.interaction_count / current_stage_info["duration_threshold"]
        positive_progress = self.positive_interactions / current_stage_info["positive_interaction_threshold"]
        avg_quality = sum(self.relationship_quality.values()) / len(self.relationship_quality)

        progress = min(1.0, (interaction_progress + positive_progress + avg_quality) / 3)

        return {
            "can_progress": progress >= 1.0,
            "progress_percentage": progress * 100,
            "interaction_progress": interaction_progress * 100,
            "positive_progress": positive_progress * 100,
            "quality_score": avg_quality * 100,
            "next_stage": self._get_next_stage()
        }

    def _get_next_stage(self) -> Optional[str]:
        """Get the next relationship stage."""
        stage_order = ["new", "comfortable", "intimate", "established"]
        try:
            current_index = stage_order.index(self.current_stage)
            if current_index < len(stage_order) - 1:
                return stage_order[current_index + 1]
        except ValueError:
            pass
        return None

    def to_dict(self) -> Dict:
        """Convert relationship tracker to dictionary for persistence."""
        return {
            "current_stage": self.current_stage,
            "stage_start_time": self.stage_start_time,
            "interaction_count": self.interaction_count,
            "positive_interactions": self.positive_interactions,
            "negative_interactions": self.negative_interactions,
            "milestones": self.milestones,
            "relationship_quality": self.relationship_quality,
            "significant_moments": self.significant_moments
        }

    def from_dict(self, data: Dict):
        """Load relationship tracker from dictionary."""
        self.current_stage = data.get("current_stage", "new")
        self.stage_start_time = data.get("stage_start_time", datetime.now().isoformat())
        self.interaction_count = data.get("interaction_count", 0)
        self.positive_interactions = data.get("positive_interactions", 0)
        self.negative_interactions = data.get("negative_interactions", 0)
        self.milestones = data.get("milestones", [])
        self.relationship_quality = data.get("relationship_quality", {
            "trust_level": 0.5,
            "intimacy_level": 0.3,
            "communication_quality": 0.5,
            "sexual_chemistry": 0.6,
            "emotional_bond": 0.4
        })
        self.significant_moments = data.get("significant_moments", [])
