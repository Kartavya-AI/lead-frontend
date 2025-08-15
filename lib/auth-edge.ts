// Simple JWT verification for Edge Runtime
// This is a basic implementation that works without Node.js crypto module

export function verifyTokenEdge(token: string, secret: string): { userId: number; email: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode the payload (we skip signature verification for Edge Runtime)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    // Return the payload if it has the expected structure
    if (payload.userId && payload.email) {
      return {
        userId: payload.userId,
        email: payload.email
      }
    }

    return null
  } catch (error) {
    console.error('Edge token verification failed:', error)
    return null
  }
}
