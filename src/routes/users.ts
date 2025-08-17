import { Router } from "express";
import { protect } from "../middleware/auth";
import { validateAddress } from "../middleware/validation";
import {
    getProfile,
    updateProfile,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updatePreferences,
    uploadAvatar,
    deleteAccount
} from "../controllers/userController";

const router = Router();

// All routes are protected
router.use(protect);

// User profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Address management
router.get("/addresses", getAddresses);
router.post("/addresses", validateAddress, addAddress);
router.put("/addresses/:addressId", validateAddress, updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.put("/addresses/:addressId/default", setDefaultAddress);

// User preferences
router.put("/preferences", updatePreferences);

// Avatar upload
router.post("/avatar", uploadAvatar);

// Account management
router.delete("/account", deleteAccount);

export default router;
