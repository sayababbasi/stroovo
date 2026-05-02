import { NotificationEvent } from './types';

export interface OptimizedEvent extends NotificationEvent {
  shouldSend: boolean;
  scheduledTime?: Date;
  aggregatedEvents?: NotificationEvent[];
  escalationLevel?: number;
}

export interface UserNotificationProfile {
  userId: string;
  timezone: string;
  activeHours: {
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  quietHours: {
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  preferredChannels: string[];
  notificationFrequency: 'low' | 'medium' | 'high';
  lastNotificationTime?: Date;
  dailyNotificationCount: number;
  weeklyNotificationCount: number;
}

export interface NotificationAggregation {
  type: string;
  userId: string;
  events: NotificationEvent[];
  aggregatedAt: Date;
  summary: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export class AISmartLayer {
  private userProfiles: Map<string, UserNotificationProfile> = new Map();
  private aggregations: Map<string, NotificationAggregation[]> = new Map();
  private rateLimits: Map<string, Date[]> = new Map();

  constructor() {
    this.initializeDefaultProfiles();
  }

  /**
   * Optimize notification event using AI smart layer
   */
  async optimizeEvent(event: NotificationEvent): Promise<OptimizedEvent> {
    const userProfile = await this.getUserProfile(event.userId);
    
    // Step 1: Check if notification should be sent (rate limiting, quiet hours, etc.)
    if (!this.shouldSendNotification(event, userProfile)) {
      return {
        ...event,
        shouldSend: false
      };
    }

    // Step 2: Check for aggregation opportunities
    const aggregatedEvent = await this.checkAggregation(event, userProfile);
    if (aggregatedEvent) {
      return aggregatedEvent;
    }

    // Step 3: Optimize timing
    const scheduledTime = this.optimizeTiming(event, userProfile);

    // Step 4: Adjust priority based on user context
    const optimizedPriority = this.optimizePriority(event, userProfile);

    // Step 5: Check for escalation needs
    const escalationLevel = this.checkEscalation(event, userProfile);

    return {
      ...event,
      shouldSend: true,
      scheduledTime,
      priority: optimizedPriority,
      escalationLevel
    };
  }

  /**
   * Check if notification should be sent based on smart filters
   */
  private shouldSendNotification(event: NotificationEvent, profile: UserNotificationProfile): boolean {
    // Rate limiting check
    if (this.isRateLimited(event.userId, profile)) {
      console.log(`Notification rate limited for user ${event.userId}`);
      return false;
    }

    // Quiet hours check (except for urgent notifications)
    if (this.isQuietHours(profile) && event.priority !== 'URGENT') {
      console.log(`Notification deferred due to quiet hours for user ${event.userId}`);
      return false;
    }

    // Frequency preference check
    if (this.exceedsFrequencyPreference(event.userId, profile)) {
      console.log(`Notification frequency exceeded for user ${event.userId}`);
      return false;
    }

    // Duplicate detection
    if (this.isDuplicate(event)) {
      console.log(`Duplicate notification detected for user ${event.userId}`);
      return false;
    }

    return true;
  }

  /**
   * Check if notification can be aggregated with similar notifications
   */
  private async checkAggregation(
    event: NotificationEvent, 
    profile: UserNotificationProfile
  ): Promise<OptimizedEvent | null> {
    // Only aggregate certain types of notifications
    const aggregatableTypes = ['TASK_ASSIGNED', 'TASK_COMPLETED', 'DEADLINE_NEAR'];
    
    if (!aggregatableTypes.includes(event.type)) {
      return null;
    }

    const userAggregations = this.aggregations.get(event.userId) || [];
    const existingAggregation = userAggregations.find(
      agg => agg.type === event.type && 
      agg.events.length < 5 && // Limit aggregation to 5 events
      (Date.now() - agg.aggregatedAt.getTime()) < 30 * 60 * 1000 // 30 minutes window
    );

    if (existingAggregation) {
      // Add to existing aggregation
      existingAggregation.events.push(event);
      existingAggregation.priority = this.calculateAggregatedPriority(existingAggregation.events);
      existingAggregation.summary = this.generateAggregatedSummary(existingAggregation.events);

      return {
        ...event,
        shouldSend: false, // Don't send individual notification
        aggregatedEvents: existingAggregation.events
      };
    }

    // Create new aggregation
    const newAggregation: NotificationAggregation = {
      type: event.type,
      userId: event.userId,
      events: [event],
      aggregatedAt: new Date(),
      summary: event.message,
      priority: event.priority
    };

    userAggregations.push(newAggregation);
    this.aggregations.set(event.userId, userAggregations);

    // Don't send immediately, wait for more events or timeout
    setTimeout(() => {
      this.sendAggregatedNotification(newAggregation);
    }, 30 * 60 * 1000); // 30 minutes

    return {
      ...event,
      shouldSend: false,
      aggregatedEvents: [event]
    };
  }

  /**
   * Optimize notification timing based on user preferences and context
   */
  private optimizeTiming(event: NotificationEvent, profile: UserNotificationProfile): Date | undefined {
    // For urgent notifications, send immediately
    if (event.priority === 'URGENT') {
      return undefined;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check if within active hours
    if (!this.isWithinActiveHours(currentTime, profile)) {
      // Schedule for next active hour
      const nextActiveTime = this.getNextActiveTime(profile);
      return nextActiveTime;
    }

    // Check if within quiet hours
    if (this.isQuietHours(profile)) {
      // Schedule for end of quiet hours
      const quietEnd = this.parseTime(profile.quietHours.end);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(quietEnd.hours, quietEnd.minutes, 0, 0);
      
      return scheduledTime;
    }

    return undefined; // Send immediately
  }

  /**
   * Optimize notification priority based on user context and behavior
   */
  private optimizePriority(event: NotificationEvent, profile: UserNotificationProfile): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    // Don't downgrade urgent notifications
    if (event.priority === 'URGENT') {
      return 'URGENT';
    }

    // Check user's notification frequency preference
    if (profile.notificationFrequency === 'low') {
      // Downgrade medium to low, high to medium
      if (event.priority === 'MEDIUM') return 'LOW';
      if (event.priority === 'HIGH') return 'MEDIUM';
    } else if (profile.notificationFrequency === 'high') {
      // Upgrade low to medium, medium to high
      if (event.priority === 'LOW') return 'MEDIUM';
      if (event.priority === 'MEDIUM') return 'HIGH';
    }

    return event.priority;
  }

  /**
   * Check if notification should be escalated
   */
  private checkEscalation(event: NotificationEvent, profile: UserNotificationProfile): number {
    // Escalation levels: 0 (no escalation), 1 (manager), 2 (admin)
    
    // Check if user has been inactive for critical notifications
    if (event.priority === 'URGENT' || event.priority === 'HIGH') {
      const lastNotification = profile.lastNotificationTime;
      if (lastNotification && (Date.now() - lastNotification.getTime()) > 24 * 60 * 60 * 1000) {
        return 1; // Escalate to manager
      }
    }

    // Check for repeated similar notifications
    const recentEvents = this.getRecentEvents(event.userId, event.type, 60 * 60 * 1000); // 1 hour
    if (recentEvents.length >= 3) {
      return 1; // Escalate to manager
    }

    return 0; // No escalation
  }

  /**
   * Get user notification profile
   */
  private async getUserProfile(userId: string): Promise<UserNotificationProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      // Create default profile
      profile = {
        userId,
        timezone: 'UTC',
        activeHours: { start: '09:00', end: '17:00' },
        quietHours: { start: '22:00', end: '07:00' },
        preferredChannels: ['email', 'push'],
        notificationFrequency: 'medium',
        dailyNotificationCount: 0,
        weeklyNotificationCount: 0
      };
      
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * Check if user is rate limited
   */
  private isRateLimited(userId: string, profile: UserNotificationProfile): boolean {
    const now = Date.now();
    const userRateLimits = this.rateLimits.get(userId) || [];
    
    // Clean old entries (older than 1 hour)
    const recentNotifications = userRateLimits.filter(
      (time) => now - time.getTime() < 60 * 60 * 1000
    );
    this.rateLimits.set(userId, recentNotifications);

    // Check rate limits based on frequency preference
    const maxNotificationsPerHour = profile.notificationFrequency === 'low' ? 5 :
                                   profile.notificationFrequency === 'medium' ? 10 : 20;

    return recentNotifications.length >= maxNotificationsPerHour;
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(profile: UserNotificationProfile): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const quietStart = this.parseTime(profile.quietHours.start);
    const quietEnd = this.parseTime(profile.quietHours.end);
    const current = this.parseTime(currentTime);

    if (quietStart.hours <= quietEnd.hours) {
      // Same day (e.g., 22:00 to 07:00 is next day)
      return current.hours >= quietStart.hours || current.hours <= quietEnd.hours;
    } else {
      // Spans midnight (e.g., 22:00 to 07:00)
      return current.hours >= quietStart.hours && current.hours <= quietEnd.hours;
    }
  }

  /**
   * Check if current time is within active hours
   */
  private isWithinActiveHours(currentTime: string, profile: UserNotificationProfile): boolean {
    const activeStart = this.parseTime(profile.activeHours.start);
    const activeEnd = this.parseTime(profile.activeHours.end);
    const current = this.parseTime(currentTime);

    return current.hours >= activeStart.hours && current.hours <= activeEnd.hours;
  }

  /**
   * Get next active time for scheduling
   */
  private getNextActiveTime(profile: UserNotificationProfile): Date {
    const now = new Date();
    const activeStart = this.parseTime(profile.activeHours.start);
    
    const nextActive = new Date(now);
    nextActive.setHours(activeStart.hours, activeStart.minutes, 0, 0);
    
    // If next active time is in the past, schedule for tomorrow
    if (nextActive <= now) {
      nextActive.setDate(nextActive.getDate() + 1);
    }
    
    return nextActive;
  }

  /**
   * Check if notification frequency exceeds user preference
   */
  private exceedsFrequencyPreference(userId: string, profile: UserNotificationProfile): boolean {
    // This would typically check database for actual counts
    // For now, use in-memory tracking
    const maxDaily = profile.notificationFrequency === 'low' ? 10 :
                    profile.notificationFrequency === 'medium' ? 25 : 50;
    
    return profile.dailyNotificationCount >= maxDaily;
  }

  /**
   * Check for duplicate notifications
   */
  private isDuplicate(event: NotificationEvent): boolean {
    // Simple duplicate detection based on type, title, and recent time
    const recentEvents = this.getRecentEvents(event.userId, event.type, 5 * 60 * 1000); // 5 minutes
    return recentEvents.some(e => e.title === event.title && e.message === event.message);
  }

  /**
   * Get recent events for user
   */
  private getRecentEvents(userId: string, type: string, timeWindow: number): NotificationEvent[] {
    // This would typically query database
    // For now, return empty array
    return [];
  }

  /**
   * Calculate aggregated priority
   */
  private calculateAggregatedPriority(events: NotificationEvent[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    const priorities = events.map(e => e.priority);
    
    if (priorities.includes('URGENT')) return 'URGENT';
    if (priorities.includes('HIGH')) return 'HIGH';
    if (priorities.includes('MEDIUM')) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate aggregated summary
   */
  private generateAggregatedSummary(events: NotificationEvent[]): string {
    if (events.length === 1) return events[0].message;
    
    const count = events.length;
    const type = events[0].type.replace(/_/g, ' ').toLowerCase();
    
    return `You have ${count} new ${type}${count > 1 ? 's' : ''}`;
  }

  /**
   * Send aggregated notification
   */
  private async sendAggregatedNotification(aggregation: NotificationAggregation): Promise<void> {
    // This would trigger the notification engine with the aggregated event
    console.log(`Sending aggregated notification for ${aggregation.events.length} events`);
    
    // Remove from aggregations
    const userAggregations = this.aggregations.get(aggregation.userId) || [];
    const index = userAggregations.indexOf(aggregation);
    if (index > -1) {
      userAggregations.splice(index, 1);
    }
  }

  /**
   * Parse time string to hours and minutes
   */
  private parseTime(timeStr: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  }

  /**
   * Initialize default user profiles
   */
  private initializeDefaultProfiles(): void {
    // In a real implementation, this would load from database
    console.log('Initializing default user notification profiles...');
  }

  /**
   * Update user notification profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserNotificationProfile>): Promise<void> {
    const profile = await this.getUserProfile(userId);
    Object.assign(profile, updates);
    this.userProfiles.set(userId, profile);
  }

  /**
   * Get notification statistics
   */
  getStatistics(): {
    totalUsers: number;
    activeAggregations: number;
    rateLimitedUsers: number;
    averageNotificationsPerUser: number;
  } {
    const totalUsers = this.userProfiles.size;
    const activeAggregations = Array.from(this.aggregations.values())
      .reduce((total, userAggs) => total + userAggs.length, 0);
    const rateLimitedUsers = this.rateLimits.size;
    
    const totalNotifications = Array.from(this.userProfiles.values())
      .reduce((total, profile) => total + profile.dailyNotificationCount, 0);
    const averageNotificationsPerUser = totalUsers > 0 ? totalNotifications / totalUsers : 0;

    return {
      totalUsers,
      activeAggregations,
      rateLimitedUsers,
      averageNotificationsPerUser
    };
  }
}

// Export singleton instance
export const aiSmartLayer = new AISmartLayer();
