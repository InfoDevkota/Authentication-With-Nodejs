import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';

export const isAuth = (req, res, next) => {
    // console.log(req.headers)
    if (!req.headers.authorization) {
        return res.statsu(401).json({
            message: "Authorization Header missing"
        })
    }
    let authorization = req.headers.authorization;
    let token = authorization.split(" ")[1];
    // console.log(token);

    let jwtData;
    try {
        jwtData = jwt.verify(token, JWT_SECRET);

    } catch (error) {
        console.log(error);

        return res.status(401).json({
            message: "Invalid Token."
        })
    }

    req.user = jwtData.user;
    next();

}