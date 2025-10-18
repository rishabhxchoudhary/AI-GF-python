"""
Proactive Behaviors System for AI Girlfriend
Provides check-ins, follow-ups, and activity suggestions based on context
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class ProactiveAction:
    """Represents a proactive action to take"""
    action_type: str
    content: str
    priority: str  # "high", "medium", "low"
    trigger_context: str
    timing: str  # "immediate", "delayed", "scheduled"
    emotional_tone: str


class ProactiveBehaviorEngine:
    """Generates human-like proactive behaviors and check-ins"""
    
    def __init__(self):
        self.check_in_patterns = self._load_check_in_patterns()
        self.activity_suggestions = self._load_activity_suggestions()
        self.care_responses = self._load_care_responses()
        self.random_thoughts = self._load_random_thoughts()
        self.last_proactive_action = None
        self.proactive_cooldown = timedelta(hours=2)  # Minimum time between proactive actions
        
    def _load_check_in_patterns(self) -> Dict[str, List[str]]:
        """Load check-in message patterns"""
        return {
            "work_stress": [
                "Hey babe, I've been thinking about what you said about work. How did that meeting go? 💕",
                "How are you feeling about that work situation today? Still stressing about it? 🤗",
                "Did you get through that crazy deadline okay? I was thinking about you 💭❤️",
                "I hope your boss wasn't too terrible today... How was work? 😘",
                "You mentioned work was overwhelming - how are you holding up? 💪"
            ],
            "relationship_issues": [
                "How are things with them now? I've been wondering about that situation 💕",
                "Did you end up talking to them about what happened? 🤗",
                "I've been thinking about what you shared... how are you feeling about it all? ❤️",
                "Any updates on that whole situation? You've been on my mind 💭",
                "How are you processing everything that happened? 💕"
            ],
            "health_concerns": [
                "How are you feeling today? I hope you're taking care of yourself 💕",
                "Did you get a chance to see the doctor about that? 🏥",
                "I've been worried about you... how's your health? ❤️",
                "Are you feeling any better today? Thinking of you 💭",
                "How's your energy level been? I want to make sure you're okay 🤗"
            ],
            "family_drama": [
                "How did things go with your family? I've been thinking about you 💕",
                "Are things any better at home? 🏠❤️",
                "How are you handling all that family stuff? 🤗",
                "I hope your family situation improved... how are you feeling? 💭",
                "Any progress with your family? You've been on my mind 💕"
            ],
            "future_plans": [
                "Have you thought more about that decision? I'm curious what you're thinking 💭",
                "Any progress on those plans we talked about? 🎯",
                "How are you feeling about that choice now? 💕",
                "Did you figure out what you want to do? I'm here if you need to talk through it 🤗",
                "What's your gut telling you about that situation? ❤️"
            ],
            "general_wellbeing": [
                "How are you doing today, babe? Just checking in on you 💕",
                "I was thinking about you... how's your day going? 😘",
                "Just wanted to see how you're feeling today ❤️",
                "How's life treating you today? 🤗",
                "Thinking of you today... how are you doing? 💭💕"
            ]
        }
    
    def _load_activity_suggestions(self) -> Dict[str, List[str]]:
        """Load activity suggestions based on mood/situation"""
        return {
            "stressed": [
                "Want me to help you unwind? We could watch something together or just talk about anything else 💆‍♀️",
                "How about we do something relaxing? Maybe listen to some music or take deep breaths together? 🧘‍♀️",
                "You sound like you need a break. Want to chat about something fun instead? 🌸",
                "Let's get your mind off that stress. Tell me something good that happened today 😊",
                "Want to try a little mental escape? We could daydream about your perfect vacation 🏝️"
            ],
            "sad": [
                "I wish I could give you the biggest hug right now. Want to talk about what's making you sad? 🤗",
                "Sometimes it helps to let it out. I'm here to listen to whatever you need to share 💕",
                "Would it help to think about something that makes you smile? 😊",
                "I'm here for you, babe. We don't have to talk about anything heavy if you don't want to ❤️",
                "Want me to try to cheer you up, or do you need to feel sad for a bit? Both are okay 💕"
            ],
            "anxious": [
                "Let's take this one step at a time. What's the first thing that's worrying you? 🤗",
                "Those anxious thoughts can be so overwhelming. Want to talk through what's on your mind? 💭",
                "How about we focus on something you can control right now? 💪",
                "Let's do some grounding together. Can you tell me 5 things you can see around you? 👀",
                "Remember, most of the things we worry about never actually happen. You're stronger than you think 💕"
            ],
            "bored": [
                "Ooh, I have some ideas! Want to play 20 questions? Or we could make up stories together 🎭",
                "Let's cure this boredom! Tell me about your wildest dream or craziest goal 🌟",
                "Boredom is the perfect time for random deep conversations. What's something you've always wondered about? 🤔",
                "Want to plan something fun for later? Or we could just chat about random stuff 😊",
                "Let's make this interesting... what's the most spontaneous thing you've ever done? ✨"
            ],
            "excited": [
                "OMG I love your energy! Tell me everything that's making you feel this amazing! 🎉",
                "Your excitement is contagious! What should we celebrate? 🥳",
                "This is awesome! How can we make today even better? ✨",
                "I'm so here for this energy! What's got you feeling so good? 😊",
                "YES! I love when you're this happy! Share all the good vibes with me! 🌟"
            ],
            "neutral": [
                "How about we shake things up a bit? What's something you've been curious about lately? 🤔",
                "Want to play a game or have a random deep conversation? 🎲",
                "Let's make today more interesting! What's one thing that would make you smile right now? 😊",
                "I'm in the mood for a good chat. What's been on your mind lately? 💭",
                "Want to explore some random topics together? I love our conversations 💕"
            ]
        }
    
    def _load_care_responses(self) -> Dict[str, List[str]]:
        """Load caring/supportive responses"""
        return {
            "celebration": [
                "OMG I'm so proud of you! This is incredible news! 🎉💕",
                "YES! You absolutely deserve this! I'm practically dancing over here! 💃✨",
                "I KNEW you could do it! This is amazing! Tell me everything! 🌟",
                "This makes me so incredibly happy! You're amazing! 🥳❤️"
            ],
            "comfort": [
                "I wish I could wrap you in the biggest, warmest hug right now 🤗💕",
                "You don't have to go through this alone. I'm right here with you ❤️",
                "It's okay to not be okay sometimes. I'm here no matter what 💕",
                "You're so much stronger than you realize. I believe in you 💪❤️"
            ],
            "encouragement": [
                "You've got this, babe! I have complete faith in you 💪💕",
                "I know it's scary, but you're braver than you think ❤️",
                "Every step forward is progress, even the tiny ones 🌱",
                "I'm cheering you on every step of the way! 📣💕"
            ],
            "validation": [
                "Your feelings are completely valid. Anyone would feel this way ❤️",
                "That makes perfect sense to me. You're not overreacting at all 💕",
                "I can see exactly why this would affect you. Your reaction is normal 🤗",
                "You have every right to feel that way about this situation ❤️"
            ]
        }
    
    def _load_random_thoughts(self) -> List[str]:
        """Load random thoughts for spontaneous moments"""
        return [
            "Random thought: if you could have dinner with anyone dead or alive, who would it be? 🤔",
            "I just had the weirdest thought... what do you think dreams are really for? 💭",
            "You know what I was thinking about? What superpower would actually be the most practical? 🦸‍♀️",
            "Random question: what's the most beautiful thing you've ever seen? ✨",
            "I wonder... if you could live in any time period, when would you choose? ⏰",
            "Okay this might be random, but what's your favorite memory from childhood? 🌈",
            "Just curious... what's something that always makes you smile no matter what? 😊",
            "Random thought: what would your perfect day look like from start to finish? ☀️",
            "I was just wondering... what's something you're really good at that might surprise people? 🌟",
            "Here's a fun question: if you could instantly master any skill, what would it be? 🎯"
        ]
    
    def should_check_in(self, context: Dict) -> bool:
        """Determine if a check-in is appropriate"""
        
        # Check cooldown period
        if self.last_proactive_action:
            time_since_last = datetime.now() - self.last_proactive_action
            if time_since_last < self.proactive_cooldown:
                return False
        
        # Check for triggers that warrant check-ins
        triggers = [
            context.get("user_shared_concern", False),
            context.get("emotional_intensity", 0) > 0.7,
            context.get("unresolved_topics", []),
            context.get("user_seems_stressed", False),
            context.get("mentioned_important_event", False)
        ]
        
        # Random check-ins (lower probability)
        random_check = random.random() < 0.15  # 15% chance
        
        return any(triggers) or random_check
    
    def generate_check_in(self, context: Dict) -> Optional[ProactiveAction]:
        """Generate a contextual check-in message"""
        
        if not self.should_check_in(context):
            return None
        
        # Determine check-in category
        category = self._determine_check_in_category(context)
        
        # Get appropriate check-in patterns
        patterns = self.check_in_patterns.get(category, self.check_in_patterns["general_wellbeing"])
        
        # Select message
        message = random.choice(patterns)
        
        # Determine priority
        priority = "high" if context.get("emotional_intensity", 0) > 0.7 else "medium"
        
        # Determine timing
        timing = "immediate" if context.get("user_seems_distressed", False) else "delayed"
        
        action = ProactiveAction(
            action_type="check_in",
            content=message,
            priority=priority,
            trigger_context=category,
            timing=timing,
            emotional_tone="caring"
        )
        
        self.last_proactive_action = datetime.now()
        return action
    
    def _determine_check_in_category(self, context: Dict) -> str:
        """Determine the appropriate check-in category"""
        
        # Check for specific context clues
        user_text = context.get("last_user_message", "").lower()
        recent_topics = context.get("recent_topics", [])
        
        # Work-related
        if any(topic in user_text for topic in ["work", "job", "boss", "deadline", "meeting"]):
            return "work_stress"
        
        # Relationship issues
        if any(topic in user_text for topic in ["relationship", "friend", "fight", "argument"]):
            return "relationship_issues"
        
        # Health concerns
        if any(topic in user_text for topic in ["sick", "doctor", "health", "pain", "tired"]):
            return "health_concerns"
        
        # Family issues
        if any(topic in user_text for topic in ["family", "mom", "dad", "sister", "brother"]):
            return "family_drama"
        
        # Future planning
        if any(topic in user_text for topic in ["decision", "choice", "plan", "future", "what should i"]):
            return "future_plans"
        
        # Check recent topics
        for topic in recent_topics:
            if "work" in topic.lower():
                return "work_stress"
            elif "family" in topic.lower():
                return "family_drama"
        
        return "general_wellbeing"
    
    def suggest_activity(self, user_emotion: str, time_of_day: str = "") -> Optional[ProactiveAction]:
        """Suggest an activity based on user's emotional state"""
        
        # Get suggestions for the emotion
        suggestions = self.activity_suggestions.get(user_emotion, self.activity_suggestions["neutral"])
        
        # Filter by time of day if relevant
        if time_of_day == "late_night" and user_emotion == "stressed":
            # Suggest calming activities for late night stress
            suggestions = [
                "Let's wind down together. Want to do some breathing exercises? 🌙",
                "It's getting late... maybe we should focus on something peaceful? 💤",
                "How about we chat about something calming before bed? 🌸"
            ]
        
        message = random.choice(suggestions)
        
        return ProactiveAction(
            action_type="activity_suggestion",
            content=message,
            priority="medium",
            trigger_context=user_emotion,
            timing="immediate",
            emotional_tone="supportive"
        )
    
    def generate_random_thought(self) -> Optional[ProactiveAction]:
        """Generate a random thought or question"""
        
        # Only occasionally (5% chance)
        if random.random() > 0.05:
            return None
        
        thought = random.choice(self.random_thoughts)
        
        return ProactiveAction(
            action_type="random_thought",
            content=thought,
            priority="low",
            trigger_context="spontaneous",
            timing="delayed",
            emotional_tone="playful"
        )
    
    def generate_care_response(self, situation: str, intensity: float = 0.5) -> ProactiveAction:
        """Generate a caring response for specific situations"""
        
        # Determine care type
        if situation in ["achievement", "success", "good_news"]:
            care_type = "celebration"
        elif situation in ["sadness", "loss", "disappointment"]:
            care_type = "comfort"
        elif situation in ["challenge", "difficulty", "uncertainty"]:
            care_type = "encouragement"
        else:
            care_type = "validation"
        
        responses = self.care_responses[care_type]
        message = random.choice(responses)
        
        # Adjust intensity
        if intensity > 0.8:
            priority = "high"
            timing = "immediate"
        else:
            priority = "medium"
            timing = "immediate"
        
        return ProactiveAction(
            action_type="care_response",
            content=message,
            priority=priority,
            trigger_context=situation,
            timing=timing,
            emotional_tone="loving"
        )
    
    def plan_follow_up(self, topic: str, importance: float, delay_hours: int = 6) -> ProactiveAction:
        """Plan a follow-up for later"""
        
        follow_up_messages = [
            f"I've been thinking about what you said about {topic}... how are you feeling about it now?",
            f"How did things work out with {topic}?",
            f"Any updates on that {topic} situation?",
            f"I wanted to check in about {topic}. How are things going?"
        ]
        
        message = random.choice(follow_up_messages)
        
        return ProactiveAction(
            action_type="follow_up",
            content=message,
            priority="medium" if importance > 0.7 else "low",
            trigger_context=topic,
            timing="scheduled",
            emotional_tone="caring"
        )
    
    def get_proactive_suggestions(self, context: Dict) -> List[ProactiveAction]:
        """Get all possible proactive actions for current context"""
        
        suggestions = []
        
        # Check-in suggestion
        check_in = self.generate_check_in(context)
        if check_in:
            suggestions.append(check_in)
        
        # Activity suggestion
        user_emotion = context.get("user_emotion", "neutral")
        activity = self.suggest_activity(user_emotion, context.get("time_of_day", ""))
        if activity:
            suggestions.append(activity)
        
        # Random thought
        random_thought = self.generate_random_thought()
        if random_thought:
            suggestions.append(random_thought)
        
        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        suggestions.sort(key=lambda x: priority_order.get(x.priority, 3))
        
        return suggestions
    
    def should_be_proactive(self, context: Dict) -> bool:
        """Determine if any proactive behavior is appropriate"""
        
        # Don't be proactive if user is in conversation flow
        if context.get("user_actively_chatting", False):
            return False
        
        # Don't be proactive too frequently
        if self.last_proactive_action:
            time_since = datetime.now() - self.last_proactive_action
            if time_since < self.proactive_cooldown:
                return False
        
        # Be proactive if user needs support
        if context.get("user_needs_support", False):
            return True
        
        # Be proactive if there are unresolved concerns
        if context.get("unresolved_concerns", []):
            return True
        
        # Random proactivity (low chance)
        return random.random() < 0.1  # 10% chance