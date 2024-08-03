import { withAuth } from "next-auth/middleware";

export default withAuth(
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("Authorized callback, token: ", token);
        return !!token;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);
export const config = {
  matcher: ["/((?!auth|api/register).*)"],
};