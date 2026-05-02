# Team Workspace Engine Documentation

## Overview

The Team Workspace Engine is an enterprise-level, real-time collaborative workspace system that provides functionality comparable to ClickUp with enhanced AI capabilities. It supports dynamic team management, hierarchical spaces and lists, real-time task collaboration, and role-based access control.

## Architecture

### Database Schema

The system uses PostgreSQL with the following core models:

#### Team
- `id`: Unique identifier
- `name`: Team name
- `slug`: URL-friendly slug
- `description`: Team description
- `avatar`: Team avatar URL
- `tenantId`: Tenant (organization) ID
- `createdBy`: User who created the team
- `autoMode`: Auto-execution mode setting
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### TeamMember
- `id`: Unique identifier
- `teamId`: Reference to Team
- `userId`: Reference to User
- `role`: Role (ADMIN, MANAGER, MEMBER, VIEWER)
- `joinedAt`: When member joined

#### TeamSpace
- `id`: Unique identifier
- `teamId`: Reference to Team
- `name`: Space name
- `icon`: Emoji or icon name
- `color`: Hex color code
- `description`: Space description
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### TeamList
- `id`: Unique identifier
- `spaceId`: Reference to TeamSpace
- `name`: List name
- `type`: List type (TASKS, DOCS, ASSETS)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

#### Task (Extended)
- `teamId`: Reference to Team
- `spaceId`: Reference to TeamSpace
- `listId`: Reference to TeamList
- Multi-assignee support via TaskAssignment
- Dependencies via taskDependencies relation

#### TeamMessage
- `id`: Unique identifier
- `teamId`: Reference to Team
- `userId`: Reference to User
- `content`: Message content
- `type`: Message type (TEXT, FILE, EMOJI)
- `threadId`: Thread identifier
- `replyToId`: Reply-to message reference
- `createdAt`: Creation timestamp

### Role-Based Access Control (RBAC)

#### Team Roles
- **ADMIN**: Full access to all team resources
- **MANAGER**: Can manage spaces, lists, tasks, and members
- **MEMBER**: Can create and edit tasks, view team resources
- **VIEWER**: Read-only access to team resources

#### Permissions
Permissions are defined in `src/lib/rbac.ts`:
- Team permissions: CREATE_TEAM, DELETE_TEAM, MANAGE_TEAM, VIEW_TEAM, INVITE_MEMBERS, REMOVE_MEMBERS, MANAGE_ROLES
- Space permissions: CREATE_SPACE, DELETE_SPACE, MANAGE_SPACE, VIEW_SPACE
- List permissions: CREATE_LIST, DELETE_LIST, MANAGE_LIST, VIEW_LIST
- Task permissions: CREATE_TASK, DELETE_TASK, EDIT_TASK, ASSIGN_TASK, VIEW_TASK, COMPLETE_TASK
- Chat permissions: SEND_MESSAGE, EDIT_MESSAGE, DELETE_MESSAGE, VIEW_CHAT
- AI permissions: USE_AI_INSIGHTS, GENERATE_AI_SUGGESTIONS, VIEW_AI_ANALYTICS

## API Endpoints

### Teams

#### GET /api/teams
Get all teams for the current tenant.

**Query Parameters:**
- `include`: Comma-separated list of relations to include (spaces, lists)

**Response:**
```json
[
  {
    "id": "team-1",
    "name": "Engineering",
    "description": "Engineering Team",
    "members": [...],
    "spaces": [...],
    "_count": {
      "members": 5,
      "tasks": 20,
      "spaces": 3
    }
  }
]
```

#### POST /api/teams
Create a new team.

**Body:**
```json
{
  "name": "Engineering",
  "description": "Engineering Team"
}
```

#### GET /api/teams/[id]
Get a specific team with full details.

#### PUT /api/teams/[id]
Update team details.

#### DELETE /api/teams/[id]
Delete a team.

### Team Members

#### GET /api/teams/[id]/members
Get all members of a team with workload statistics.

**Response:**
```json
[
  {
    "id": "member-1",
    "user": {...},
    "role": "ADMIN",
    "activeTasks": 5,
    "completedTasks": 20,
    "totalTasks": 25,
    "completionRate": 80
  }
]
```

#### POST /api/teams/[id]/members
Add a member to the team.

**Body:**
```json
{
  "userId": "user-1",
  "role": "MEMBER"
}
```

#### PATCH /api/teams/[id]/members
Update member role.

**Body:**
```json
{
  "userId": "user-1",
  "role": "MANAGER"
}
```

#### DELETE /api/teams/[id]/members/[userId]
Remove a member from the team.

### Team Spaces

#### GET /api/team-spaces
Get all spaces for a team.

**Query Parameters:**
- `teamId`: Team ID (required)

#### POST /api/team-spaces
Create a new space.

