// Middleware to protect routes
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
      // authorized: ({ token }) => true
    },
  }
)

// Protect all routes except /login, /public, and /api
export const config = { matcher: ["/((?!login|forgot-password|reset-password|public|api).*)"] }