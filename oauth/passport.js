const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../connection/connection'); // Sesuaikan dengan koneksi database kamu
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const responsePayload = require('../payload');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile);

        // Cek apakah pengguna sudah ada di database
        const result = await db.query('SELECT * FROM "user" WHERE google_id = $1', [profile.id]);
        let user = result.rows[0];

        if (!user) {
          // Jika pengguna belum ada, buat pengguna baru
          const newUser = {
            id_user: uuidv4(),
            username: profile.displayName,
            email: profile.emails[0].value,
            google_id: profile.id,
            password: null, // NULL untuk pengguna Google
            profile_picture: profile.photos[0].value,
            role: 'Admin', // Default role
            created_at: new Date(),
            updated_at: new Date(),
          };

          const query =
            'INSERT INTO "user" (id_user, username, email, google_id, password,profile_picture, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
          const values = [
            newUser.id_user,
            newUser.username,
            newUser.email,
            newUser.google_id,
            newUser.password,
            newUser.profile_picture,
            newUser.role,
            newUser.created_at,
            newUser.updated_at,
          ];

          const insertResult = await db.query(query, values);
          user = insertResult.rows[0];
        }
        //generate token
        const token = jwt.sign(
          { id: user.id_user, email: user.email, role: user.role },
          process.env.SECRET_KEY,
          { expiresIn: '1h' }
        );
        const id_user = user.id_user;
        user.token = token;
        user.id_user = id_user;

        //mengembalikan user beserta token
        // return done(null, { id_user: user.id_user, token });

        console.log('User found/created:', user);
        return done(null, user);
      } catch (error) {
        console.error('Google Strategy error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize dan deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id_user);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM "user" WHERE id_user = $1', [id]);
    const user = result.rows[0];
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (error) {
    console.error('Deserialize user error:', error);
    done(error, null);
  }
});

module.exports = passport;
