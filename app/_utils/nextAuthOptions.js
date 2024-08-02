import bcrypt from 'bcrypt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getConnection } from '../_utils/db'; // Adjust the path as necessary

const nextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                const connection = await getConnection();
                try {
                    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [credentials.username]);
                    if (rows.length > 0) {
                        const user = rows[0];
                        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                        if (isPasswordValid) {
                            return { id: user.id, name: user.username, email: user.email }; // Adjust the fields as necessary
                        }
                    }
                    return null;
                } catch (error) {
                    console.error(error);
                    return null;
                } finally {
                    await connection.end();
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            return session;
        }
    },
    session: {
        jwt: true,
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default nextAuthOptions;
