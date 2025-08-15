import { type NextRequest, NextResponse } from "next/server"

interface EmailData {
  name: string
  email: string
  subject: string
  body: string
}

interface EmailRequest {
  sender_email: string
  sender_password: string
  emails: EmailData[]
}

interface EmailResult {
  email: string
  name: string
  status: "success" | "failed"
  message: string
}

interface EmailResponse {
  success: boolean
  message: string
  sent_count: number
  failed_count: number
  results: EmailResult[]
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()

    // Validate required fields
    if (!body.sender_email || !body.sender_password || !body.emails || body.emails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          sent_count: 0,
          failed_count: 0,
          results: [],
        },
        { status: 400 },
      )
    }

    const results: EmailResult[] = []
    let sentCount = 0
    let failedCount = 0

    // Simulate email sending for each recipient
    for (const emailData of body.emails) {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simulate success/failure (85% success rate)
      const success = Math.random() > 0.15

      if (success) {
        results.push({
          email: emailData.email,
          name: emailData.name,
          status: "success",
          message: "Email sent successfully",
        })
        sentCount++
      } else {
        results.push({
          email: emailData.email,
          name: emailData.name,
          status: "failed",
          message: "Failed to send email - SMTP connection error",
        })
        failedCount++
      }
    }

    const response: EmailResponse = {
      success: true,
      message: `Email sending completed. Sent: ${sentCount}, Failed: ${failedCount}`,
      sent_count: sentCount,
      failed_count: failedCount,
      results: results,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error sending emails:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        sent_count: 0,
        failed_count: 0,
        results: [],
      },
      { status: 500 },
    )
  }
}
