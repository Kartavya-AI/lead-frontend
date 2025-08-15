import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { date: string } }) {
  try {
    const { date } = params

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, message: "Invalid date format. Use YYYY-MM-DD", total_count: 0, results: [] },
        { status: 400 },
      )
    }

    // In a real implementation, this would connect to your FastAPI backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${backendUrl}/leads/date/${date}`, {
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
    console.error("Error fetching leads by date:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch leads for the specified date", total_count: 0, results: [] },
      { status: 500 },
    )
  }
}
