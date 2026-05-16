import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all task routes
router.use(authenticate as any);

// GET /api/tasks - Get all tasks for user's tenant
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { tenantId: req.user?.tenantId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true }
        },
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, projectId, assigneeId, dueDate } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        projectId,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null,
        tenantId: req.user?.tenantId
      }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id - Update task
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const task = await prisma.task.update({
      where: { id, tenantId: req.user?.tenantId },
      data: updates
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.task.delete({
      where: { id, tenantId: req.user?.tenantId }
    });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
