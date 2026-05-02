import prisma from '@/lib/prisma';
import { UserService } from './UserService';

export interface CreateDemoRequestInput {
  name: string;
  email: string;
  company?: string;
  message?: string;
}

export class DemoRequestService {
  /**
   * Create a new demo request
   */
  static async create(input: CreateDemoRequestInput) {
    const { name, email, company, message } = input;
    
    // Check if email already has a pending request
    const existingRequest = await prisma.demoRequest.findFirst({
      where: {
        email,
        status: 'PENDING'
      }
    });
    
    if (existingRequest) {
      throw new Error('You already have a pending demo request');
    }
    
    const demoRequest = await prisma.demoRequest.create({
      data: {
        name,
        email,
        company,
        message,
        status: 'PENDING'
      }
    });
    
    return demoRequest;
  }
  
  /**
   * Get all demo requests
   */
  static async getAll(filters: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
  } = {}) {
    const { status, search } = filters;
    
    const where: any = {};
    
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const requests = await prisma.demoRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return requests;
  }
  
  /**
   * Get demo request by ID
   */
  static async getById(id: string) {
    const request = await prisma.demoRequest.findUnique({
      where: { id }
    });
    
    return request;
  }
  
  /**
   * Approve demo request and create user
   */
  static async approve(id: string, tenantId?: string) {
    const request = await prisma.demoRequest.findUnique({
      where: { id }
    });
    
    if (!request) {
      throw new Error('Demo request not found');
    }
    
    if (request.status !== 'PENDING') {
      throw new Error('Demo request has already been processed');
    }
    
    // Generate temporary password
    const tempPassword = UserService.generateTemporaryPassword();
    
    // Create user
    const user = await UserService.create({
      name: request.name,
      email: request.email,
      password: tempPassword,
      role: 'TEAM_MEMBER',
      tenantId
    });
    
    // Update request status
    await prisma.demoRequest.update({
      where: { id },
      data: {
        status: 'APPROVED'
      }
    });
    
    return {
      user,
      tempPassword
    };
  }
  
  /**
   * Reject demo request
   */
  static async reject(id: string) {
    const request = await prisma.demoRequest.findUnique({
      where: { id }
    });
    
    if (!request) {
      throw new Error('Demo request not found');
    }
    
    if (request.status !== 'PENDING') {
      throw new Error('Demo request has already been processed');
    }
    
    await prisma.demoRequest.update({
      where: { id },
      data: {
        status: 'REJECTED'
      }
    });
    
    return { success: true };
  }
  
  /**
   * Delete demo request
   */
  static async delete(id: string) {
    await prisma.demoRequest.delete({
      where: { id }
    });
    
    return { success: true };
  }
  
  /**
   * Get statistics
   */
  static async getStatistics() {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.demoRequest.count(),
      prisma.demoRequest.count({ where: { status: 'PENDING' } }),
      prisma.demoRequest.count({ where: { status: 'APPROVED' } }),
      prisma.demoRequest.count({ where: { status: 'REJECTED' } })
    ]);
    
    return {
      total,
      pending,
      approved,
      rejected
    };
  }
}
