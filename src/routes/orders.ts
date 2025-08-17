import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(protect);

// Customer routes
router.get('/', (req, res) => {
    res.json({ message: 'Get user orders - Coming soon' });
});

router.get('/:id', (req, res) => {
    res.json({ message: 'Get single order - Coming soon' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create order - Coming soon' });
});

router.put('/:id/cancel', (req, res) => {
    res.json({ message: 'Cancel order - Coming soon' });
});

// Admin routes
router.get('/admin/all', authorize('admin'), (req, res) => {
    res.json({ message: 'Get all orders (Admin) - Coming soon' });
});

router.put('/:id/status', authorize('admin'), (req, res) => {
    res.json({ message: 'Update order status - Coming soon' });
});

export default router;
