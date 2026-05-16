import { Router } from 'express';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user || user.passwordHash !== password) { // Simplified password check for now
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        tenantId: user.tenantId,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name, tenantName } = req.body;

  try {
    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName || `${name}'s Team`,
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash: password,
          name,
          tenantId: tenant.id,
          role: 'ADMIN' as any
        }
      });

      return { user, tenant };
    });

    const token = jwt.sign(
      { 
        id: result.user.id, 
        email: result.user.email, 
        tenantId: result.user.tenantId,
        role: result.user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        tenantId: result.user.tenantId
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Signup failed' });
  }
});

export default router;
