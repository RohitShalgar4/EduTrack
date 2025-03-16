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
        // isAuthenticated middleware should be used before this middleware
        if (!req.role) {
            return res.status(401).json({ message: "Authentication required" });
        }
        
        if (roles.includes(req.role)) {
            return next();
        }
        
        return res.status(403).json({ 
            message: "Access denied. You don't have permission to access this resource." 
        });
    };
};

export default checkRole; 