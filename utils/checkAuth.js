import jwt from "jsonwebtoken";

export default (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, "")

    if (token) {
        try {
            const decoded = jwt.verify(token, "secret123")
            console.log("Token decoded successfully:", decoded);
            req.userId = decoded._id
            next()

        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(403).json({
                message: "Нет доступа"
            })
        }

    } else {
        return res.status(403).json({
            message: "Нет доступа"
        })
    }
}