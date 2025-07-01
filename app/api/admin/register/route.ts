import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, secret } = await request.json()

    // Validate secret key
    if (!secret || secret !== ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: "Invalid secret key" }, { status: 403 })
    }

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create admin user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    })

    await user.save()

    return NextResponse.json({ message: "Admin user created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Admin registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