**Body:**
```json
{
  "teamId": "team-1",
  "name": "Development",
  "icon": "🚀",
  "color": "#0052CC",
  "description": "Development workspace"
}
```

#### GET /api/team-spaces/[id]
Get a specific space.

#### PUT /api/team-spaces/[id]
Update space details.

#### DELETE /api/team-spaces/[id]
Delete a space.

### Team Lists

#### GET /api/team-lists
Get all lists for a space.

**Query Parameters:**
- `spaceId`: Space ID (required)

#### POST /api/team-lists
Create a new list.

**Body:**
```json
{
  "spaceId": "space-1",
  "name": "Backlog",
  "type": "TASKS"
}
```

#### GET /api/team-lists/[id]
Get a specific list.

#### PUT /api/team-lists/[id]
Update list details.

#### DELETE /api/team-lists/[id]
Delete a list.

### Team Tasks

#### GET /api/team-tasks
Get tasks for a team/space/list.

**Query Parameters:**
- `teamId`: Team ID
- `spaceId`: Space ID (optional)
- `listId`: List ID (optional)
- `status`: Filter by status (optional)
- `assigneeId`: Filter by assignee (optional)

**Response:**
```json
[
  {
    "id": "task-1",
    "title": "Implement authentication",
    "description": "...",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "assignee": {...},
    "team": {...},
    "space": {...},
    "list": {...},
    "subtasks": [...],
    "comments": [...]
  }
]
```

#### POST /api/team-tasks
Create a new task.

**Body:**
```json
{
  "title": "Implement authentication",
  "description": "Add OAuth2 authentication",
  "status": "TODO",
  "priority": "HIGH",
  "teamId": "team-1",
  "spaceId": "space-1",
  "listId": "list-1",
  "assigneeId": "user-1"
}
```

### Team Messages

#### GET /api/team-messages
Get messages for a team.

**Query Parameters:**
- `teamId`: Team ID (required)
- `threadId`: Thread ID (optional)
- `limit`: Number of messages to return (default: 50)
- `offset`: Offset for pagination (default: 0)

**Response:**
```json
[
  {
    "id": "msg-1",
    "teamId": "team-1",
    "userId": "user-1",
    "content": "Hello team!",
    "type": "TEXT",
    "user": {...},
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/team-messages
Send a message.

**Body:**
```json
{
  "teamId": "team-1",
  "userId": "user-1",
  "content": "Hello team!",
  "type": "TEXT"
}
```

## Real-Time WebSocket Events

The system uses Socket.IO for real-time updates. Connect to `/api/socket`.

### Events

#### Client → Server
- `join-team`: Join a team room
- `leave-team`: Leave a team room
- `join-space`: Join a space room
- `leave-space`: Leave a space room
- `typing`: Broadcast typing status

#### Server → Client
- `TEAM_UPDATED`: Team details updated
- `MEMBER_ADDED`: New member added to team
- `MEMBER_REMOVED`: Member removed from team
- `MEMBER_ROLE_CHANGED`: Member role changed
- `TASK_CREATED`: New task created
- `TASK_UPDATED`: Task updated
- `TASK_DELETED`: Task deleted
- `TASK_ASSIGNED`: Task assigned to user
- `TASK_STATUS_CHANGED`: Task status changed
- `SPACE_CREATED`: New space created
- `SPACE_UPDATED`: Space updated
- `SPACE_DELETED`: Space deleted
- `LIST_CREATED`: New list created
- `LIST_UPDATED`: List updated
- `LIST_DELETED`: List deleted
- `MESSAGE_SENT`: New message sent
- `USER_ONLINE`: User came online
- `USER_OFFLINE`: User went offline
- `USER_TYPING`: User typing indicator

### Usage Example

```typescript
import { socketService } from '@/lib/socket';

// Connect and join team
socketService.connect();
socketService.joinTeam('team-1');

// Listen for events
socketService.onTaskCreated((data) => {
  console.log('New task:', data.task);
});

socketService.onMessageSent((data) => {
  console.log('New message:', data.message);
});

