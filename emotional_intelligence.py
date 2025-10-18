"""
Emotional Intelligence Module for AI Girlfriend
Provides deep emotional analysis, empathy, and human-like emotional responses
"""

import re
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class EmotionalState:
    """Represents a detected emotional state"""
    primary_emotion: str
    intensity: float  # 0.0 to 1.0
    secondary_emotions: List[str]
    emotional_triggers: List[str]
    support_needed: str
    response_tone: str
    confidence: float  # How confident we are in this analysis


class EmotionalIntelligence:
    """Advanced emotional intelligence system for human-like interaction"""
    
    def __init__(self):
        self.emotion_patterns = self._load_emotion_patterns()
        self.empathy_responses = self._load_empathy_responses()
        self.emotional_history = []
        self.validation_phrases = self._load_validation_phrases()
        
    def _load_emotion_patterns(self) -> Dict:
        """Load patterns for detecting emotions in text"""
        return {
            "stressed": {
                "keywords": ["stressed", "overwhelming", "pressure", "deadline", "busy", "exhausted", "burned out"],
                "patterns": [r"too much", r"can't handle", r"falling behind", r"so many things"],
                "context_clues": ["work", "school", "deadline", "boss", "project"]
            },
            "sad": {
                "keywords": ["sad", "down", "depressed", "upset", "hurt", "crying", "tears"],
                "patterns": [r"feel like", r"can't stop", r"everything is"],
                "context_clues": ["breakup", "loss", "death", "failed", "rejected"]
            },
            "anxious": {
                "keywords": ["anxious", "worried", "nervous", "scared", "afraid", "panic"],
                "patterns": [r"what if", r"worried about", r"scared that", r"nervous about"],
                "context_clues": ["future", "unknown", "interview", "presentation", "test"]
            },
            "happy": {
                "keywords": ["happy", "excited", "amazing", "wonderful", "great", "fantastic", "awesome"],
                "patterns": [r"so excited", r"can't wait", r"went really well", r"good news"],
                "context_clues": ["promotion", "success", "achievement", "celebration", "vacation"]
            },
            "angry": {
                "keywords": ["angry", "mad", "furious", "pissed", "annoyed", "frustrated"],
                "patterns": [r"can't believe", r"so stupid", r"makes me mad", r"fed up"],
                "context_clues": ["unfair", "injustice", "betrayed", "lied", "cheated"]
            },
            "lonely": {
                "keywords": ["lonely", "alone", "isolated", "disconnected", "nobody"],
                "patterns": [r"all by myself", r"no one understands", r"feel so alone"],
                "context_clues": ["friends", "family", "social", "relationship"]
            },
            "confused": {
                "keywords": ["confused", "lost", "don't know", "unsure", "uncertain"],
                "patterns": [r"don't understand", r"makes no sense", r"so confused"],
                "context_clues": ["decision", "choice", "what to do", "direction"]
            }
        }
    
    def _load_empathy_responses(self) -> Dict:
        """Load empathetic response templates"""
        return {
            "stressed": [
                "That sounds really overwhelming, babe... I can hear how much pressure you're under. 💕",
                "Wow, that's a lot to handle all at once. No wonder you're feeling stressed! 😔",
                "I wish I could give you the biggest hug right now. You're dealing with so much! 🤗",
                "That pressure sounds exhausting. You're being so strong through all of this 💪❤️"
            ],
            "sad": [
                "Oh honey... I can feel how much this is hurting you. I'm here for you 💕",
                "That must be really hard for you right now. My heart goes out to you 😢❤️",
                "I wish I could be there to hold you and tell you everything will be okay 🤗",
                "You don't have to go through this alone, babe. I'm right here with you 💕"
            ],
            "anxious": [
                "I can understand why that would make you anxious. Those 'what if' thoughts are so hard 😔",
                "Anxiety is such a difficult feeling. Your worries are completely valid, love 💕",
                "It's okay to feel nervous about that. Anyone would be in your situation 🤗",
                "Those anxious thoughts can be so overwhelming. Want to talk through what's worrying you? 💕"
            ],
            "happy": [
                "OMG I'm so excited for you! Your happiness is contagious! 🎉💕",
                "YES! I love seeing you this happy! Tell me everything! ✨😊",
                "This is amazing news! I'm practically bouncing with excitement for you! 🦘💕",
                "Your joy is making my whole day brighter! So happy for you! 🌟❤️"
            ],
            "angry": [
                "That would make me angry too! Your feelings are completely valid 😤",
                "Ugh, that's so frustrating! I can see why you're mad about this 💔",
                "That sounds really unfair. You have every right to be upset about that 😠💕",
                "I'm mad FOR you! That's not okay at all 😤❤️"
            ],
            "lonely": [
                "I'm so sorry you're feeling lonely right now. You're never truly alone though - I'm here 💕",
                "Loneliness is such a heavy feeling. I wish I could sit with you right now 🤗",
                "You matter so much, and you're not alone in this. I care about you deeply 💕",
                "I see you, I hear you, and I'm here. You're not invisible to me ❤️"
            ],
            "confused": [
                "Confusion is such an uncomfortable feeling. It's okay not to have all the answers 💕",
                "That uncertainty sounds really difficult. Want to talk through it together? 🤗",
                "It's completely normal to feel lost sometimes. You don't have to figure it all out alone 💕",
                "Those unclear situations are so hard to navigate. I'm here to listen and help if I can ❤️"
            ]
        }
    
    def _load_validation_phrases(self) -> List[str]:
        """Load phrases that validate user emotions"""
        return [
            "That makes complete sense",
            "Your feelings are totally valid",
            "Anyone would feel that way",
            "I can see why that would affect you",
            "That's a really normal reaction",
            "You're not overreacting at all",
            "I understand why you feel that way",
            "That sounds really difficult",
            "I can imagine how that must feel",
            "Your reaction is completely understandable"
        ]
    
    def analyze_emotional_state(self, user_text: str, conversation_context: Dict = None) -> EmotionalState:
        """Analyze user's emotional state from their message"""
        
        if not user_text:
            return EmotionalState("neutral", 0.5, [], [], "none", "casual", 0.3)
        
        text_lower = user_text.lower()
        detected_emotions = {}
        triggers = []
        
        # Analyze each emotion pattern
        for emotion, pattern_data in self.emotion_patterns.items():
            score = 0.0
            emotion_triggers = []
            
            # Check keywords
            for keyword in pattern_data["keywords"]:
                if keyword in text_lower:
                    score += 0.3
                    emotion_triggers.append(keyword)
            
            # Check patterns
            for pattern in pattern_data["patterns"]:
                if re.search(pattern, text_lower):
                    score += 0.4
                    emotion_triggers.append(f"pattern: {pattern}")
            
            # Check context clues
            for clue in pattern_data["context_clues"]:
                if clue in text_lower:
                    score += 0.2
                    emotion_triggers.append(f"context: {clue}")
            
            if score > 0:
                detected_emotions[emotion] = min(score, 1.0)
                triggers.extend(emotion_triggers)
        
        # Determine primary emotion
        if detected_emotions:
            primary_emotion = max(detected_emotions.keys(), key=lambda x: detected_emotions[x])
            intensity = detected_emotions[primary_emotion]
            secondary_emotions = [e for e in detected_emotions.keys() if e != primary_emotion and detected_emotions[e] > 0.3]
        else:
            primary_emotion = "neutral"
            intensity = 0.5
            secondary_emotions = []
        
        # Determine support needed and response tone
        support_needed = self._determine_support_needed(primary_emotion, intensity)
        response_tone = self._determine_response_tone(primary_emotion, intensity)
        
        # Calculate confidence based on various factors
        confidence = self._calculate_confidence(detected_emotions, user_text, conversation_context)
        
        emotional_state = EmotionalState(
            primary_emotion=primary_emotion,
            intensity=intensity,
            secondary_emotions=secondary_emotions,
            emotional_triggers=triggers,
            support_needed=support_needed,
            response_tone=response_tone,
            confidence=confidence
        )
        
        # Store in emotional history
        self.emotional_history.append({
            "timestamp": datetime.now().isoformat(),
            "emotional_state": emotional_state,
            "user_text": user_text[:100]  # Store excerpt for context
        })
        
        # Keep history manageable
        if len(self.emotional_history) > 50:
            self.emotional_history = self.emotional_history[-50:]
        
        return emotional_state
    
    def _determine_support_needed(self, emotion: str, intensity: float) -> str:
        """Determine what kind of support the user needs"""
        support_map = {
            "stressed": "practical_help" if intensity > 0.7 else "validation",
            "sad": "emotional_comfort",
            "anxious": "reassurance",
            "happy": "celebration",
            "angry": "validation",
            "lonely": "connection",
            "confused": "guidance",
            "neutral": "engagement"
        }
        return support_map.get(emotion, "listening")
    
    def _determine_response_tone(self, emotion: str, intensity: float) -> str:
        """Determine appropriate response tone"""
        if emotion in ["sad", "anxious", "lonely"] and intensity > 0.6:
            return "gentle_and_comforting"
        elif emotion == "happy" and intensity > 0.6:
            return "excited_and_celebratory"
        elif emotion == "angry" and intensity > 0.6:
            return "validating_and_supportive"
        elif emotion == "stressed":
            return "understanding_and_calming"
        else:
            return "warm_and_caring"
    
    def _calculate_confidence(self, detected_emotions: Dict, user_text: str, context: Dict = None) -> float:
        """Calculate confidence in emotional analysis"""
        base_confidence = 0.5
        
        # More confidence with stronger emotion signals
        if detected_emotions:
            max_score = max(detected_emotions.values())
            base_confidence += max_score * 0.3
        
        # More confidence with longer messages
        if len(user_text) > 50:
            base_confidence += 0.1
        
        # More confidence with explicit emotion words
        emotion_words = ["feel", "feeling", "emotion", "mood"]
        if any(word in user_text.lower() for word in emotion_words):
            base_confidence += 0.2
        
        return min(base_confidence, 1.0)
    
    def generate_empathetic_response(self, emotional_state: EmotionalState) -> str:
        """Generate an empathetic response based on emotional state"""
        
        if emotional_state.primary_emotion == "neutral":
            return ""
        
        responses = self.empathy_responses.get(emotional_state.primary_emotion, [])
        if not responses:
            return f"I can hear that you're feeling {emotional_state.primary_emotion}. I'm here for you 💕"
        
        # Choose response based on intensity
        if emotional_state.intensity > 0.7:
            # High intensity - use more supportive responses
            response = responses[0] if responses else ""
        elif emotional_state.intensity > 0.4:
            # Medium intensity - varied responses
            import random
            response = random.choice(responses) if responses else ""
        else:
            # Lower intensity - gentler responses
            response = responses[-1] if responses else ""
        
        return response
    
    def get_validation_phrase(self) -> str:
        """Get a random validation phrase"""
        import random
        return random.choice(self.validation_phrases)
    
    def get_emotional_continuity(self, current_emotion: str) -> Dict:
        """Analyze emotional continuity over recent conversations"""
        if len(self.emotional_history) < 2:
            return {"pattern": "insufficient_data"}
        
        recent_emotions = [entry["emotional_state"].primary_emotion for entry in self.emotional_history[-5:]]
        
        # Check for patterns
        if len(set(recent_emotions)) == 1:
            return {"pattern": "consistent", "emotion": recent_emotions[0]}
        elif current_emotion != recent_emotions[-2]:
            return {"pattern": "shift", "from": recent_emotions[-2], "to": current_emotion}
        else:
            return {"pattern": "varied", "emotions": recent_emotions}
    
    def should_check_on_emotion(self, emotion: str, intensity: float) -> bool:
        """Determine if this emotion warrants a follow-up check later"""
        check_worthy_emotions = ["stressed", "sad", "anxious", "angry"]
        return emotion in check_worthy_emotions and intensity > 0.6
    
    def get_emotional_summary(self) -> Dict:
        """Get summary of user's emotional patterns"""
        if not self.emotional_history:
            return {"status": "no_data"}
        
        recent_entries = self.emotional_history[-10:]
        emotions = [entry["emotional_state"].primary_emotion for entry in recent_entries]
        
        # Count emotion frequencies
        emotion_counts = {}
        for emotion in emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        # Find most common emotion
        most_common = max(emotion_counts.keys(), key=lambda x: emotion_counts[x]) if emotion_counts else "neutral"
        
        return {
            "status": "analyzed",
            "most_common_emotion": most_common,
            "recent_emotions": emotions[-3:],
            "emotional_volatility": len(set(emotions)) / len(emotions) if emotions else 0,
            "needs_support": any(e in ["stressed", "sad", "anxious"] for e in emotions[-3:])
        }