import { Router } from "express";
import { protect, authorize } from "../middleware/auth";
import { orderHistoryService } from "../services/orderHistoryService";

const router = Router();

// All routes require authentication
router.use(protect);

// Customer routes
router.get("/", (req, res) => {
    res.json({ message: "Get user orders - Coming soon" });
});

router.get("/:id", (req, res) => {
    res.json({ message: "Get single order - Coming soon" });
});

router.post("/", (req, res) => {
    res.json({ message: "Create order - Coming soon" });
});

router.put("/:id/cancel", (req, res) => {
    res.json({ message: "Cancel order - Coming soon" });
});

// Admin routes
router.get("/admin/all", authorize("admin", "ADMIN"), (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page as string) || 0;
        const size = parseInt(req.query.size as string) || 10;
        const skip = page * size;

        // Mock data for now - in real app, this would query the database
        const mockOrders = Array.from({ length: 25 }, (_, i) => ({
            id: `ORD${String(i + 1).padStart(3, "0")}`,
            customerFullName: `Khách hàng ${i + 1}`,
            customerName: `Khách hàng ${i + 1}`,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: Math.floor(Math.random() * 1000000) + 100000,
            status: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"][Math.floor(Math.random() * 5)],
            items: [
                {
                    id: `ITEM${i + 1}`,
                    productName: `Sản phẩm ${i + 1}`,
                    quantity: Math.floor(Math.random() * 3) + 1,
                    price: Math.floor(Math.random() * 500000) + 50000
                }
            ]
        }));

        // Apply pagination
        const totalElements = mockOrders.length;
        const totalPages = Math.ceil(totalElements / size);
        const content = mockOrders.slice(skip, skip + size);

        const response = {
            success: true,
            data: {
                content,
                page,
                size,
                totalElements,
                totalPages,
                first: page === 0,
                last: page >= totalPages - 1
            }
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching admin orders:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.put("/:id/status", authorize("admin", "ADMIN"), (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, note } = req.body;

        console.log("Order status update request:", {
            method: req.method,
            url: req.originalUrl,
            orderId,
            status,
            note,
            body: req.body,
            headers: req.headers,
            user: req.user
        });

        // Validate status
        const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Valid statuses are: " + validStatuses.join(", ")
            });
        }

        // Get current user info (in real app, this would come from auth middleware)
        const changedBy = req.user?.email || "Admin";

        console.log("User info for order status update:", {
            userId: req.user?.id,
            userEmail: req.user?.email,
            userRole: req.user?.role,
            orderId,
            status,
            note
        });

        // Add to order history
        orderHistoryService.addEntry({
            orderId,
            oldStatus: "UNKNOWN", // In real app, get current status from database
            newStatus: status,
            changedBy,
            note: note || `Trạng thái đơn hàng được cập nhật thành: ${status}`
        });

        // In real app, this would update the database
        // For now, just return success response
        const response = {
            success: true,
            data: {
                id: orderId,
                status,
                updatedAt: new Date().toISOString()
            },
            message: "Order status updated successfully"
        };

        console.log("Order status update response:", response);
        res.json(response);
    } catch (error) {
        console.error("Error updating order status:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            orderId: req.params.id,
            body: req.body
        });
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Get order history
router.get("/:id/history", authorize("admin", "ADMIN"), (req, res) => {
    try {
        const orderId = req.params.id;

        // Get history from service
        const orderHistory = orderHistoryService.getOrderHistory(orderId);

        // If no history exists, create some sample data for demo
        if (orderHistory.length === 0) {
            const sampleHistory = [
                {
                    orderId,
                    oldStatus: "PENDING",
                    newStatus: "PROCESSING",
                    changedBy: "Admin",
                    note: "Đơn hàng đã được xác nhận và đang xử lý"
                },
                {
                    orderId,
                    oldStatus: "PROCESSING",
                    newStatus: "SHIPPED",
                    changedBy: "Admin",
                    note: "Đơn hàng đã được giao cho đơn vị vận chuyển"
                }
            ];

            sampleHistory.forEach((entry) => {
                orderHistoryService.addEntry(entry);
            });

            // Get the updated history
            const updatedHistory = orderHistoryService.getOrderHistory(orderId);
            return res.json({
                success: true,
                data: updatedHistory
            });
        }

        res.json({
            success: true,
            data: orderHistory
        });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

export default router;
