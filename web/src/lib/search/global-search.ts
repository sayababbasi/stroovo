// Global search functionality for teams

export interface SearchResult {
  id: string;
  type: 'task' | 'user' | 'team' | 'space' | 'list' | 'message' | 'file';
  title: string;
  description?: string;
  url: string;
  metadata: Record<string, any>;
  relevanceScore: number;
  highlights: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  type?: string[];
  teamId?: string;
  spaceId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  author?: string;
  status?: string[];
  priority?: string[];
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

class GlobalSearchEngine {
  private searchIndex: Map<string, SearchResult> = new Map();

  // Build search index from all team data
  async buildSearchIndex(teamId: string): Promise<void> {
    try {
      // Fetch all searchable content for the team
      const [tasks, users, teams, spaces, lists, messages, files] = await Promise.all([
        this.fetchTasks(teamId),
        this.fetchUsers(teamId),
        this.fetchTeams(teamId),
        this.fetchSpaces(teamId),
        this.fetchLists(teamId),
        this.fetchMessages(teamId),
        this.fetchFiles(teamId)
      ]);

      // Clear existing index
      this.searchIndex.clear();

      // Index tasks
      tasks.forEach(task => {
        const result: SearchResult = {
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          description: task.description,
          url: `/teams/${teamId}/tasks/${task.id}`,
          metadata: {
            status: task.status,
            priority: task.priority,
            assignee: task.assignee,
            dueDate: task.dueDate,
            tags: task.tags,
            spaceId: task.spaceId,
            listId: task.listId
          },
          relevanceScore: 0,
          highlights: [],
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        };
        this.searchIndex.set(result.id, result);
      });

      // Index users
      users.forEach(user => {
        const result: SearchResult = {
          id: `user-${user.id}`,
          type: 'user',
          title: user.name,
          description: user.email,
          url: `/users/${user.id}`,
          metadata: {
            role: user.role,
            department: user.department,
            skills: user.skills
          },
          relevanceScore: 0,
          highlights: [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        this.searchIndex.set(result.id, result);
      });

      // Index teams
      teams.forEach(team => {
        const result: SearchResult = {
          id: `team-${team.id}`,
          type: 'team',
          title: team.name,
          description: team.description,
          url: `/teams/${team.id}`,
          metadata: {
            memberCount: team.memberCount,
            createdAt: team.createdAt
          },
          relevanceScore: 0,
          highlights: [],
          createdAt: team.createdAt,
          updatedAt: team.updatedAt
        };
        this.searchIndex.set(result.id, result);
      });

      // Index spaces
      spaces.forEach(space => {
        const result: SearchResult = {
          id: `space-${space.id}`,
          type: 'space',
          title: space.name,
          description: space.description,
          url: `/teams/${teamId}/spaces/${space.id}`,
          metadata: {
            icon: space.icon,
            color: space.color,
            listCount: space.listCount
          },
          relevanceScore: 0,
          highlights: [],
          createdAt: space.createdAt,
          updatedAt: space.updatedAt
        };
        this.searchIndex.set(result.id, result);
      });

      // Index lists
      lists.forEach(list => {
        const result: SearchResult = {
          id: `list-${list.id}`,
          type: 'list',
          title: list.name,
          description: list.description,
          url: `/teams/${teamId}/lists/${list.id}`,
          metadata: {
            type: list.type,
            taskCount: list.taskCount,
            spaceId: list.spaceId
          },
          relevanceScore: 0,
          highlights: [],
          createdAt: list.createdAt,
          updatedAt: list.updatedAt
        };
        this.searchIndex.set(result.id, result);
      });

      // Index messages
      messages.forEach(message => {
        const result: SearchResult = {
          id: `message-${message.id}`,
          type: 'message',
          title: `Message from ${message.sender.name}`,
          description: message.content,
          url: `/teams/${teamId}/chat?message=${message.id}`,
          metadata: {
            senderId: message.sender.id,
            channelId: message.channelId,
            reactions: message.reactions
          },
          relevanceScore: 0,
          highlights: [],
          createdAt: message.createdAt,
          updatedAt: message.createdAt
        };
        this.searchIndex.set(result.id, result);
      });

      // Index files
      files.forEach(file => {
        const result: SearchResult = {
          id: `file-${file.id}`,
          type: 'file',
          title: file.name,
          description: file.description,
          url: `/teams/${teamId}/files/${file.id}`,
          metadata: {
            fileType: file.fileType,
            size: file.size,
            uploadedBy: file.uploadedBy,
            tags: file.tags
          },
          relevanceScore: 0,
          highlights: [],
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        };
        this.searchIndex.set(result.id, result);
      });

    } catch (error) {
      console.error('Error building search index:', error);
      throw new Error('Failed to build search index');
    }
  }

  // Perform global search
  async search(options: SearchOptions): Promise<{ results: SearchResult[]; total: number }> {
    const { query, filters = {}, limit = 20, offset = 0, sortBy = 'relevance', sortOrder = 'desc' } = options;

    try {
      // Get all searchable items
      let results = Array.from(this.searchIndex.values());

      // Apply filters
      if (filters.type && filters.type.length > 0) {
        results = results.filter(result => filters.type!.includes(result.type));
      }

      if (filters.teamId) {
        results = results.filter(result => result.metadata.teamId === filters.teamId);
      }

      if (filters.spaceId) {
        results = results.filter(result => result.metadata.spaceId === filters.spaceId);
      }

      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        results = results.filter(result => {
          const resultDate = new Date(result.createdAt);
          return resultDate >= start && resultDate <= end;
        });
      }

      if (filters.author) {
        results = results.filter(result => 
          result.metadata.uploadedBy === filters.author ||
          result.metadata.senderId === filters.author
        );
      }

      if (filters.status && filters.status.length > 0) {
        results = results.filter(result => 
          !result.metadata.status || filters.status!.includes(result.metadata.status)
        );
      }

      if (filters.priority && filters.priority.length > 0) {
        results = results.filter(result => 
          !result.metadata.priority || filters.priority!.includes(result.metadata.priority)
        );
      }

      // Calculate relevance scores and highlights
      results = results.map(result => {
        const { relevanceScore, highlights } = this.calculateRelevance(result, query);
        return {
          ...result,
          relevanceScore,
          highlights
        };
      });

      // Filter out results with no relevance
      results = results.filter(result => result.relevanceScore > 0);

      // Sort results
      results.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'relevance':
            comparison = b.relevanceScore - a.relevanceScore;
            break;
          case 'date':
            comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
        }
        
        return sortOrder === 'asc' ? -comparison : comparison;
      });

