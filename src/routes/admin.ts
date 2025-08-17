import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/dashboard', (req, res) => {
    res.json({ message: 'Get dashboard stats - Coming soon' });
});

// User management
router.get('/users', (req, res) => {
    res.json({ message: 'Get all users - Coming soon' });
});

router.put('/users/:id/status', (req, res) => {
    res.json({ message: 'Update user status - Coming soon' });
});

// Product management
router.get('/products', (req, res) => {
    res.json({ message: 'Get all products (Admin) - Coming soon' });
});

// Order management
router.get('/orders', (req, res) => {
    res.json({ message: 'Get all orders (Admin) - Coming soon' });
});

// Analytics
router.get('/analytics/sales', (req, res) => {
    res.json({ message: 'Get sales analytics - Coming soon' });
});

router.get('/analytics/users', (req, res) => {
    res.json({ message: 'Get user analytics - Coming soon' });
});

export default router;
