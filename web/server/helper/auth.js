import jwt from "jsonwebtoken"

const { verify } = jwt

const Authentication = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Extract token after "Bearer"
    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }
    verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' })
        }
        req.user = decoded; // Attach decoded info to request
        next()
    })
}

export { Authentication }