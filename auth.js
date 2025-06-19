// [SECTION] Dependencies and Modules

// Load the 'jsonwebtoken' package, used to generate and verify JWTs (JSON Web Tokens)
const jwt = require('jsonwebtoken');

// Load environment variables from the .env file into process.env
require('dotenv').config();

// [SECTION] JWT Token Creation

// This function generates a JWT access token containing limited user info
module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,         // MongoDB User ID
		email: user.email,    // User Email
		isAdmin: user.isAdmin // Admin status (true/false)
	};

	// Generate and return the signed JWT token using the secret key from the .env file
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
};

// [SECTION] Token Verification Middleware

// This middleware checks for a valid JWT token in the Authorization header
module.exports.verify = (req, res, next) => {
	// Log the value of the 'Authorization' header (usually "Bearer <token>")
	console.log(req.headers.authorization);

	// Extract the full token string from the Authorization header
	let token = req.headers.authorization;

	// If no token is provided, return 400 Bad Request
	if (typeof token === "undefined") {
		return res.status(400).send({ auth: "Failed. No Token" });
	} else {
		// Log the raw token value (including "Bearer ")
		console.log(token);

		// Remove the "Bearer " prefix (first 7 characters) to isolate the token
		token = token.slice(7, token.length);

		// Log the cleaned token
		console.log(token);

		// Verify the token using the same secret key
		jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decodedToken) {
			if (err) {
				// Token is invalid or expired — send 403 Forbidden
				return res.status(403).send({
					auth: "Failed",
					message: err.message
				});
			} else {
				// Token is valid — store decoded data in req.user and continue
				console.log('Result from verify method:');
				console.log(decodedToken);

				req.user = decodedToken;
				next(); // Proceed to the next middleware or route handler
			}
		});
	}
};

// [SECTION] Admin Verification Middleware

// This middleware checks if the logged-in user is an admin
module.exports.verifyAdmin = (req, res, next) => {
	if (req.user.isAdmin) {
		// If user is admin, continue
		next();
	} else {
		// Otherwise, deny access
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		});
	}
};

// [SECTION] Centralized Error Handler Middleware

// This middleware handles all errors in a consistent way across the app
module.exports.errorHandler = (err, req, res, next) => {
	console.log(err);

	const statusCode = err.status || 500;
	const errorMessage = err.message || 'Internal Server Error';

	// Send a structured error response
	return res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}
	});
};
