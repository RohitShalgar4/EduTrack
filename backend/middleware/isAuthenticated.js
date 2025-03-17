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
            role: decoded.role || "student"
        });

        req.id = decoded.userId;
        req.role = decoded.role;

        if (!req.role) {
            console.log('No role found in token, defaulting to student');
            req.role = "student";
        }

        console.log('Authentication successful. Role:', req.role);
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