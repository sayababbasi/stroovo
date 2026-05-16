import { Socket } from 'socket.io';

// Extended Socket interface with custom properties
export interface ExtendedSocket extends Socket {
  userId: string;
  userRole?: string;
  teamRoles?: Map<string, string>; // teamId -> role
}

// Socket event types
export interface SocketToServerEvents {
  'join-team': (teamId: string) => void;
  'leave-team': (teamId: string) => void;
  'join-space': (spaceId: string) => void;
  'leave-space': (spaceId: string) => void;
  'typing': ({ teamId, isTyping }: { teamId: string; isTyping: boolean }) => void;
  'task-created': ({ teamId, task }: { teamId: string; task: any }) => void;
  'task-updated': ({ teamId, task }: { teamId: string; task: any }) => void;
  'task-deleted': ({ teamId, taskId }: { teamId: string; taskId: string }) => void;
  'message-sent': ({ teamId, message }: { teamId: string; message: any }) => void;
  'message-edited': ({ teamId, messageId, newContent }: { teamId: string; messageId: string; newContent: string }) => void;
  'message-deleted': ({ teamId, messageId }: { teamId: string; messageId: string }) => void;
  'reaction-added': ({ teamId, messageId, reaction }: { teamId: string; messageId: string; reaction: any }) => void;
  'reaction-removed': ({ teamId, messageId, emoji }: { teamId: string; messageId: string; emoji: string }) => void;
  'team-updated': ({ teamId, data }: { teamId: string; data: any }) => void;
  'member-added': ({ teamId, member }: { teamId: string; member: any }) => void;
  'member-removed': ({ teamId, memberId }: { teamId: string; memberId: string }) => void;
  'member-role-changed': ({ teamId, memberId, newRole }: { teamId: string; memberId: string; newRole: string }) => void;
  'space-created': ({ teamId, space }: { teamId: string; space: any }) => void;
  'space-updated': ({ teamId, space }: { teamId: string; space: any }) => void;
  'space-deleted': ({ teamId, spaceId }: { teamId: string; spaceId: string }) => void;
  'list-created': ({ teamId, list }: { teamId: string; list: any }) => void;
  'list-updated': ({ teamId, list }: { teamId: string; list: any }) => void;
  'list-deleted': ({ teamId, listId }: { teamId: string; listId: string }) => void;
  'ai-insights-generated': ({ teamId, insights }: { teamId: string; insights: any }) => void;
  'workload-updated': ({ teamId, workloads }: { teamId: string; workloads: any }) => void;
  'risks-detected': ({ teamId, risks }: { teamId: string; risks: any }) => void;
}

export interface ServerToClientEvents {
  'TEAM_UPDATED': { teamId: string; data: any };
  'MEMBER_ADDED': { teamId: string; member: any };
  'MEMBER_REMOVED': { teamId: string; memberId: string };
  'MEMBER_ROLE_CHANGED': { teamId: string; memberId: string; newRole: string };
  'TASK_CREATED': { teamId: string; task: any };
  'TASK_UPDATED': { teamId: string; task: any };
  'TASK_DELETED': { teamId: string; taskId: string };
  'TASK_ASSIGNED': { teamId: string; taskId: string; assigneeId: string };
  'TASK_STATUS_CHANGED': { teamId: string; taskId: string; newStatus: string };
  'SPACE_CREATED': { teamId: string; space: any };
  'SPACE_UPDATED': { teamId: string; space: any };
  'SPACE_DELETED': { teamId: string; spaceId: string };
  'LIST_CREATED': { teamId: string; list: any };
  'LIST_UPDATED': { teamId: string; list: any };
  'LIST_DELETED': { teamId: string; listId: string };
  'MESSAGE_SENT': { teamId: string; message: any };
  'MESSAGE_EDITED': { teamId: string; messageId: string; newContent: string };
  'MESSAGE_DELETED': { teamId: string; messageId: string };
  'REACTION_ADDED': { teamId: string; messageId: string; reaction: any };
  'REACTION_REMOVED': { teamId: string; messageId: string; emoji: string; userId: string };
  'USER_ONLINE': { userId: string; teamId: string };
  'USER_OFFLINE': { userId: string; teamId: string };
  'USER_TYPING': { userId: string; teamId: string; isTyping: boolean };
  'AI_INSIGHTS_GENERATED': { teamId: string; insights: any };
  'WORKLOAD_UPDATED': { teamId: string; workloads: any };
  'RISKS_DETECTED': { teamId: string; risks: any };
}

export interface InterServerEvents {
  // Add any inter-server events if needed
}

export interface SocketData {
  userId: string;
  userRole?: string;
  teamRoles?: Map<string, string>;
}
