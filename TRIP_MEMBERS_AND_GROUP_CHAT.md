# Trip Members & Group Chat Implementation

## Overview

This implementation adds the ability for users to:
1. **View all members** in their trip plan
2. **Join a group chat** with all trip members for communication
3. **Manage group conversations** for trip coordination

## New Components & Services

### 1. PlanMembers Component (`src/components/PlanMembers.vue`)

Displays all trip members and provides options to join/open group chat.

**Props:**
- `members`: Array of member objects with `id`, `name`, `email`, and optional `avatar_url`
- `tripId`: The ID of the current trip
- `creatorId`: The ID of the trip creator (to identify the creator badge)

**Events:**
- `@joined-chat`: Fired when user joins the group chat
- `@open-chat`: Fired when user wants to open an existing group chat

**Features:**
- Displays member avatars with initials
- Shows member names and emails
- Identifies trip creator with a badge
- Shows online/offline status indicators
- Join button for group chat
- Open button if already in group chat

### 2. Group Chat Service (`src/services/group-chat.service.ts`)

Handles all backend API interactions for group chats.

**Main Functions:**

```typescript
// Create a new group chat for a trip
createGroupChat(tripId: string, members: GroupChatMember[]): Promise<GroupChat>

// Get or create a group chat for a specific trip
getOrCreateGroupChat(tripId: string): Promise<GroupChat>

// Get a specific group chat
getGroupChat(chatId: string): Promise<GroupChat>

// Get all group chats for current user
getUserGroupChats(): Promise<GroupChat[]>

// Fetch messages from a group chat
getGroupChatMessages(chatId: string, limit?: number, offset?: number): Promise<GroupChatMessage[]>

// Send a message to group chat
sendGroupMessage(chatId: string, text: string, imageUrl?: string): Promise<GroupChatMessage>

// Join/Leave group chat
joinGroupChat(chatId: string): Promise<GroupChat>
leaveGroupChat(chatId: string): Promise<void>

// Manage members
addGroupChatMember(chatId: string, userId: string): Promise<GroupChat>
removeGroupChatMember(chatId: string, userId: string): Promise<void>

// Message management
markGroupMessageAsSeen(chatId: string, messageId: string): Promise<void>
deleteGroupMessage(chatId: string, messageId: string): Promise<void>

// Update group chat info
updateGroupChat(chatId: string, data: Partial<{ name: string; description: string }>): Promise<GroupChat>
```

### 3. useGroupChat Composable (`src/composables/useGroupChat.ts`)

Vue composable for managing group chat state and operations.

**State:**
- `groupChats`: List of all user's group chats
- `currentChat`: The currently selected group chat
- `messages`: Messages in the current chat
- `isLoading`: Loading state
- `isLoadingMessages`: Message loading state
- `error`: Error messages
- `isTyping`: Typing indicator state
- `currentUserId`: Current user's ID

**Methods:**
- `fetchGroupChats()`: Fetch all group chats
- `getOrCreateChatForTrip(tripId)`: Get or create chat for a trip
- `createChat(tripId, members)`: Create new group chat
- `selectChat(chat)`: Select a chat and load messages
- `fetchMessages(limit, offset)`: Fetch chat messages
- `sendMessage(text, imageUrl)`: Send a message
- `joinChat(chatId)`: Join a group chat
- `leaveChat(chatId)`: Leave a group chat
- `addMember(userId)`: Add member to chat
- `removeMember(userId)`: Remove member from chat
- `markMessageAsSeen(messageId)`: Mark message as seen
- `deleteMessage(messageId)`: Delete a message

## Integration with TripResultsView

The group chat functionality is integrated into `src/views/TripResultsView.vue`:

1. **Display Members**: The PlanMembers component displays in the sidebar
2. **Join Chat**: Users can click "Join Group Chat" to create/join the trip's group
3. **Navigate to Chat**: Clicking "Open Group Chat" navigates to ChatView

### Code in TripResultsView:

```vue
<PlanMembers 
  v-if="tripData?.members && tripData.members.length > 0"
  :members="formattedMembers"
  :tripId="tripId"
  :creatorId="tripData?.owner_id || ''"
  @joined-chat="handleJoinedGroupChat"
  @open-chat="handleOpenGroupChat"
/>
```

## Backend API Requirements

The implementation expects the following backend endpoints:

### Group Chat Endpoints

```
POST   /group-chats                           - Create new group chat
POST   /group-chats/trip/:tripId              - Get or create chat for trip
GET    /group-chats                           - Get all user's group chats
GET    /group-chats/:chatId                   - Get specific group chat
GET    /group-chats/:chatId/messages          - Get messages (query: limit, offset)
POST   /group-chats/:chatId/messages          - Send message
POST   /group-chats/:chatId/join              - Join group chat
POST   /group-chats/:chatId/leave             - Leave group chat
POST   /group-chats/:chatId/members           - Add member (body: user_id)
DELETE /group-chats/:chatId/members/:userId   - Remove member
PUT    /group-chats/:chatId/messages/:msgId/seen   - Mark as seen
DELETE /group-chats/:chatId/messages/:msgId        - Delete message
PUT    /group-chats/:chatId                   - Update group chat info
```

