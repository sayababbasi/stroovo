import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRole } from '@prisma/client/index';

export interface CreateUserInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email: string;
  password?: string;
  username?: string;
  employeeId?: string;
  dob?: string | Date;
  joiningDate?: string | Date;
  employmentType?: string;
  experienceLevel?: string;
  jobTitle?: string;
  title?: string;
  department?: string;
  deptId?: string;
  teamId?: string;
  managerId?: string;
  reportingManagerId?: string;
  phone?: string;
  contact?: string;
  country?: string;
  city?: string;
  officeLocation?: string;
  address?: string;
  timezone?: string;
  language?: string;
  role?: any;
  require2FA?: boolean;
  twoFactorEnabled?: boolean;
  accountStatus?: string;
  bio?: string;
  skills?: string[];
  image?: string;
  tenantId?: string;
  designation?: string;
}

export interface UpdateUserInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  username?: string;
  employeeId?: string;
  password?: string;
  role?: any;
  isActive?: boolean;
  status?: string;
  accountStatus?: string;
  title?: string;
  jobTitle?: string;
  contact?: string;
  phone?: string;
  department?: string;
  deptId?: string;
  teamId?: string;
  designation?: string;
  experienceLevel?: string;
  employmentType?: string;
  country?: string;
  city?: string;
  officeLocation?: string;
  address?: string;
  timezone?: string;
  language?: string;
  bio?: string;
  skills?: string[];
  image?: string;
  managerId?: string;
  twoFactorEnabled?: boolean;
  require2FA?: boolean;
}

export class UserService {
  /**
   * Get user statistics
   */
  static async getStatistics(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};
    const [total, active, admins] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isActive: true } }),
      prisma.user.count({ where: { ...where, role: 'SUPER_ADMIN' } })
    ]);
    return { total, active, admins };
  }

  /**
   * Generate a secure temporary password
   */
  static generateTemporaryPassword(): string {
    return crypto.randomBytes(8).toString('hex') + 'Aa1!';
  }
  /**
   * Create a new user with hashed password
   */
  static async create(input: CreateUserInput) {
    const email = input.email;
    const finalPassword = input.password || crypto.randomBytes(8).toString('hex');
    const role = (input.role || 'TEAM_MEMBER') as UserRole;
    const tenantId = input.tenantId;
    
    const computedName = input.name || input.displayName || (input.firstName && input.lastName ? `${input.firstName} ${input.lastName}` : input.firstName || email.split('@')[0]);

    console.log('[UserService.create] Creating user:', { computedName, email, role, tenantId });
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('[UserService.create] Email already exists:', email);
      throw new Error('Email already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(finalPassword, 12);
    console.log('[UserService.create] Password hashed');
    
    // Create user
    const user = await (prisma as any).user.create({
      data: {
        name: computedName,
        firstName: input.firstName || null,
        lastName: input.lastName || null,
        displayName: input.displayName || computedName,
        username: input.username || null,
        employeeId: input.employeeId || null,
        email,
        passwordHash,
        role,
        tenantId,
        isActive: input.accountStatus ? input.accountStatus === 'ACTIVE' : true,
        status: input.accountStatus || 'ACTIVE',
        isEmailVerified: false,
        department: input.department || null,
        deptId: input.deptId || null,
        designation: input.jobTitle || input.designation || null,
        title: input.jobTitle || input.designation || null,
        experienceLevel: input.experienceLevel || null,
        employmentType: input.employmentType || null,
        dob: input.dob ? new Date(input.dob) : null,
        joiningDate: input.joiningDate ? new Date(input.joiningDate) : null,
        contact: input.phone || input.contact || null,
        country: input.country || null,
        city: input.city || null,
        officeLocation: input.officeLocation || input.address || null,
        address: input.officeLocation || input.address || null,
        timezone: input.timezone || 'UTC+05:00 Asia/Karachi',
        language: input.language || 'English',
        bio: input.bio || null,
        skills: input.skills || [],
        twoFactorEnabled: input.require2FA || input.twoFactorEnabled || false,
        image: input.image || null,
        managerId: input.managerId || null
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
    
    if (input.teamId) {
      try {
        await prisma.teamMember.create({
          data: {
            teamId: input.teamId,
            userId: user.id,
            role: 'MEMBER'
          }
        });
      } catch (err) {
        console.error('Failed to attach user to team:', err);
      }
    }

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
    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName;
    if (input.displayName !== undefined) updateData.displayName = input.displayName;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.username !== undefined) updateData.username = input.username;
    if (input.employeeId !== undefined) updateData.employeeId = input.employeeId;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.accountStatus !== undefined) {
      updateData.status = input.accountStatus;
      updateData.isActive = input.accountStatus === 'ACTIVE';
    }
    if (input.jobTitle !== undefined || input.title !== undefined || input.designation !== undefined) {
      const val = input.jobTitle || input.title || input.designation;
      updateData.title = val;
      updateData.designation = val;
    }
    if (input.department !== undefined) updateData.department = input.department;
    if (input.deptId !== undefined) updateData.deptId = input.deptId || null;
    if (input.experienceLevel !== undefined) updateData.experienceLevel = input.experienceLevel;
    if (input.employmentType !== undefined) updateData.employmentType = input.employmentType;
    if (input.phone !== undefined || input.contact !== undefined) updateData.contact = input.phone || input.contact;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.officeLocation !== undefined || input.address !== undefined) updateData.address = input.officeLocation || input.address;
    if (input.timezone !== undefined) updateData.timezone = input.timezone;
    if (input.language !== undefined) updateData.language = input.language;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.skills !== undefined) updateData.skills = input.skills;
    if (input.image !== undefined) updateData.image = input.image;
    if (input.managerId !== undefined) updateData.managerId = input.managerId || null;
    if (input.twoFactorEnabled !== undefined || input.require2FA !== undefined) {
      updateData.twoFactorEnabled = input.require2FA || input.twoFactorEnabled;
    }

    if (input.password) {
      updateData.passwordHash = await bcrypt.hash(input.password, 12);
      updateData.passwordChangedAt = new Date();
    }

    const user = await (prisma as any).user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        image: true,
        contact: true,
        isActive: true,
        updatedAt: true,
      }
    });

    if (input.teamId) {
      try {
        await prisma.teamMember.upsert({
          where: {
            teamId_userId: {
              teamId: input.teamId,
              userId: id
            }
          },
          create: {
            teamId: input.teamId,
            userId: id,
            role: 'MEMBER'
          },
          update: {}
        });
      } catch (e) {
        console.error('Error syncing user team on update:', e);
      }
    }
    
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
}
