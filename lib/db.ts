import { neon } from '@neondatabase/serverless'

if (!process.env.NEON_URL) {
  throw new Error('NEON_URL must be set')
}

const sql = neon(process.env.NEON_URL)

// Initialize the users table
export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

// User operations
export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
}

export async function createUser(userData: {
  firstName: string
  lastName: string
  email: string
  passwordHash: string
}): Promise<User> {
  try {
    const [user] = await sql`
      INSERT INTO users (first_name, last_name, email, password_hash)
      VALUES (${userData.firstName}, ${userData.lastName}, ${userData.email}, ${userData.passwordHash})
      RETURNING *
    `
    return user as User
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    return user as User || null
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const [user] = await sql`
      SELECT * FROM users WHERE id = ${id}
    `
    return user as User || null
  } catch (error) {
    console.error('Error getting user by id:', error)
    throw error
  }
}

export { sql }