      // Apply pagination
      const total = results.length;
      const paginatedResults = results.slice(offset, offset + limit);

      return { results: paginatedResults, total };
    } catch (error) {
      console.error('Error performing search:', error);
      throw new Error('Failed to perform search');
    }
  }

  // Calculate relevance score and highlights
  private calculateRelevance(result: SearchResult, query: string): { relevanceScore: number; highlights: string[] } {
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const highlights: string[] = [];
    let relevanceScore = 0;

    // Search in title
    const titleLower = result.title.toLowerCase();
    const titleMatches = queryTerms.filter(term => titleLower.includes(term));
    if (titleMatches.length > 0) {
      relevanceScore += titleMatches.length * 10;
      highlights.push(...this.createHighlights(result.title, queryTerms));
    }

    // Search in description
    if (result.description) {
      const descLower = result.description.toLowerCase();
      const descMatches = queryTerms.filter(term => descLower.includes(term));
      if (descMatches.length > 0) {
        relevanceScore += descMatches.length * 5;
        highlights.push(...this.createHighlights(result.description, queryTerms));
      }
    }

    // Search in metadata
    Object.values(result.metadata).forEach(value => {
      if (typeof value === 'string') {
        const valueLower = value.toLowerCase();
        const matches = queryTerms.filter(term => valueLower.includes(term));
        if (matches.length > 0) {
          relevanceScore += matches.length * 2;
          highlights.push(...this.createHighlights(value, queryTerms));
        }
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'string') {
            const itemLower = item.toLowerCase();
            const matches = queryTerms.filter(term => itemLower.includes(term));
            if (matches.length > 0) {
              relevanceScore += matches.length * 2;
              highlights.push(...this.createHighlights(item, queryTerms));
            }
          }
        });
      }
    });

    // Boost recent items
    const daysSinceUpdate = (Date.now() - new Date(result.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) {
      relevanceScore *= 1.2;
    }

    return { relevanceScore, highlights: [...new Set(highlights)] };
  }

  // Create search highlights
  private createHighlights(text: string, queryTerms: string[]): string[] {
    const highlights: string[] = [];
    
    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        matches.forEach(match => {
          const start = Math.max(0, text.indexOf(match) - 20);
          const end = Math.min(text.length, text.indexOf(match) + match.length + 20);
          const snippet = text.substring(start, end);
          highlights.push(snippet.replace(regex, '<mark>$1</mark>'));
        });
      }
    });
    
    return highlights.slice(0, 3); // Limit to 3 highlights per result
  }

  // Fetch methods (these would be actual API calls)
  private async fetchTasks(teamId: string): Promise<any[]> {
    // Mock implementation - would fetch from API
    return [
      {
        id: '1',
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new feature',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: { id: '1', name: 'John Doe' },
        dueDate: new Date().toISOString(),
        tags: ['documentation', 'urgent'],
        spaceId: 'space1',
        listId: 'list1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private async fetchUsers(teamId: string): Promise<any[]> {
    // Mock implementation
    return [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'DEVELOPER',
        department: 'Engineering',
        skills: ['React', 'TypeScript', 'Node.js'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private async fetchTeams(teamId: string): Promise<any[]> {
    // Mock implementation
    return [
      {
        id: teamId,
        name: 'Engineering Team',
        description: 'Main engineering team',
        memberCount: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private async fetchSpaces(teamId: string): Promise<any[]> {
    // Mock implementation
    return [
      {
        id: 'space1',
        name: 'Development',
        description: 'Development workspace',
        icon: '💻',
        color: 'blue',
        listCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private async fetchLists(teamId: string): Promise<any[]> {
    // Mock implementation
    return [
      {
        id: 'list1',
        name: 'Backlog',
        description: 'Task backlog',
        type: 'TASKS',
        taskCount: 15,
        spaceId: 'space1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private async fetchMessages(teamId: string): Promise<any[]> {
    // Mock implementation
    return [
      {
        id: 'msg1',
        content: 'Hey team, let\'s discuss the new feature implementation',
        sender: { id: '1', name: 'John Doe' },
        channelId: 'channel1',
        reactions: [],
        createdAt: new Date().toISOString()
      }
    ];
  }

  private async fetchFiles(teamId: string): Promise<any[]> {
    // Mock implementation
    return [
      {
        id: 'file1',
        name: 'project-spec.pdf',
        description: 'Project specification document',
        fileType: 'PDF',
        size: 1024000,
        uploadedBy: '1',
        tags: ['spec', 'documentation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Get search suggestions
  async getSuggestions(query: string, teamId: string): Promise<string[]> {
    if (query.length < 2) return [];

    try {
      const results = await this.search({ query, limit: 5 });
      return results.results.map(result => result.title);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  // Get popular searches
  async getPopularSearches(teamId: string): Promise<string[]> {
    // This would fetch from analytics or search history
    return [
      'documentation',
      'bug fixes',
      'feature requests',
      'meeting notes',
      'project timeline'
    ];
  }
}

export const globalSearchEngine = new GlobalSearchEngine();
