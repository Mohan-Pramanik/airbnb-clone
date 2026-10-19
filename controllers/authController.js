const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        currentPage: 'Login',
        isLoggedIn: false,
        editing: false,
        oldInputs: {},
        user: req.session.user
    });
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.render('auth/login', {
            pageTitle: 'Login',
            currentPage: 'Login',
            isLoggedIn: false,
            errors: ['User does not exist'],
            oldInputs: { email },
            user: req.session.user
        });
    };

    //user is come from this line:  const user  = await User.findOne({email: email}); previously mention in the postLogin code
    const isMathch = await bcrypt.compare(password, user.password);
    if (!isMathch) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            currentPage: 'Login',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
            errors: ['Invalid Password'],
            oldInputs: { email },
        });
    }
    req.session.isLoggedIn = true;
    req.session.user = {
        id: user._id.toString(),
        firstName: user.firstName,
        email: user.email,
        userType: user.userType,
    };
    await req.session.save(); // Ensure the session is saved before redirecting
    res.redirect('/');

};

exports.postLogout = (req, res, next) => {
    console.log("Logging out user");
    req.session.destroy(() => {
        res.redirect('/login');
    })

};

exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Sign Up',
        currentPage: 'signup',
        isLoggedIn: false,
        editing: false,
        oldInputs: {},
        user: req.session.user
    });
};

exports.postSignUp = [
    //vaidation for the first name
    check("firstName")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("First name must be between 2 and 100 characters long")
        .matches(/^[A-Za-z]+$/)
        .withMessage("First name must contain only letters"),

    //Validation for the last name
    check("lastName")
        .trim()
        .matches(/^[A-Za-z]*$/)
        .withMessage("Last name must contain only letters"),

    //validation for the email
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email address")
        .normalizeEmail(),

    //validation for the password
    check("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[\W_]/)
        .withMessage("Password must contain at least one special character"),

    //validation for the confirm password
    check("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    check("userType")
        .isIn(["guest", "host"])
        .withMessage("Please select a valid user type"),

    check("termAccept")
        .equals("termAccept")
        .withMessage("You must accept the terms and conditions"),

    (req, res, next) => {
        // Handle sign-up logic here
        const { firstName, lastName, email, password, userType } = req.body;
        const errors = validationResult(req);
        //if there are errors, render the signup page with error messages and old input values
        if (!errors.isEmpty()) {
            return res.render('auth/signup', {
                pageTitle: 'Sign Up',
                currentPage: 'signup',
                isLoggedIn: false,
                errors: errors.array().map((error) => error.msg),
                oldInputs: { firstName, lastName, email, userType },
                user: req.session.user
            });
        }


        //Error is Empty, proceed with sign-up logic (e.g., save user to database)
        bcrypt.hash(password, 12)
            .then((hashedPassword) => {
                const user = new User({ firstName, lastName, email, password: hashedPassword, userType });
                return user.save();
            })
            .then(() => {
                res.redirect('/login');
            }).catch((err) => {
                return res.render('auth/signup', {
                    pageTitle: 'Sign Up',
                    currentPage: 'signup',
                    isLoggedIn: false,
                    err: [err.message],
                    oldInputs: { firstName, lastName, email, userType },
                    user: req.session.user
                });
            });
    }
];