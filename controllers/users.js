const JWT = require('jsonwebtoken')
const User = require('../models/user')
const { JWT_SECRET } = require('../configuration')

/**
 * Generate the token
 */
signToken = user => {
    return JWT.sign({
        iss: 'Itada',
        sub: user.id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 1)
    }, JWT_SECRET)
}

module.exports = {
    signUp: async (req, res, next) => {
        
        const { email, password } = req.value.body

        /* Check if user same email */
        const foundUser = await User.findOne({ 'local.email': email })
        if (foundUser) {
            return res.status(403).send({ error: `L'adresse email est déjà utilisé`})
        }

        const newUser = new User({
            method: 'local',
            local: {
                email: email, 
                password: password
            }
        })
        await newUser.save()

        /* Generate the token */
        const token = signToken(newUser)

        /* Response with token */
        res.status(200).json({ token })
    },
    signIn: async (req, res, next) => {
        // Generate token
        const token = signToken(req.user)
        res.status(200).json({ token })
        console.log('Successfull login');
    },
    googleOAuth: async (req, res, next) => {
        const token = signToken(req.user)
        res.status(200).json({ token })
    },
    facebookOAuth: async (req, res, next) => {
        const token = signToken(req.user)
        res.status(200).json({ token })
    },
    secret: async (req, res, next) => {
        console.log('I managed to get here !');
    },
}