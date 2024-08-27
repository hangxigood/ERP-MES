import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

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
  
          // Look up the user in the database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
  
          // If no user is found, return null
          if (!user) {
            return null;
          }
  
          // Compare the provided password with the stored hash
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  
          // If the password is invalid, return null
          if (!isPasswordValid) {
            return null;
          }
  
          // If everything is valid, return the user object
          return { id: user.id, name: user.name, email: user.email, role: user.role };
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
    }
  };

export default authOptions;