import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRole } from '@prisma/client/index';

export interface CreateUserInput {
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
}

export interface UpdateUserInput {
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
}

export class UserService {
  /**
   * Create a new user with hashed password
   */
  static async create(input: CreateUserInput) {
    const { name, email, password, role = 'TEAM_MEMBER', tenantId } = input;
    
    console.log('[UserService.create] Creating user:', { name, email, role, tenantId });
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('[UserService.create] Email already exists:', email);
      throw new Error('Email already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('[UserService.create] Password hashed');
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        tenantId,
        isActive: true,
        isEmailVerified: false,
        department: input.department,
        designation: input.designation,
        experienceLevel: input.experienceLevel,
        address: input.address,
        contact: input.contact,
        title: input.designation || input.role // Use designation or role as title
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      }
    });
    
    console.log('[UserService.create] User created successfully:', user.id);
    return user;
  }
  
  /**
   * Get user by ID
   */
  static async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
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
        updatedAt: true,
        tenantId: true,
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
      }
    });
    
    return user;
  }
  
  /**
   * Get user by email
   */
  static async getByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    return user;
  }
  
  /**
   * Get all users with filters
   */
  static async getAll(filters: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    tenantId?: string;
  } = {}) {
    const { role, isActive, search, tenantId } = filters;
    
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
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
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
        address: true,
        contact: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return users;
  }
  
  /**
   * Update user
   */
  static async update(id: string, input: UpdateUserInput) {
    const user = await prisma.user.update({
      where: { id },
      data: input,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        contact: true,
        isActive: true,
        updatedAt: true,
      }
    });
    
    return user;
  }
  
  /**
   * Update user role
   */
  static async updateRole(id: string, role: UserRole) {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    
    return user;
  }
  
  /**
   * Update user status (activate/suspend)
   */
  static async updateStatus(id: string, isActive: boolean) {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      }
    });
    
    return user;
  }
  
  /**
   * Delete user
   */
  static async delete(id: string) {
    await prisma.user.delete({
      where: { id }
    });
    
    return { success: true };
  }
  
  /**
   * Change user password
   */
  static async changePassword(id: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      }
    });
    
    return { success: true };
  }
  
  /**
   * Generate temporary password
   */
  static generateTemporaryPassword(): string {
    return crypto.randomBytes(12).toString('base64').slice(0, 16);
  }
  
  /**
   * Verify password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * Update last login
   */
  static async updateLastLogin(id: string) {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    });
  }
  
  /**
   * Get user statistics
   */
  static async getStatistics(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};
    
    const [total, active, suspended, byRole] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isActive: true } }),
      prisma.user.count({ where: { ...where, isActive: false } }),
      prisma.user.groupBy({
        by: ['role'],
        where,
        _count: true
      })
    ]);
    
    return {
      total,
      active,
      suspended,
      byRole: byRole.reduce((acc: Record<string, number>, item: any) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
