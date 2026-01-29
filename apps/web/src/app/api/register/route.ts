import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

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

    // Connect to the database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists', code: 'email_exists' },
        { status: 409 }
      );
    }

    // Create a new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save hook
      authProviders: ['credentials'],
      isVerified: false,
      lastLogin: new Date()
    });

    // Save the user to the database
    await user.save();

    // Return the user without the password
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors.join(', '),
          code: 'validation_error'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred while registering', code: 'server_error' },
      { status: 500 }
    );
  }
}