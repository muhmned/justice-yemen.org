const express = require('express');
const router = express.Router();
const logActivity = require('../middleware/logActivity');
const {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  updateUserPermissions,
  getMe,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  updateProfile,
  changePassword,
} = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get current user (accessible to any authenticated user)
router.get('/me', authenticateToken, getMe);

// Update current user profile (accessible to any authenticated user)
router.put('/profile', authenticateToken, logActivity('update_profile', 'user', (req) => `User updated their own profile: ${req.user.username}`), updateProfile);

// Change current user password (accessible to any authenticated user)
router.post('/change-password', authenticateToken, logActivity('change_password', 'user', (req) => `User changed their own password: ${req.user.username}`), changePassword);

// Get user statistics (accessible to the user themselves or admins)
router.get('/:userId/stats', authenticateToken, getUserStats);

// --- Routes for System Admin ---
// These routes are only accessible to users with the 'system_admin' role.

// Get all users
router.get('/', authenticateToken, requireRole(['system_admin']), getAllUsers);

// Update a user's role
router.put('/:userId/role', authenticateToken, requireRole(['system_admin']), logActivity('update_role', 'admin', (req) => `User role updated for ID ${req.params.userId} to ${req.body.role}`), updateUserRole);

// Update a user's status
router.put('/:userId/status', authenticateToken, requireRole(['system_admin']), logActivity('update_status', 'admin', (req) => `User status updated for ID ${req.params.userId} to ${req.body.status}`), updateUserStatus);

// Update a user's permissions
router.put('/:userId/permissions', authenticateToken, requireRole(['system_admin']), logActivity('update_permissions', 'admin', (req) => `User permissions updated for ID ${req.params.userId}`), updateUserPermissions);


// --- Routes for Admins ---
// These routes are accessible to 'admin' and 'system_admin' roles.

// Create a new user
router.post('/', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('create_user', 'admin', (req) => `User created: ${req.body.username}`), createUser);

// Update a user
router.put('/:userId', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('update_user', 'admin', (req) => `User updated: ID ${req.params.userId}`), updateUser);

// Delete a user
router.delete('/:userId', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('delete_user', 'admin', (req) => `User deleted: ID ${req.params.userId}`), deleteUser);

module.exports = router;
