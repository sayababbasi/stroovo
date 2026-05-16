import prisma from '@/lib/prisma';
import { UserService } from './UserService';
import { DemoRequestService } from './DemoRequestService';
import { UserRole } from '@prisma/client/index';

export class AdminService {
  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats(tenantId?: string) {
    const [userStats, demoStats] = await Promise.all([
      UserService.getStatistics(tenantId),
      DemoRequestService.getStatistics()
    ]);
    
    return {
      users: userStats,
      demoRequests: demoStats
    };
  }
  
  /**
   * Get all users with enhanced data
   */
  static async getAllUsers(filters: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    tenantId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { role, isActive, search, tenantId, page = 1, limit = 50 } = filters;
    
    console.log('[AdminService.getAllUsers] Filters:', { role, isActive, search, tenantId, page, limit });
    
    const where: any = {};
    
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (tenantId) where.tenantId = tenantId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    console.log('[AdminService.getAllUsers] Prisma where clause:', where);
    
    try {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            title: true,
            contact: true,
            image: true,
            isActive: true,
            isEmailVerified: true,
            lastLoginAt: true,
            createdAt: true,
            _count: {
              select: {
                tasks: true,
                managedProjects: true,
              }
            },
            department: true,
            designation: true,
            experienceLevel: true,
            address: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
      ]);
      
      console.log('[AdminService.getAllUsers] Found users:', users.length);
      console.log('[AdminService.getAllUsers] Total count:', total);
      
      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[AdminService.getAllUsers] Database error:', error);
      throw error;
    }
  }
  
  /**
   * Create user (admin action)
   */
  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    tenantId?: string;
    department?: string;
    designation?: string;
    experienceLevel?: string;
    address?: string;
    contact?: string;
  }) {
    const user = await UserService.create(data);
    
    // Log admin action
    await this.logAdminAction('USER_CREATED', {
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    return user;
  }
  
  /**
   * Update user (admin action)
   */
  static async updateUser(id: string, data: {
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
    title?: string;
    contact?: string;
    department?: string;
    designation?: string;
    experienceLevel?: string;
    address?: string;
  }) {
    const user = await UserService.update(id, data);
    
    // Log admin action
    await this.logAdminAction('USER_UPDATED', {
      userId: id,
      changes: data
    });
    
    return user;
  }
  
  /**
   * Delete user (admin action)
   */
  static async deleteUser(id: string) {
    await UserService.delete(id);
    
    // Log admin action
    await this.logAdminAction('USER_DELETED', {
      userId: id
    });
    
    return { success: true };
  }
  
  /**
   * Reset user password (admin action)
   */
  static async resetUserPassword(id: string) {
    const tempPassword = UserService.generateTemporaryPassword();
    
    await UserService.changePassword(id, tempPassword);
    
    // Log admin action
    await this.logAdminAction('PASSWORD_RESET', {
      userId: id
    });
    
    return {
      tempPassword
    };
  }
  
  /**
   * Get all demo requests
   */
  static async getDemoRequests(filters: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
  } = {}) {
    return DemoRequestService.getAll(filters);
  }
  
  /**
   * Approve demo request
   */
  static async approveDemoRequest(id: string, tenantId?: string) {
    const result = await DemoRequestService.approve(id, tenantId);
    
    // Log admin action
    await this.logAdminAction('DEMO_REQUEST_APPROVED', {
      requestId: id,
      userId: result.user.id
    });
    
    return result;
  }
  
  /**
   * Reject demo request
   */
  static async rejectDemoRequest(id: string) {
    await DemoRequestService.reject(id);
    
    // Log admin action
    await this.logAdminAction('DEMO_REQUEST_REJECTED', {
      requestId: id
    });
    
    return { success: true };
  }
  
  /**
   * Log admin action
   */
  private static async logAdminAction(action: string, metadata: any) {
    try {
      await prisma.activityLog.create({
        data: {
          action,
          entity: 'ADMIN',
          entityId: 'SYSTEM',
          metadata,
          tenantId: 'SYSTEM',
          userId: 'SYSTEM'
        }
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
  
  /**
   * Get recent admin activity
   */
  static async getRecentActivity(limit: number = 20) {
    const activities = await prisma.activityLog.findMany({
      where: {
        entity: 'ADMIN'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    return activities;
  }
}
