# Testing the New Chat Features

This guide helps you test the new real-time chat improvements and burst messaging system.

## 🚀 Quick Start

### 1. Start the Development Server
```bash
cd ai_gf/web
npm run dev
```

### 2. Navigate to Chat
- Go to `http://localhost:3000/chat`
- Sign in (or use development bypass if configured)
- You should see the new chat interface with Emma

## 🧪 Testing Features

### Real-Time Streaming Chat

#### Test Basic Streaming
1. **Send a message**: Type "Hello Emma!" and press Enter
2. **Observe behavior**:
   - Your message appears **immediately**
   - AI response streams word-by-word with realistic delays
   - Typing cursor blinks during streaming
   - Message completes smoothly

#### Test Multiple Messages
1. Send several messages in quick succession
2. **Expected**: Each user message appears immediately, AI responses queue and stream properly

#### Test Scrolling
1. Send enough messages to fill the chat window
2. **Expected**: Auto-scrolls to bottom smoothly
3. **Manual scroll**: Scroll up and send a message - should auto-scroll back down

### Burst Messaging System

#### Demo Burst (Development Only)
1. Look for the **"Demo"** button in the chat header
2. Click it to trigger a 3-message burst sequence
3. **Expected**: 
   - "Oh wait! I just remembered something..."
   - (2 second delay)
   - "I saw this really cute video of a puppy today! 🐶"
   - (2 second delay) 
   - "It reminded me of how adorable you are! 💕"

#### Smart Burst Testing
1. Click the **"Smart"** button to trigger intelligent burst checking
2. **Expected**: May send contextual messages based on:
   - Time since last interaction
   - Current relationship stage
   - User activity patterns

### Proactive Messaging

#### Manual Trigger
1. Click **"Get Surprise Message"** in the sidebar
2. **Expected**: Emma may send a proactive message if conditions are met

#### Time-Based Testing
1. Leave the chat idle for 10+ minutes
2. **Expected**: System should automatically check for proactive messages
3. **Note**: Adjust timing in `useStreamingChat.ts` for faster testing

### Error Handling

#### Credit Depletion
1. Use up all your credits (send messages until you hit 0)
2. **Expected**: 
   - Clear warning message
   - Input disabled
   - Redirect to pricing page option

#### Network Issues
1. Disable network connection mid-message
2. **Expected**:
   - Error message appears
   - Graceful failure with retry options
   - No broken UI states

## 🔍 What to Look For

### ✅ Good Behavior
- **Immediate user messages**: Your messages appear instantly
- **Smooth streaming**: AI responses flow naturally, word by word
- **Auto-scroll**: Always scrolls to show latest message
- **Visual feedback**: Clear typing indicators and loading states
- **Error recovery**: Graceful handling of failures

### ❌ Issues to Report
- **Delayed user messages**: User messages don't appear immediately
- **Choppy streaming**: AI responses appear all at once or inconsistently
- **Scroll problems**: Messages appear but don't auto-scroll
- **UI freezing**: Interface becomes unresponsive
- **Memory leaks**: Browser slowing down after extended use

## 🛠️ Development Testing

### Browser Console
Monitor for:
```javascript
// Good logs
"Successfully generated response using [provider] in [time]ms"
"Sending burst messages: [reason]"

// Error logs to investigate
"Stream error:" 
"Error parsing SSE data:"
"Provider [name] failed:"
```

### Network Tab
Check for:
- **SSE connections**: Look for event-stream responses
- **Proper streaming**: Should see data flowing in real-time
- **No hanging requests**: All requests should complete or stream properly

### Performance Testing
1. Send 50+ messages rapidly
2. **Expected**: 
   - No memory leaks
   - Smooth scrolling maintained
   - UI remains responsive

## 📱 Mobile Testing

### Responsive Design
1. Test on mobile device or resize browser window
2. **Expected**:
   - Chat interface adapts to small screens
   - Sidebar behavior changes appropriately
   - Touch interactions work smoothly

### Touch Interactions
1. Test touch scrolling in chat
2. Test virtual keyboard behavior
3. **Expected**: Smooth, native-like experience

## 🎯 Specific Test Cases

### Message Timing Test
```
1. Send: "Tell me about your day"
2. Immediately send: "What's your favorite color?"
3. Expected: Both user messages appear immediately, AI processes in order
```

### Burst Sequence Test
```
1. Click "Demo" burst button
2. While burst is playing, send a regular message
3. Expected: Burst completes, then regular message processes
```

### Credit Boundary Test
```
1. Get down to exactly 1 credit
2. Send a message
3. Expected: Message sends, credit goes to 0, interface updates
4. Try to send another message
5. Expected: Blocked with clear error message
```

### Long Message Test
```
1. Send a very long message (near 500 character limit)
2. Expected: Streams properly, UI handles long content gracefully
```

## 🐛 Common Issues & Solutions

### Streaming Not Working
- **Check**: Browser DevTools Network tab for SSE connection
- **Solution**: Ensure `/api/chat/stream` endpoint is accessible
- **Fallback**: Check if error messages appear in console

### Messages Appearing Twice
- **Cause**: Race condition between optimistic updates and server response
- **Check**: Look for duplicate message IDs in React DevTools

### Auto-scroll Broken
- **Check**: Ensure `messagesEndRef` is properly attached
- **Solution**: Verify `scrollIntoView` is being called

### Burst Messages Not Sending
- **Check**: User relationship stage (must not be "stranger")
- **Check**: Time since last interaction requirements
- **Solution**: Adjust timing thresholds for testing

## 📊 Performance Benchmarks

### Expected Performance
- **Message send to display**: < 50ms
- **AI response start**: < 2 seconds
- **Streaming word rate**: 8-12 words per second
- **Auto-scroll delay**: < 100ms
- **Memory usage**: Stable over 100+ messages

### Load Testing
1. Open multiple chat tabs
2. Send messages from each simultaneously
3. **Expected**: All perform well, no interference

## 🔄 Testing Checklist

- [ ] User messages appear immediately
- [ ] AI responses stream word-by-word
- [ ] Auto-scroll works consistently  
- [ ] Typing indicators show during AI thinking
- [ ] Burst messaging works via demo button
- [ ] Smart burst responds to user activity
- [ ] Proactive messages trigger appropriately
- [ ] Error handling is graceful
- [ ] Credit system integrates smoothly
- [ ] Mobile responsive design works
- [ ] Performance remains good with many messages
- [ ] Browser console shows no critical errors

## 🆘 Getting Help

### Debug Info to Collect
When reporting issues, include:
1. Browser and version
2. Console error messages
3. Network tab showing failed requests
4. Steps to reproduce
5. Expected vs actual behavior

### Key Files to Check
- `src/hooks/useStreamingChat.ts` - Main chat logic
- `src/app/api/chat/stream/route.ts` - Streaming endpoint
- `src/app/chat/page.tsx` - Chat UI component
- `src/app/api/chat/burst/route.ts` - Burst messaging

This comprehensive testing approach ensures the new chat system works smoothly and provides the intended real-time conversational experience.