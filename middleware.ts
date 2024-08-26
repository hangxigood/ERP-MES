import { withAuth } from "next-auth/middleware"

// It checks if a user is authenticated (has a valid token) 
// before allowing access to specified routes.
export default withAuth(
  function middleware(req) {
    // Your custom middleware logic here
  },
  {
    callbacks: {
      // If the user has a valid token, allow access to the specified routes.
      authorized: ({ token }) => !!token
    },
  }
)

// Protect all routes except /login
export const config = { matcher: ["/((?!login).*)"] }