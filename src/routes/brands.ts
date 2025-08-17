import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
    getBrands,
    getBrand,
    getBrandBySlug,
    createBrand,
    updateBrand,
    deleteBrand,
    getPopularBrands
} from '../controllers/brandController';

const router = Router();

// Public routes
router.get('/popular', getPopularBrands);
router.get('/slug/:slug', getBrandBySlug);
router.get('/', getBrands);
router.get('/:id', getBrand);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createBrand);
router.put('/:id', protect, authorize('admin'), updateBrand);
router.delete('/:id', protect, authorize('admin'), deleteBrand);

export default router;
