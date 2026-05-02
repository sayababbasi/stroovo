import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: TeamMember[];
  spaces: TeamSpace[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
}

export interface TeamSpace {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  lists: TeamList[];
}

export interface TeamList {
  id: string;
  name: string;
  type: 'TASKS' | 'DOCS' | 'ASSETS';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    image?: string;
  };
  teamId?: string;
  spaceId?: string;
  listId?: string;
  dueDate?: string;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamStore {
  // State
  teams: Team[];
  currentTeam: Team | null;
  currentSpaceId: string | null;
  currentListId: string | null;
  tasks: Task[];
  members: TeamMember[];
  loading: boolean;
  error: string | null;

  // Actions - Teams
  setTeams: (teams: Team[]) => void;
  setCurrentTeam: (team: Team | null) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;

  // Actions - Spaces
  setCurrentSpaceId: (spaceId: string | null) => void;
  setCurrentListId: (listId: string | null) => void;

  // Actions - Tasks
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;

  // Actions - Members
  setMembers: (members: TeamMember[]) => void;
  addMember: (member: TeamMember) => void;
  updateMember: (memberId: string, updates: Partial<TeamMember>) => void;
  removeMember: (memberId: string) => void;

  // Actions - UI State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  teams: [],
  currentTeam: null,
  currentSpaceId: null,
  currentListId: null,
  tasks: [],
  members: [],
  loading: false,
  error: null,
};

export const useTeamStore = create<TeamStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Teams
        setTeams: (teams) => set({ teams }),
        setCurrentTeam: (team) => set({ currentTeam: team }),
        addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
        updateTeam: (teamId, updates) =>
          set((state) => ({
            teams: state.teams.map((team) =>
              team.id === teamId ? { ...team, ...updates } : team
            ),
            currentTeam:
              state.currentTeam?.id === teamId
                ? { ...state.currentTeam, ...updates }
                : state.currentTeam,
          })),
        removeTeam: (teamId) =>
          set((state) => ({
            teams: state.teams.filter((team) => team.id !== teamId),
            currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam,
          })),

        // Spaces
        setCurrentSpaceId: (spaceId) => set({ currentSpaceId: spaceId }),
        setCurrentListId: (listId) => set({ currentListId: listId }),

        // Tasks
        setTasks: (tasks) => set({ tasks }),
        addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
        updateTask: (taskId, updates) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          })),
        removeTask: (taskId) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
          })),

        // Members
        setMembers: (members) => set({ members }),
        addMember: (member) => set((state) => ({ members: [...state.members, member] })),
        updateMember: (memberId, updates) =>
          set((state) => ({
            members: state.members.map((member) =>
              member.id === memberId ? { ...member, ...updates } : member
            ),
          })),
        removeMember: (memberId) =>
          set((state) => ({
            members: state.members.filter((member) => member.id !== memberId),
          })),

        // UI State
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'team-store',
        partialize: (state) => ({
          currentTeam: state.currentTeam,
          currentSpaceId: state.currentSpaceId,
          currentListId: state.currentListId,
        }),
      }
    )
  )
);