### Trip Endpoints (Already Existing)

```
GET    /api/trips/:tripId                     - Get trip details (includes members)
POST   /api/trips                             - Create new trip
PUT    /api/trips/:tripId/itinerary           - Update trip itinerary
```

### Expected Trip Data Structure

```json
{
  "id": "trip-123",
  "title": "Cambodia Adventure",
  "origin": "phnom-penh",
  "destination": "siem-reap",
  "start_date": "2024-01-15",
  "end_date": "2024-01-20",
  "travel_type": "friends",
  "owner_id": "user-456",
  "members": [
    {
      "id": "member-1",
      "user_id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar_url": "https://...",
      "role": "creator"
    },
    {
      "id": "member-2",
      "user_id": "user-456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatar_url": "https://...",
      "role": "member"
    }
  ],
  "itinerary_items": [...],
  "packing_list": [...]
}
```

### Expected Group Chat Data Structure

```json
{
  "id": "chat-789",
  "name": "Cambodia Adventure Group",
  "description": "Group chat for trip to Cambodia",
  "trip_id": "trip-123",
  "creator_id": "user-123",
  "members": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar_url": "https://..."
    },
    {
      "id": "user-456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatar_url": "https://..."
    }
  ],
  "created_at": "2024-01-10T10:00:00Z",
  "updated_at": "2024-01-10T10:00:00Z"
}
```

## Usage Example

### In a Vue Component

```typescript
import { useGroupChat } from '@/composables/useGroupChat'

export default {
  setup() {
    const { 
      currentChat, 
      messages, 
      getOrCreateChatForTrip,
      sendMessage,
      fetchMessages 
    } = useGroupChat()

    const handleJoinTrip = async (tripId: string) => {
      const chat = await getOrCreateChatForTrip(tripId)
      if (chat) {
        await fetchMessages()
      }
    }

    const handleSendMessage = async (text: string) => {
      const message = await sendMessage(text)
      if (message) {
        console.log('Message sent:', message)
      }
    }

    return {
      currentChat,
      messages,
      handleJoinTrip,
      handleSendMessage
    }
  }
}
```

## Features

### Member Display
- ✅ Shows all trip members with avatars
- ✅ Displays member names and emails
- ✅ Identifies trip creator
- ✅ Online/offline status indicators
- ✅ Scrollable member list

### Group Chat
- ✅ Create/join group chat for trip
- ✅ Send text messages
- ✅ Send image messages
- ✅ Mark messages as seen
- ✅ Delete messages
- ✅ Add/remove members
- ✅ View member list in chat
- ✅ Message history
- ✅ Typing indicators

### User Experience
- ✅ Toast notifications for actions
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Mobile-friendly interface

## Styling

All components use:
- **Tailwind CSS** for utilities
- **Scoped styles** for component-specific styling
- **Color scheme**: Green (#166534 primary), with accent colors
- **Consistent spacing**: 4px, 8px, 12px, 16px increments
- **Shadows**: Subtle box-shadows for depth
- **Animations**: Smooth transitions and spin animations

## Error Handling

The implementation includes:
- Try-catch blocks for API calls
- Graceful fallbacks
- User-friendly error messages
- Automatic retry logic (where appropriate)
- Loading states during operations

## Future Enhancements

Possible improvements:
1. **Real-time messaging** using WebSockets
2. **Message reactions** (emojis)
3. **Message editing** after sending
4. **Message search** functionality
5. **Pinned messages** for important info
6. **Message threads/replies**
7. **File sharing** (documents, images, etc.)
8. **Voice messages**
9. **Group chat notifications**
10. **Message encryption** for privacy

## Testing

To test the implementation:

1. **Create a trip** with multiple members
2. **View the trip** in TripResultsView
3. **See the members panel** in the sidebar
4. **Click "Join Group Chat"** to create/join
5. **Navigate to ChatView** to see the group
6. **Send messages** to group members

## Troubleshooting

### Members not showing
- Check if trip data is loaded (`tripData.value?.members`)
- Verify members have proper structure with `id`, `name`, `email`

### Chat not creating
- Ensure trip has been saved (has `tripId`)
- Check backend endpoints are properly implemented
- Verify authentication token is valid

### Messages not sending
- Check network connection
- Verify group chat API endpoints
- Check authorization headers
- Review browser console for errors

## API Integration

Ensure your backend has these endpoints properly implemented:

1. **Trip Members Fetch**: Already existing
2. **Group Chat Creation**: New endpoint
3. **Group Chat Messages**: New endpoints
4. **Member Management**: New endpoints

The service layer handles all API communication, so you only need to ensure your backend responds correctly to the documented endpoint structure.
