const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware to check if user is admin (legacy)
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

// Middleware to check if user is root-admin
function requireRootAdmin(req, res, next) {
  if (req.user && req.user.role === 'root-admin') return next();
  return res.status(403).json({ error: 'Root admin access required' });
}

// Middleware to check if user is team member or higher
function requireTeamMemberOrHigher(req, res, next) {
  if (req.user && ['root-admin', 'team-member'].includes(req.user.role)) return next();
  return res.status(403).json({ error: 'Team member access required' });
}

// Middleware to check if user has permission for a specific action
async function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user || !user.isActive) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Root admins have all permissions
      if (user.role === 'root-admin') {
        return next();
      }

      // Team members need specific permissions
      if (user.role === 'team-member' && user.permissions[permission]) {
        return next();
      }

      return res.status(403).json({ error: 'Permission denied' });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  };
}

// Middleware to ensure users can only access their own membership data
async function requireSameMembership(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // Admin users don't have membership restrictions (for now)
    if (['admin', 'owner'].includes(user.role)) {
      return next();
    }

    // For root-admin and team-members, ensure they have a membershipId
    if (!user.membershipId) {
      return res.status(403).json({ error: 'No membership associated' });
    }

    req.userMembershipId = user.membershipId;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { 
  requireAuth, 
  requireAdmin, 
  requireRootAdmin, 
  requireTeamMemberOrHigher,
  requirePermission,
  requireSameMembership,
  // Export the main auth function as default
  auth: requireAuth 
};
