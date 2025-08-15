import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real implementation, this would connect to your FastAPI backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${backendUrl}/leads/today`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching today's leads:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch today's leads", total_count: 0, results: [] },
      { status: 500 },
    )
  }
}
