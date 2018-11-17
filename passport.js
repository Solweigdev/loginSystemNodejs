const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const { ExtractJwt } = require('passport-jwt')
const LocalStrategy = require('passport-local').Strategy
const FacebookTokenStrategy = require('passport-facebook-token')
const GooglePlusTokenStrategy = require('passport-google-plus-token')

const { JWT_SECRET } = require('./configuration')
const config = require('./configuration')
const User = require('./models/user')

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET
}, async (payload, done) => {
    try {
        // Find the user specified in token
        const user = await User.findById(payload.sub)
        // If user doesn't exists, handle it
        if (!user) {
            return done(null, false)
        }
        // Otherwise, return the user
        done(null, user)
    } catch(error) {
        done(error, false)
    }
}))

passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: '570640346856-79bfeh5its017iehgebidqcr9gngdj51.apps.googleusercontent.com',
    clientSecret: 'tjjTcCB0GoE2KAW9HAq3alVT'
}, async(accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ "google.id": profile.id })
        if (existingUser) {
            return done(null, existingUser)
        }
    
        const newUser = new User({
            method: 'google',
            google: {
                id: profile.id,
                email: profile.emails[0].value
            }
        })
    
        await newUser.save()
        done(null, newUser)
    } catch(error) {
        done(error, false, error.message)
    }
    
   
}))

passport.use('facebookToken', new FacebookTokenStrategy({
    clientID: config.oauth.facebook.clientID,
    clientSecret: config.oauth.facebook.clientSecret
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ "facebook.id": profile.id })
        if (existingUser) {
            return done(null, existingUser)
        }
        console.log("STEP 1", existingUser);
        
        const newUser = new User({
            method: 'facebook',
            facebook: {
                id: profile.id,
                email: profile.emails[0].value
            }
        })
        console.log("STEP 2", profile.emails[0].value);


        await newUser.save()
        done(null, newUser)
    } catch(error) {
        done(error, false, error.message)
    }
}))

passport.use(new LocalStrategy({
    usernameField: 'email',
}, async (email, password, done) => {
    try {
        // Find the user given the email
        const user = await User.findOne({ 'local.email': email })
        // If not, handle it
        if (!user) {
            return done(null, false)
        }
        // Check if password is correct
        const isMatch = await user.isValidPassword(password)

        // if not, handle it
        if (!isMatch) {
            return done(null, false)
        }

        // otherwise, return the user
        done(null, user)
    } catch(error) {
        done(error, false)
    }
    
}))