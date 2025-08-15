import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, initDB } from '@/lib/db'
import { hashPassword, generateToken, isValidEmail, isValidPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Initialize DB on first request
    await initDB()

    const body = await request.json()
    const { firstName, lastName, email, password } = body

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain at least one letter and one number' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash
    })

    // Generate JWT token
    const token = generateToken(user.id, user.email)

    // Create response
    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email
        }
      },
      { status: 201 }
    )

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
