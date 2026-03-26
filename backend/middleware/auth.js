import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const handleRegister = async () => {
    const cleanUsername = username.trim().toLowerCase();

    const usernameRegex = /^[a-z][a-z0-9]*$/;

    if (!usernameRegex.test(cleanUsername)) {
        alert("Username must start with a letter and contain only lowercase letters and numbers (no spaces).");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstName,
                lastName,
                username: cleanUsername,
                email,
                password,
                dob
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(data));
        onLogin(data);

    } catch (err) {
        console.error(err);
        alert("Something went wrong");
    }
};

export const protect = async (req, res, next) => {
    console.log("Protect middleware called");
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
        
        const decoded  = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password');

        next();

        return;

        } catch (err) {
            console.error("Token verification failed: ", err.message);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    return res.status(401).json({ message: "Not authorized, no token" });
};