// Clean up
socketService.offTaskCreated(handler);
socketService.leaveTeam('team-1');
```

## Frontend Components

### TeamSidebar
Hierarchical navigation for teams, spaces, and lists.

**Props:**
- `selectedTeamId`: Currently selected team
- `selectedSpaceId`: Currently selected space
- `selectedListId`: Currently selected list
- `onTeamSelect`: Callback when team selected
- `onSpaceSelect`: Callback when space selected
- `onListSelect`: Callback when list selected
- `onCreateTeam`: Callback to create new team
- `onCreateSpace`: Callback to create new space
- `onCreateList`: Callback to create new list

### TeamWorkspace
Main workspace with tabs for chat, tasks, schedule, and Gantt chart.

**Props:**
- `team`: Team object
- `selectedSpaceId`: Currently selected space
- `selectedListId`: Currently selected list
- `onTaskCreate`: Callback to create task
- `onTaskEdit`: Callback to edit task

### TeamManagement
Team member management with role-based permissions.

**Props:**
- `team`: Team object
- `currentUserRole`: Current user's role
- `onMemberInvite`: Callback to invite member
- `onMemberRemove`: Callback to remove member
- `onMemberRoleChange`: Callback to change member role
- `onMemberTransfer`: Callback to transfer ownership

## Backend Services

### TeamService
Core team business logic located at `src/lib/teams/team-service.ts`.

**Methods:**
- `createTeam(data, userId, tenantId)`: Create new team
- `getTeams(tenantId, include?)`: Get all teams
- `getTeamById(teamId, tenantId)`: Get specific team
- `updateTeam(teamId, data, userId, tenantId)`: Update team
- `deleteTeam(teamId, userId, tenantId)`: Delete team
- `getMembers(teamId, tenantId)`: Get team members with stats
- `addMember(teamId, userId, role, requestingUserId, tenantId)`: Add member
- `updateMemberRole(teamId, userId, role, requestingUserId, tenantId)`: Update role
- `removeMember(teamId, memberId, requestingUserId, tenantId)`: Remove member

### Assignment Service
Task assignment logic at `src/lib/teams/assignment-service.ts`.

### Automation Service
Team automation at `src/lib/teams/automation-service.ts`.

### Workload Engine
Workload balancing at `src/lib/teams/workload-engine.ts`.

## Features

### 1. Dynamic Team Management
- Create, update, delete teams
- Hierarchical spaces and lists
- Real-time member management
- Role-based permissions

### 2. Task Management
- Create, edit, delete tasks
- Multi-assignee support
- Task dependencies
- Status and priority tracking
- Subtasks and comments
- File attachments

### 3. Real-Time Collaboration
- WebSocket-based real-time updates
- Team chat with threads
- Typing indicators
- Online/offline status

### 4. Views and Filtering
- Multiple task views (List, Board, Gantt)
- Filter by status, priority, assignee
- Group by status, priority, or assignee
- Search functionality

### 5. AI Integration (Future)
- Auto task breakdown
- Smart priority suggestions
- Team productivity insights
- Workload balancing
- Duplicate task detection

## Development Setup

1. Ensure PostgreSQL database is running
2. Run Prisma migrations: `npx prisma migrate dev`
3. Start development server: `npm run dev`
4. Navigate to `/teams` to access the team workspace

## Testing

### Manual Testing Checklist

- [ ] Create a new team
- [ ] Add members to team
- [ ] Change member roles
- [ ] Create spaces within team
- [ ] Create lists within spaces
- [ ] Create tasks in lists
- [ ] Assign tasks to members
- [ ] Update task status
- [ ] Send team messages
- [ ] Verify real-time updates
- [ ] Test RBAC permissions
- [ ] Verify sidebar navigation
- [ ] Test empty states

## Performance Optimization

1. **Caching**: Teams data cached with include parameter
2. **Debouncing**: Search inputs debounced
3. **Lazy Loading**: Team data loaded on demand
4. **WebSocket**: Real-time updates reduce polling
5. **Pagination**: Messages and tasks paginated

## Security Considerations

1. **RBAC**: All API endpoints check permissions
2. **Tenant Isolation**: Data scoped by tenantId
3. **Input Validation**: Zod schemas validate all inputs
4. **SQL Injection**: Prisma ORM prevents SQL injection
5. **XSS**: React escapes user input by default

## Future Enhancements

1. **AI Auto Team Manager**: Suggest actions based on team patterns
2. **Smart Notifications**: Priority-based notification system
3. **Activity Timeline**: GitHub-style activity feed
4. **Drag & Drop**: Drag-and-drop task assignment
5. **Voice-to-Task**: Voice input for task creation
6. **Calendar Integration**: Full calendar view with deadlines
7. **Time Tracking**: Built-in time tracking for tasks
8. **Custom Fields**: User-defined custom task fields
9. **Templates**: Team and task templates
10. **Integrations**: Third-party service integrations

## Troubleshooting

### Tasks not loading
- Check `/api/team-tasks` endpoint
- Verify teamId, spaceId, listId parameters
- Check browser console for errors

### Members not showing
- Check `/api/teams/[id]/members` endpoint
- Verify user has proper permissions
- Check member status in database

### Real-time updates not working
- Verify WebSocket server is running
- Check socket connection in browser dev tools
- Ensure teamId matches when joining rooms

### UI layout issues
- Check for CSS conflicts
- Verify sidebar width calculations
- Ensure proper flexbox usage

## Support

For issues or questions, refer to:
- Main documentation: `AI_SYSTEM_DOCUMENTATION.md`
- Revert instructions: `HOW_TO_REVERT.md`
- Development report: `docs/development_report.md`
