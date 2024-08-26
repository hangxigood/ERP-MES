import { withAuth } from "next-auth/middleware"


export default withAuth(
  function middleware(req) {
    // Your custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

// Protect all routes under /batch-record-system
export const config = { matcher: ["/records/:path*"] }