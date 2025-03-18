/**
 * Middleware to check if the user has the required role(s)
 * @param {string|string[]} roles - The role(s) required to access the route
 * @returns {function} - Express middleware function
 */
const checkRole = (roles) => {
    // Convert single role to array
    if (typeof roles === 'string') {
        roles = [roles];
    }
    
    return (req, res, next) => {
        console.log('Checking role access...', {
            userRole: req.role,
            requiredRoles: roles,
            userId: req.id,
            department: req.department
        });

        // isAuthenticated middleware should be used before this middleware
        if (!req.role) {
            console.log('No role found in request');
            return res.status(401).json({ 
                message: "Authentication required",
                error: "No role found in request"
            });
        }
        
        // Check if the user's role is in the list of allowed roles
        if (roles.includes(req.role)) {
            console.log('Role check passed:', {
                userRole: req.role,
                allowedRoles: roles
            });
            return next();
        }
        
        console.log('Role check failed:', {
            userRole: req.role,
            requiredRoles: roles
        });
        
        return res.status(403).json({ 
            message: "Access denied. You don't have permission to access this resource.",
            error: `Required roles: ${roles.join(', ')}, User role: ${req.role}`
        });
    };
};

export default checkRole; 