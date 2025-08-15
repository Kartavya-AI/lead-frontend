import { type NextRequest, NextResponse } from "next/server"
import { makeVoiceAICall } from "@/lib/voice-ai-call"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, systemPrompt } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    const result = await makeVoiceAICall(phoneNumber, {
      systemPrompt:
        systemPrompt ||
        `Hello! I'm calling regarding your business inquiry. I'd like to discuss how our services can help you generate more leads and grow your business. Is this a good time to talk?`,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Voice call error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to make voice call" },
      { status: 500 },
    )
  }
}
