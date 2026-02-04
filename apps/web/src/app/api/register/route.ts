import { NextResponse } from 'next/server';
import { prisma } from '@doxie/db';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Enhanced validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'missing_fields' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'invalid_email' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long', code: 'weak_password' },
        { status: 400 }
      );
    }

    // Name validation - prevent empty names with spaces
    if (name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name cannot be empty', code: 'invalid_name' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists', code: 'email_exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create a new user
    const user = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            // authProviders: ['credentials'], // Not in Prisma schema explicitly, handled by logic
            // isVerified: false, // Not in schema, schema has emailVerified (DateTime)
            // lastLogin: new Date() // Not in schema
        }
    });

    // Return the user without the password
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while registering', code: 'server_error' },
      { status: 500 }
    );
  }
}
