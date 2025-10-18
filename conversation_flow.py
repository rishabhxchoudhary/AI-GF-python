"""
Conversation Flow Manager for AI Girlfriend
Handles natural conversation patterns, follow-ups, validations, and topic transitions
"""

import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class ConversationThread:
    """Represents an ongoing conversation topic"""
    topic: str
    status: str  # "ongoing", "resolved", "needs_followup", "waiting_for_user"
    last_mentioned: datetime
    importance: float  # 0.0 to 1.0
    context: str
    user_engagement: float  # How engaged the user seemed with this topic


class ConversationFlowManager:
    """Manages natural conversation flow with human-like patterns"""
    
    def __init__(self):
        self.conversation_threads = {}
        self.recent_topics = []
        self.question_patterns = self._load_question_patterns()
        self.transition_phrases = self._load_transition_phrases()
        self.validation_responses = self._load_validation_responses()
        self.follow_up_patterns = self._load_followup_patterns()
        
    def _load_question_patterns(self) -> Dict[str, List[str]]:
        """Load natural follow-up question patterns"""
        return {
            "emotional_support": [
                "How are you feeling about it now?",
                "What's going through your mind?",
                "Do you want to talk about what's bothering you?",
                "Is there anything I can do to help?",
                "How long have you been feeling this way?"
            ],
            "story_continuation": [
                "What happened next?",
                "How did that make you feel?",
                "What did you do then?",
                "Tell me more about that",
                "That sounds intense - what was going through your head?"
            ],
            "clarification": [
                "Can you help me understand what you mean?",
                "I want to make sure I get this right - are you saying...?",
                "Wait, back up - tell me more about that part",
                "I'm following you, but can you explain...?"
            ],
            "deeper_exploration": [
                "What's the most challenging part about that?",
                "How do you think that affected you?",
                "What would you change if you could?",
                "What's your gut feeling telling you?",
                "What matters most to you in this situation?"
            ],
            "validation_seeking": [
                "That makes perfect sense to me",
                "You're absolutely right to feel that way",
                "Anyone would react like that",
                "Your feelings are completely valid",
                "I can see why that would be important to you"
            ]
        }
    
    def _load_transition_phrases(self) -> Dict[str, List[str]]:
        """Load natural topic transition phrases"""
        return {
            "gentle_redirect": [
                "Speaking of {topic}, how was...",
                "That reminds me - you mentioned...",
                "On a related note...",
                "Actually, that makes me think of...",
                "Oh, and about what you said earlier..."
            ],
            "time_based": [
                "Earlier you mentioned...",
                "Yesterday you were telling me about...",
                "I've been thinking about what you said...",
                "Remember when you told me...?"
            ],
            "emotional_bridge": [
                "I can see this is really affecting you. It reminds me of when you...",
                "This seems to connect to something deeper...",
                "I'm hearing some similar feelings to when you..."
            ],
            "natural_flow": [
                "You know what's interesting?",
                "That actually brings up something I've been curious about...",
                "Can I ask you something related to that?",
                "This might be random, but..."
            ]
        }
    
    def _load_validation_responses(self) -> List[str]:
        """Load validation response patterns"""
        return [
            "That sounds really hard",
            "I can hear how much this means to you",
            "Your feelings make complete sense",
            "Anyone would feel that way",
            "That's such a normal reaction",
            "You're handling this so well",
            "I can see why that would be difficult",
            "That takes a lot of strength",
            "You're not alone in feeling this way",
            "That's really insightful of you"
        ]
    
    def _load_followup_patterns(self) -> Dict[str, List[str]]:
        """Load follow-up conversation patterns"""
        return {
            "work_stress": [
                "How did that meeting go?",
                "Did you get through that deadline okay?",
                "Is work still overwhelming?",
                "How are things with your boss now?"
            ],
            "relationship_issues": [
                "How are things with them now?",
                "Did you end up talking to them?",
                "How are you feeling about the situation?",
                "Any updates on that situation?"
            ],
            "health_concerns": [
                "How are you feeling today?",
                "Did you get a chance to see the doctor?",
                "Are you taking care of yourself?",
                "How's your energy level been?"
            ],
            "family_drama": [
                "How did things go with your family?",
                "Have you talked to them since?",
                "How are you processing all of that?",
                "Are things any better at home?"
            ],
            "future_plans": [
                "Have you thought more about that decision?",
                "Any progress on those plans?",
                "How are you feeling about that choice now?",
                "What's your next step going to be?"
            ]
        }
    
    def track_conversation_thread(self, topic: str, user_text: str, user_engagement: float = 0.5):
        """Track an ongoing conversation topic"""
        
        importance = self._calculate_topic_importance(topic, user_text)
        status = self._determine_thread_status(topic, user_text, user_engagement)
        
        thread = ConversationThread(
            topic=topic,
            status=status,
            last_mentioned=datetime.now(),
            importance=importance,
            context=user_text[:200],  # Store context excerpt
            user_engagement=user_engagement
        )
        
        self.conversation_threads[topic] = thread
        
        # Add to recent topics
        if topic not in self.recent_topics:
            self.recent_topics.append(topic)
        
        # Keep recent topics manageable
        if len(self.recent_topics) > 15:
            self.recent_topics = self.recent_topics[-15:]
    
    def _calculate_topic_importance(self, topic: str, user_text: str) -> float:
        """Calculate importance of a topic based on various factors"""
        
        importance = 0.5  # Base importance
        
        # Length of message indicates investment
        if len(user_text) > 100:
            importance += 0.2
        elif len(user_text) > 200:
            importance += 0.3
        
        # Emotional words increase importance
        emotional_words = ["feel", "hurt", "happy", "scared", "worried", "excited", "love", "hate"]
        emotion_count = sum(1 for word in emotional_words if word in user_text.lower())
        importance += min(emotion_count * 0.1, 0.3)
        
        # Personal pronouns indicate personal investment
        personal_words = ["my", "me", "I", "myself"]
        personal_count = sum(1 for word in personal_words if word in user_text.lower())
        importance += min(personal_count * 0.05, 0.2)
        
        # Certain topics are inherently important
        important_topics = ["work", "family", "health", "relationship", "future", "career"]
        if any(imp_topic in topic.lower() for imp_topic in important_topics):
            importance += 0.2
        
        return min(importance, 1.0)
    
    def _determine_thread_status(self, topic: str, user_text: str, engagement: float) -> str:
        """Determine the status of a conversation thread"""
        
        # Check for resolution indicators
        resolution_words = ["resolved", "better now", "figured it out", "all good", "worked out"]
        if any(word in user_text.lower() for word in resolution_words):
            return "resolved"
        
        # Check for continuation indicators
        continuation_words = ["still", "continue", "ongoing", "more", "also", "and"]
        if any(word in user_text.lower() for word in continuation_words):
            return "ongoing"
        
        # Low engagement might mean user doesn't want to continue
        if engagement < 0.3:
            return "waiting_for_user"
        
        # High engagement means followup is welcome
        if engagement > 0.7:
            return "needs_followup"
        
        return "ongoing"
    
    def generate_follow_up_question(self, topic: str, context: str = "") -> Optional[str]:
        """Generate a natural follow-up question for a topic"""
        
        if topic not in self.conversation_threads:
            return None
        
        thread = self.conversation_threads[topic]
        
        # Don't follow up on resolved topics
        if thread.status == "resolved":
            return None
        
        # Don't follow up too frequently
        time_since_mention = datetime.now() - thread.last_mentioned
        if time_since_mention < timedelta(hours=2):  # Wait at least 2 hours
            return None
        
        # Choose appropriate follow-up based on topic category
        category = self._categorize_topic(topic)
        followups = self.follow_up_patterns.get(category, [])
        
        if not followups:
            # Generic follow-ups
            followups = [
                f"How did that {topic} situation work out?",
                f"Any updates on the {topic} thing?",
                f"I've been thinking about what you said about {topic}...",
                f"How are you feeling about {topic} now?"
            ]
        
        return random.choice(followups)
    
    def _categorize_topic(self, topic: str) -> str:
        """Categorize a topic for follow-up selection"""
        
        topic_lower = topic.lower()
        
        if any(word in topic_lower for word in ["work", "job", "boss", "career", "deadline"]):
            return "work_stress"
        elif any(word in topic_lower for word in ["relationship", "friend", "dating", "breakup"]):
            return "relationship_issues"
        elif any(word in topic_lower for word in ["health", "doctor", "sick", "pain"]):
            return "health_concerns"
        elif any(word in topic_lower for word in ["family", "mom", "dad", "sister", "brother"]):
            return "family_drama"
        elif any(word in topic_lower for word in ["future", "plan", "decision", "choice"]):
            return "future_plans"
        else:
            return "general"
    
    def generate_natural_transition(self, current_topic: str, new_topic: str) -> str:
        """Generate a natural transition between topics"""
        
        transition_type = random.choice(["gentle_redirect", "natural_flow"])
        transitions = self.transition_phrases[transition_type]
        
        if transition_type == "gentle_redirect":
            return random.choice(transitions).format(topic=new_topic)
        else:
            return random.choice(transitions)
    
    def generate_validation_response(self, user_emotion: str = "") -> str:
        """Generate a validating response"""
        
        if user_emotion in ["sad", "stressed", "anxious"]:
            validations = [
                "That sounds really overwhelming",
                "I can hear how hard this is for you",
                "Your feelings are completely valid",
                "Anyone would struggle with that"
            ]
        elif user_emotion in ["happy", "excited"]:
            validations = [
                "I love hearing the excitement in your voice!",
                "That's such wonderful news!",
                "You deserve to feel happy about this",
                "I'm so happy for you!"
            ]
        else:
            validations = self.validation_responses
        
        return random.choice(validations)
    
    def suggest_conversation_direction(self, context: Dict) -> Dict:
        """Suggest natural conversation directions based on context"""
        
        suggestions = {
            "type": "suggestion",
            "options": []
        }
        
        # Check for unresolved threads that need follow-up
        unresolved_threads = [
            thread for thread in self.conversation_threads.values()
            if thread.status in ["needs_followup", "ongoing"] and thread.importance > 0.6
        ]
        
        if unresolved_threads:
            # Sort by importance and recency
            thread = max(unresolved_threads, key=lambda x: x.importance)
            suggestions["options"].append({
                "type": "followup",
                "text": f"Earlier you mentioned {thread.topic}. How did that go?",
                "priority": "high"
            })
        
        # Suggest deeper exploration if user shared something personal
        if context.get("user_shared_personal"):
            questions = self.question_patterns["deeper_exploration"]
            suggestions["options"].append({
                "type": "exploration",
                "text": random.choice(questions),
                "priority": "medium"
            })
        
        # Suggest emotional support if user seems distressed
        if context.get("user_emotion") in ["sad", "stressed", "anxious"]:
            questions = self.question_patterns["emotional_support"]
            suggestions["options"].append({
                "type": "support",
                "text": random.choice(questions),
                "priority": "high"
            })
        
        return suggestions
    
    def get_conversation_continuity(self) -> Dict:
        """Get information about conversation continuity and threads"""
        
        active_threads = [
            thread for thread in self.conversation_threads.values()
            if thread.status in ["ongoing", "needs_followup"]
        ]
        
        return {
            "active_threads": len(active_threads),
            "total_threads": len(self.conversation_threads),
            "recent_topics": self.recent_topics[-5:],
            "high_priority_threads": [
                thread.topic for thread in active_threads
                if thread.importance > 0.7
            ],
            "needs_followup": [
                thread.topic for thread in active_threads
                if thread.status == "needs_followup"
            ]
        }
    
    def cleanup_old_threads(self, days_old: int = 7):
        """Clean up conversation threads older than specified days"""
        
        cutoff_date = datetime.now() - timedelta(days=days_old)
        
        old_threads = [
            topic for topic, thread in self.conversation_threads.items()
            if thread.last_mentioned < cutoff_date and thread.importance < 0.5
        ]
        
        for topic in old_threads:
            del self.conversation_threads[topic]
    
    def detect_conversation_patterns(self, recent_messages: List[str]) -> Dict:
        """Detect patterns in recent conversation flow"""
        
        if len(recent_messages) < 3:
            return {"pattern": "insufficient_data"}
        
        # Analyze message lengths
        lengths = [len(msg) for msg in recent_messages]
        avg_length = sum(lengths) / len(lengths)
        
        # Analyze emotional content
        emotional_messages = sum(1 for msg in recent_messages if self._contains_emotions(msg))
        
        # Analyze question frequency
        questions = sum(1 for msg in recent_messages if "?" in msg)
        
        return {
            "pattern": "analyzed",
            "avg_message_length": avg_length,
            "engagement_level": "high" if avg_length > 50 else "medium" if avg_length > 20 else "low",
            "emotional_content": emotional_messages / len(recent_messages),
            "question_frequency": questions / len(recent_messages),
            "conversation_depth": "deep" if emotional_messages > len(recent_messages) * 0.6 else "surface"
        }
    
    def _contains_emotions(self, text: str) -> bool:
        """Check if text contains emotional content"""
        emotion_words = [
            "feel", "emotion", "happy", "sad", "angry", "excited", "worried", 
            "stressed", "anxious", "love", "hate", "frustrated", "grateful"
        ]
        return any(word in text.lower() for word in emotion_words)
    
    def to_dict(self) -> Dict:
        """Convert conversation threads to dictionary for storage"""
        return {
            "conversation_threads": {
                topic: {
                    "topic": thread.topic,
                    "status": thread.status,
                    "last_mentioned": thread.last_mentioned.isoformat(),
                    "importance": thread.importance,
                    "context": thread.context,
                    "user_engagement": thread.user_engagement
                }
                for topic, thread in self.conversation_threads.items()
            },
            "recent_topics": self.recent_topics
        }
    
    def from_dict(self, data: Dict):
        """Load conversation threads from dictionary"""
        if "conversation_threads" in data:
            for topic, thread_data in data["conversation_threads"].items():
                self.conversation_threads[topic] = ConversationThread(
                    topic=thread_data["topic"],
                    status=thread_data["status"],
                    last_mentioned=datetime.fromisoformat(thread_data["last_mentioned"]),
                    importance=thread_data["importance"],
                    context=thread_data["context"],
                    user_engagement=thread_data["user_engagement"]
                )
        
        if "recent_topics" in data:
            self.recent_topics = data["recent_topics"]