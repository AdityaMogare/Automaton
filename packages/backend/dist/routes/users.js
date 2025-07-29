"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/profile', async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user profile',
        });
    }
});
router.put('/profile', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Profile updated successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update profile',
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map