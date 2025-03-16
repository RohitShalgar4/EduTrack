import { Admin } from "../models/adminModel.js";

const isAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.id);
        if (!admin) {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export default isAdmin; 