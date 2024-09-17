import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import dbConnect from './mongoose.js'; // Make sure this path is correct
import User from '../models/User.js'; // Import the User model

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
      CredentialsProvider({
        // The name to display on the sign in form (e.g. "Sign in with...")
        name: 'Credentials',
        // The credentials is used to generate a suitable form on the sign in page.
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        // The authorize method is used to validate the credentials
        async authorize(credentials) {
          // Check if email and password are provided
          if (!credentials.email || !credentials.password) {
            return null;
          }

          try {
            // Connect to your database
            await dbConnect();

            // Use the imported User model to query the database
            const user = await User.findOne({ email: credentials.email });

            // If no user is found, return null
            if (!user) {
              return null;
            }
  
            // Compare the provided password with the stored hash
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  
            // If the password is invalid, return null
            if (!isPasswordValid) {
              console.log("Invalid password for user:", credentials.email);
              return null;
            }

            console.log("User authenticated successfully:", credentials.email);
            // Return the user object with the access token
            return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
          } catch (error) {
            console.error("Error during authorization:", error);
            return null;
          }
        }
      })
    ],
    // Callbacks are asynchronous functions you can use to control what happens when an action is performed
    callbacks: {
      // The jwt callback is called whenever a JSON Web Token is created or updated
      async jwt({ token, user }) {
        if (user) {
          // Add role to the token
          // name and email are automatically added to the token by NextAuth
          token.role = user.role;
          token.id = user.id;
        }
        return token;
      },
      // The session callback is called whenever a session is checked
      async session({ session, token }) {
        // Add role from token to the session
        // name and email are automatically added to the session by NextAuth
        session.user.role = token.role;
        session.user.id = token.id;
        return session;
      }
    },
    // Custom pages for authentication
    pages: {
      signIn: '/login', // Custom sign-in page path
    },
    secret: process.env.NEXTAUTH_SECRET
  };

export default authOptions;