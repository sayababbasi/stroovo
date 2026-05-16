import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware
router.use(authenticate as any);

// GET /api/teams - Get teams for tenant
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      where: { tenantId: req.user?.tenantId },
      include: {
        _count: {
          select: { members: true, tasks: true }
        }
      }
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/teams/:id - Get specific team with members
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const team = await prisma.team.findUnique({
      where: { id, tenantId: req.user?.tenantId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        tasks: {
          take: 10,
          orderBy: { updatedAt: 'desc' }
        }
      }
    });
    
    if (!team) return res.status(404).json({ error: 'Team not found' });
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team details' });
  }
});

export default router;
