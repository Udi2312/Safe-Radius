import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import CryptoJS from "crypto-js"
import { connectDB } from "@/lib/mongodb"
import POI from "@/models/POI"
import { IndentIncreaseIcon } from "lucide-react"

const JWT_SECRET = process.env.JWT_SECRET || "saferadius-jwt-secret-2025"
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "saferadius-secret-key-2025"

interface DecodedToken {
  userId: string
  email: string
  role: string
}

async function geocodeAddress(
  // address: string,
  area: string,
  city: string,
  pinCode: string,
  Country: string 
): Promise<{ lat: number; lon: number } | null> {
  try {
    const fullAddress = `${area}, ${city}, ${pinCode}, ${Country}`; // Include country!
    const encodedAddress = encodeURIComponent(fullAddress);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          "User-Agent": "SafeRadius/1.0 (udit.ban2312@gmail.com)", // This is required!
        },
      }
    );

    if (!response.ok) {
      console.error("Nominatim returned status:", response.status);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }

    console.warn("No location data found for:", fullAddress);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}


function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: DecodedToken

    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Check if user has owner or admin role
    if (!["owner", "admin"].includes(decoded.role)) {
      return NextResponse.json({ message: "Insufficient permissions" }, { status: 403 })
    }

    const { name, address, area, city, pinCode, category } = await request.json()

    // Validate input
    if (!name || !address || !area || !city || !pinCode || !category) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    await connectDB()

    // Geocode the address
    const coordinates = await geocodeAddress( area, city, pinCode, "India")
    if (!coordinates) {
      return NextResponse.json(
        { message: "Unable to geocode the provided address. Please check the address details." },
        { status: 400 },
      )
    }

    // Encrypt sensitive data
    const encryptedName = encryptData(name)
    const encryptedLat = encryptData(coordinates.lat.toString())
    const encryptedLon = encryptData(coordinates.lon.toString())

    // Create POI
    const poi = new POI({
      encryptedName,
      encryptedLat,
      encryptedLon,
      category,
      createdBy: decoded.userId,
      // Store unencrypted data for admin purposes
      name,
      address,
      area,
      city,
      pinCode,
    })

    await poi.save()

    return NextResponse.json({ message: "POI added successfully", poiId: poi._id }, { status: 201 })
  } catch (error) {
    console.error("Add POI error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
