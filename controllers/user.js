// [SECTION] Dependencies and Modules
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth');
const { errorHandler } = require('../auth');

// [SECTION] Activity Solution

// Check if email exists
module.exports.checkEmailExists = (req, res) => {
    const email = req.body.email;

    if (typeof email !== 'string' || !email.includes("@")) {
        return res.status(400).send({ message: 'Invalid email format' });
    }

    User.find({ email: email })
    .then(result => {
        if (result.length > 0) {
            return res.status(409).send({ message: 'Duplicate email found' });
        } else {
            return res.status(404).send({ message: 'No duplicate email found' });
        }
    })
    .catch(err => errorHandler(err, req, res));
};

// Register user
module.exports.registerUser = (req, res) => {
    const { email, mobileNo, password, firstName, lastName } = req.body;

    if (typeof email !== 'string' || !email.includes("@")) {
        return res.status(400).send({ message: 'Invalid email format' });
    }
    if (typeof mobileNo !== 'string' || mobileNo.length !== 11) {
        return res.status(400).send({ message: 'Mobile number is invalid' });
    }
    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    }

    let newUser = new User({
        firstName,
        lastName,
        email,
        mobileNo,
        password: bcrypt.hashSync(password, 12)
    });

    newUser.save()
    .then(result => {
        res.status(201).send({
            message: 'User registered successfully',
            user: result
        });
    })
    .catch(error => errorHandler(error, req, res));
};

// LOGIN USER - FIXED
module.exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.includes("@")) {
        return res.status(400).send({ message: 'Invalid email format' });
    }
    if (typeof password !== 'string' || password.length === 0) {
        return res.status(400).send({ message: 'Password is required' });
    }

    User.findOne({ email: email })
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: 'No email found' });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);

        if (isPasswordCorrect) {
            return res.status(200).send({
                message: 'User logged in successfully',
                access: auth.createAccessToken(user)
            });
        } else {
            return res.status(401).send({ message: 'Incorrect email or password' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// Get user profile
module.exports.getProfile = (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send({ message: 'Unauthorized' });

    User.findById(userId)
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        user.password = undefined; // Do not send password
        return res.status(200).send(user);
    })
    .catch(err => errorHandler(err, req, res));
};

// Reset password
module.exports.resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).send({ message: 'Unauthorized' });
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).send({ message: 'Password must be at least 8 characters' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Update user profile
module.exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).send({ message: 'Unauthorized' });

        const { firstName, lastName, mobileNo } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, mobileNo },
            { new: true }
        );

        updatedUser.password = undefined;
        res.json(updatedUser);
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Update user to admin
module.exports.updateUserToAdmin = async (req, res) => {
    const { id } = req.body;

    try {
        const user = await User.findByIdAndUpdate(id, { isAdmin: true }, { new: true });

        if (!user) return res.status(404).json({ message: 'User not found.' });

        res.status(200).json({ message: "User has been updated to admin." });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user.', error: err.message });
    }
};
