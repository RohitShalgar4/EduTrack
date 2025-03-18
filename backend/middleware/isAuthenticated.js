import jwt from "jsonwebtoken";

const isAuthenticated = async(req, res, next) => {
    try {
        console.log('Checking authentication...');
        const token = req.cookies.token;
        
        if (!token) {
            console.log('No token found in cookies');
            return res.status(401).json({ message: "User not authenticated." });
        }

        console.log('Token found, verifying...');
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        
        if (!decoded) {
            console.log('Token verification failed');
            return res.status(401).json({ message: "Invalid token" });
        }

        console.log('Token verified. User details:', {
            userId: decoded.userId,
            role: decoded.role,
            department: decoded.department
        });

        // Set user details in request object
        req.id = decoded.userId;
        req.role = decoded.role;
        req.department = decoded.department;

        if (!req.role) {
            console.log('No role found in token');
            return res.status(401).json({ message: "Invalid token - no role found" });
        }

        // For department admins, ensure they have a department
        if (req.role === 'department_admin' && !req.department) {
            console.log('Department admin without department');
            return res.status(401).json({ message: "Invalid token - department admin without department" });
        }

        console.log('Authentication successful:', {
            role: req.role,
            department: req.department
        });
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token format" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired" });
        }
        return res.status(401).json({ message: "Authentication failed" });
    }
};

export default isAuthenticated;

const req = {
    id:"",
}
req.id = "sdlbgnjdfn"