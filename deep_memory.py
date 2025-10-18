"""
Deep Memory Manager for AI Girlfriend
Enhanced memory system for conversation threads, emotional history, and storytelling
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict


@dataclass
class MemoryEntry:
    """Represents a single memory entry"""
    content: str
    category: str
    importance: float
    timestamp: datetime
    emotional_context: str
    tags: List[str]
    related_entries: List[str]


@dataclass
class StoryFragment:
    """Represents a fragment of an ongoing story the user is telling"""
    story_id: str
    title: str
    fragments: List[str]
    current_status: str  # "ongoing", "paused", "concluded"
    emotional_tone: str
    last_updated: datetime
    importance: float


@dataclass
class EmotionalMoment:
    """Represents a significant emotional moment"""
    moment_id: str
    description: str
    primary_emotion: str
    intensity: float
    context: str
    timestamp: datetime
    user_needs_support: bool
    follow_up_needed: bool


class DeepMemoryManager:
    """Enhanced memory system with deep context understanding"""
    
    def __init__(self):
        self.memories: Dict[str, MemoryEntry] = {}
        self.story_fragments: Dict[str, StoryFragment] = {}
        self.emotional_moments: Dict[str, EmotionalMoment] = {}
        self.user_life_events = []
        self.relationship_milestones = []
        self.inside_jokes = []
        self.shared_references = []
        self.unresolved_concerns = []
        self.future_plans = []
        
        # User profile building
        self.user_personality_traits = {}
        self.user_interests = {}
        self.user_habits = {}
        self.user_communication_style = {}
        
    def store_memory(self, content: str, category: str, emotional_context: str = "", 
                    importance: float = 0.5, tags: List[str] = None) -> str:
        """Store a new memory with rich context"""
        
        if tags is None:
            tags = []
        
        memory_id = f"mem_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Auto-detect additional tags
        auto_tags = self._detect_tags(content)
        tags.extend(auto_tags)
        
        # Calculate importance if not provided
        if importance == 0.5:
            importance = self._calculate_memory_importance(content, emotional_context)
        
        memory = MemoryEntry(
            content=content,
            category=category,
            importance=importance,
            timestamp=datetime.now(),
            emotional_context=emotional_context,
            tags=list(set(tags)),  # Remove duplicates
            related_entries=self._find_related_memories(content, tags)
        )
        
        self.memories[memory_id] = memory
        return memory_id
    
    def _detect_tags(self, content: str) -> List[str]:
        """Auto-detect tags from content"""
        tags = []
        content_lower = content.lower()
        
        # Topic tags
        topic_keywords = {
            "work": ["work", "job", "boss", "colleague", "office", "meeting", "deadline"],
            "family": ["mom", "dad", "mother", "father", "sister", "brother", "family"],
            "relationship": ["girlfriend", "boyfriend", "dating", "relationship", "partner"],
            "health": ["doctor", "hospital", "sick", "pain", "medication", "health"],
            "hobbies": ["music", "movie", "book", "game", "sport", "hobby"],
            "future": ["plan", "goal", "dream", "future", "want", "hope"],
            "travel": ["trip", "vacation", "travel", "flight", "hotel"],
            "education": ["school", "college", "university", "study", "exam", "class"]
        }
        
        for tag, keywords in topic_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                tags.append(tag)
        
        # Emotional tags
        emotion_keywords = {
            "positive": ["happy", "excited", "amazing", "wonderful", "great", "love"],
            "negative": ["sad", "angry", "frustrated", "upset", "worried", "stressed"],
            "achievement": ["accomplished", "proud", "success", "won", "achieved"],
            "concern": ["worried", "anxious", "concerned", "nervous", "scared"]
        }
        
        for tag, keywords in emotion_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                tags.append(tag)
        
        return tags
    
    def _calculate_memory_importance(self, content: str, emotional_context: str) -> float:
        """Calculate the importance of a memory"""
        importance = 0.5  # Base importance
        
        # Length indicates detail and investment
        if len(content) > 100:
            importance += 0.1
        if len(content) > 200:
            importance += 0.1
        
        # Emotional content is more important
        if emotional_context and emotional_context != "neutral":
            importance += 0.2
        
        # Personal pronouns indicate personal significance
        personal_count = sum(1 for word in ["my", "me", "I", "myself"] if word in content.lower())
        importance += min(personal_count * 0.05, 0.2)
        
        # Important life areas
        important_keywords = ["family", "work", "health", "relationship", "future", "goal"]
        if any(keyword in content.lower() for keyword in important_keywords):
            importance += 0.1
        
        return min(importance, 1.0)
    
    def _find_related_memories(self, content: str, tags: List[str]) -> List[str]:
        """Find memories related to the new content"""
        related = []
        content_words = set(content.lower().split())
        
        for memory_id, memory in self.memories.items():
            # Check tag overlap
            tag_overlap = set(tags) & set(memory.tags)
            if len(tag_overlap) > 0:
                related.append(memory_id)
                continue
            
            # Check content similarity
            memory_words = set(memory.content.lower().split())
            overlap = len(content_words & memory_words)
            if overlap > 3:  # Significant word overlap
                related.append(memory_id)
        
        return related[:5]  # Limit to most related
    
    def start_story_tracking(self, initial_content: str, emotional_tone: str = "neutral") -> str:
        """Start tracking a new story the user is telling"""
        
        story_id = f"story_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Generate title from first few words
        words = initial_content.split()
        title = " ".join(words[:6]) + ("..." if len(words) > 6 else "")
        
        story = StoryFragment(
            story_id=story_id,
            title=title,
            fragments=[initial_content],
            current_status="ongoing",
            emotional_tone=emotional_tone,
            last_updated=datetime.now(),
            importance=self._calculate_story_importance(initial_content)
        )
        
        self.story_fragments[story_id] = story
        return story_id
    
    def add_story_fragment(self, story_id: str, new_content: str) -> bool:
        """Add a new fragment to an ongoing story"""
        
        if story_id not in self.story_fragments:
            return False
        
        story = self.story_fragments[story_id]
        story.fragments.append(new_content)
        story.last_updated = datetime.now()
        
        # Update emotional tone if it has changed
        new_tone = self._detect_emotional_tone(new_content)
        if new_tone != "neutral" and new_tone != story.emotional_tone:
            story.emotional_tone = new_tone
        
        return True
    
    def _calculate_story_importance(self, content: str) -> float:
        """Calculate importance of a story"""
        importance = 0.6  # Stories are generally important
        
        # Personal stories are more important
        if any(word in content.lower() for word in ["my", "me", "I", "myself"]):
            importance += 0.2
        
        # Emotional content increases importance
        emotional_words = ["feel", "felt", "emotion", "happy", "sad", "scared", "excited"]
        if any(word in content.lower() for word in emotional_words):
            importance += 0.1
        
        return min(importance, 1.0)
    
    def _detect_emotional_tone(self, content: str) -> str:
        """Detect emotional tone of content"""
        content_lower = content.lower()
        
        emotions = {
            "positive": ["happy", "excited", "great", "amazing", "wonderful", "love"],
            "negative": ["sad", "upset", "angry", "frustrated", "hate", "terrible"],
            "anxious": ["worried", "nervous", "scared", "anxious", "concerned"],
            "nostalgic": ["remember", "used to", "back then", "childhood", "miss"]
        }
        
        for emotion, keywords in emotions.items():
            if any(keyword in content_lower for keyword in keywords):
                return emotion
        
        return "neutral"
    
    def record_emotional_moment(self, description: str, primary_emotion: str, 
                              intensity: float, context: str) -> str:
        """Record a significant emotional moment"""
        
        moment_id = f"emotion_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Determine if follow-up is needed
        follow_up_needed = intensity > 0.7 and primary_emotion in ["sad", "anxious", "angry", "stressed"]
        user_needs_support = intensity > 0.6 and primary_emotion in ["sad", "anxious", "lonely"]
        
        moment = EmotionalMoment(
            moment_id=moment_id,
            description=description,
            primary_emotion=primary_emotion,
            intensity=intensity,
            context=context,
            timestamp=datetime.now(),
            user_needs_support=user_needs_support,
            follow_up_needed=follow_up_needed
        )
        
        self.emotional_moments[moment_id] = moment
        return moment_id
    
    def add_life_event(self, event: str, importance: float = 0.7, date: datetime = None):
        """Add a significant life event"""
        if date is None:
            date = datetime.now()
        
        life_event = {
            "event": event,
            "importance": importance,
            "date": date.isoformat(),
            "timestamp": datetime.now().isoformat()
        }
        
        self.user_life_events.append(life_event)
        
        # Keep manageable
        if len(self.user_life_events) > 50:
            # Sort by importance and keep most important
            self.user_life_events.sort(key=lambda x: x["importance"], reverse=True)
            self.user_life_events = self.user_life_events[:50]
    
    def add_inside_joke(self, joke_context: str, keywords: List[str]):
        """Add a new inside joke or reference"""
        inside_joke = {
            "context": joke_context,
            "keywords": keywords,
            "created": datetime.now().isoformat(),
            "usage_count": 0
        }
        
        self.inside_jokes.append(inside_joke)
        
        # Keep manageable
        if len(self.inside_jokes) > 20:
            self.inside_jokes = self.inside_jokes[-20:]
    
    def use_inside_joke(self, keywords: List[str]) -> Optional[Dict]:
        """Find and use an inside joke"""
        for joke in self.inside_jokes:
            if any(keyword in joke["keywords"] for keyword in keywords):
                joke["usage_count"] += 1
                joke["last_used"] = datetime.now().isoformat()
                return joke
        return None
    
    def add_unresolved_concern(self, concern: str, category: str = "general"):
        """Add an unresolved concern that needs follow-up"""
        concern_entry = {
            "concern": concern,
            "category": category,
            "added": datetime.now().isoformat(),
            "follow_up_attempts": 0,
            "resolved": False
        }
        
        self.unresolved_concerns.append(concern_entry)
    
    def resolve_concern(self, concern_text: str):
        """Mark a concern as resolved"""
        for concern in self.unresolved_concerns:
            if concern_text.lower() in concern["concern"].lower():
                concern["resolved"] = True
                concern["resolved_date"] = datetime.now().isoformat()
                break
    
    def get_follow_up_suggestions(self) -> List[Dict]:
        """Get suggestions for follow-up questions or topics"""
        suggestions = []
        
        # Unresolved concerns
        for concern in self.unresolved_concerns:
            if not concern["resolved"] and concern["follow_up_attempts"] < 3:
                suggestions.append({
                    "type": "concern_followup",
                    "text": f"How are things going with {concern['concern']}?",
                    "priority": "high",
                    "category": concern["category"]
                })
        
        # Ongoing stories
        for story in self.story_fragments.values():
            if story.current_status == "ongoing":
                time_since = datetime.now() - story.last_updated
                if time_since > timedelta(hours=6):  # Follow up if story paused
                    suggestions.append({
                        "type": "story_continuation",
                        "text": f"You were telling me about {story.title}. What happened next?",
                        "priority": "medium",
                        "story_id": story.story_id
                    })
        
        # Emotional moments needing follow-up
        for moment in self.emotional_moments.values():
            if moment.follow_up_needed:
                time_since = datetime.now() - moment.timestamp
                if timedelta(hours=2) < time_since < timedelta(days=1):
                    suggestions.append({
                        "type": "emotional_support",
                        "text": f"I've been thinking about what you shared about {moment.description}. How are you feeling about it now?",
                        "priority": "high",
                        "emotion": moment.primary_emotion
                    })
        
        return suggestions
    
    def get_contextual_memories(self, query: str, limit: int = 5) -> List[Dict]:
        """Get memories relevant to a query"""
        query_words = set(query.lower().split())
        scored_memories = []
        
        for memory_id, memory in self.memories.items():
            score = 0
            memory_words = set(memory.content.lower().split())
            
            # Word overlap score
            overlap = len(query_words & memory_words)
            score += overlap * 0.3
            
            # Tag relevance
            query_tags = self._detect_tags(query)
            tag_overlap = len(set(query_tags) & set(memory.tags))
            score += tag_overlap * 0.4
            
            # Importance boost
            score += memory.importance * 0.3
            
            if score > 0:
                scored_memories.append({
                    "memory_id": memory_id,
                    "memory": memory,
                    "relevance_score": score
                })
        
        # Sort by relevance and return top results
        scored_memories.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_memories[:limit]
    
    def get_conversation_context(self) -> Dict:
        """Get rich context for current conversation"""
        now = datetime.now()
        recent_cutoff = now - timedelta(days=7)
        
        # Recent emotional moments
        recent_emotions = [
            moment for moment in self.emotional_moments.values()
            if moment.timestamp > recent_cutoff
        ]
        
        # Active stories
        active_stories = [
            story for story in self.story_fragments.values()
            if story.current_status == "ongoing"
        ]
        
        # Unresolved concerns
        active_concerns = [
            concern for concern in self.unresolved_concerns
            if not concern["resolved"]
        ]
        
        return {
            "recent_emotional_moments": len(recent_emotions),
            "active_stories": len(active_stories),
            "unresolved_concerns": len(active_concerns),
            "total_memories": len(self.memories),
            "inside_jokes": len(self.inside_jokes),
            "life_events": len(self.user_life_events),
            "needs_emotional_support": any(m.user_needs_support for m in recent_emotions),
            "conversation_continuity": {
                "ongoing_topics": [story.title for story in active_stories[:3]],
                "pending_concerns": [concern["concern"][:50] for concern in active_concerns[:3]]
            }
        }
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage"""
        return {
            "memories": {
                mid: {
                    "content": mem.content,
                    "category": mem.category,
                    "importance": mem.importance,
                    "timestamp": mem.timestamp.isoformat(),
                    "emotional_context": mem.emotional_context,
                    "tags": mem.tags,
                    "related_entries": mem.related_entries
                }
                for mid, mem in self.memories.items()
            },
            "story_fragments": {
                sid: asdict(story) for sid, story in self.story_fragments.items()
            },
            "emotional_moments": {
                eid: asdict(moment) for eid, moment in self.emotional_moments.items()
            },
            "user_life_events": self.user_life_events,
            "inside_jokes": self.inside_jokes,
            "unresolved_concerns": self.unresolved_concerns,
            "future_plans": self.future_plans
        }
    
    def from_dict(self, data: Dict):
        """Load from dictionary"""
        if "memories" in data:
            for mid, mem_data in data["memories"].items():
                self.memories[mid] = MemoryEntry(
                    content=mem_data["content"],
                    category=mem_data["category"],
                    importance=mem_data["importance"],
                    timestamp=datetime.fromisoformat(mem_data["timestamp"]),
                    emotional_context=mem_data["emotional_context"],
                    tags=mem_data["tags"],
                    related_entries=mem_data["related_entries"]
                )
        
        if "story_fragments" in data:
            for sid, story_data in data["story_fragments"].items():
                story_data["last_updated"] = datetime.fromisoformat(story_data["last_updated"])
                self.story_fragments[sid] = StoryFragment(**story_data)
        
        if "emotional_moments" in data:
            for eid, moment_data in data["emotional_moments"].items():
                moment_data["timestamp"] = datetime.fromisoformat(moment_data["timestamp"])
                self.emotional_moments[eid] = EmotionalMoment(**moment_data)
        
        # Load other data
        for key in ["user_life_events", "inside_jokes", "unresolved_concerns", "future_plans"]:
            if key in data:
                setattr(self, key, data[key])