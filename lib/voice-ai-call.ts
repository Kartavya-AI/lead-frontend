import twilio from "twilio"
import https from "https"

// ------------------------------------------------------------
// Types and Interfaces
// ------------------------------------------------------------
interface VoiceAICallOptions {
  systemPrompt?: string
  voice?: string
  temperature?: number
  model?: string
}

interface CallResult {
  success: boolean
  callSid: string
  destinationNumber: string
  fromNumber: string
  ultravoxJoinUrl: string
  timestamp: string
}

interface UltravoxCallConfig {
  systemPrompt: string
  model: string
  voice: string
  temperature: number
  firstSpeakerSettings: { user: Record<string, unknown> }
  medium: { twilio: Record<string, unknown> }
}

interface UltravoxResponse {
  joinUrl: string
  [key: string]: unknown
}

interface ConfigValidation {
  name: string
  value: string
  pattern: RegExp
}

// ------------------------------------------------------------
// Configuration - Set these values once
// ------------------------------------------------------------
const TWILIO_ACCOUNT_SID: string = process.env.TWILIO_ACCOUNT_SID || "your_twilio_account_sid_here"
const TWILIO_AUTH_TOKEN: string = process.env.TWILIO_AUTH_TOKEN || "your_twilio_auth_token_here"
const TWILIO_PHONE_NUMBER: string = process.env.TWILIO_PHONE_NUMBER || "your_twilio_phone_number_here"
const ULTRAVOX_API_KEY: string = process.env.ULTRAVOX_API_KEY || "your_ultravox_api_key_here"

// Default system prompt - can be overridden when calling the function
const DEFAULT_SYSTEM_PROMPT: string =
  "Your name is Steve and you are calling a person on the phone. Ask them their name and see how they are doing."

/**
 * Makes an outbound voice AI call using Ultravox and Twilio
 * @param destinationNumber - The phone number to call (E.164 format, e.g., +1234567890)
 * @param options - Optional configuration
 * @param options.systemPrompt - Custom system prompt for the AI
 * @param options.voice - Voice to use (default: 'Mark')
 * @param options.temperature - AI temperature (default: 0.3)
 * @param options.model - Ultravox model to use (default: 'fixie-ai/ultravox')
 * @returns Call details including Twilio Call SID
 */
export async function makeVoiceAICall(
  destinationNumber: string,
  options: VoiceAICallOptions = {},
): Promise<CallResult> {
  // Validate required configuration
  validateConfiguration()

  // Validate destination number
  if (!destinationNumber || !destinationNumber.match(/^\+[1-9]\d{1,14}$/)) {
    throw new Error("Invalid destination number. Must be in E.164 format (e.g., +1234567890)")
  }

  const {
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    voice = "Mark",
    temperature = 0.3,
    model = "fixie-ai/ultravox",
  } = options

  const ultravoxCallConfig: UltravoxCallConfig = {
    systemPrompt,
    model,
    voice,
    temperature,
    firstSpeakerSettings: { user: {} },
    medium: { twilio: {} },
  }

  try {
    console.log(`📞 Initiating voice AI call to ${destinationNumber}...`)

    // Step 1: Create Ultravox call
    console.log("🤖 Creating Ultravox call...")
    const ultravoxResponse: UltravoxResponse = await createUltravoxCall(ultravoxCallConfig)

    if (!ultravoxResponse.joinUrl) {
      throw new Error("No joinUrl received from Ultravox API")
    }

    console.log("✅ Got Ultravox joinUrl")

    // Step 2: Initiate Twilio call
    console.log("📱 Initiating Twilio call...")
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    const call = await client.calls.create({
      twiml: `<Response><Connect><Stream url="${ultravoxResponse.joinUrl}"/></Connect></Response>`,
      to: destinationNumber,
      from: TWILIO_PHONE_NUMBER,
    })

    const result: CallResult = {
      success: true,
      callSid: call.sid,
      destinationNumber,
      fromNumber: TWILIO_PHONE_NUMBER,
      ultravoxJoinUrl: ultravoxResponse.joinUrl,
      timestamp: new Date().toISOString(),
    }

    console.log("🎉 Voice AI call initiated successfully!")
    console.log(`📋 Twilio Call SID: ${call.sid}`)
    console.log(`📞 Calling ${destinationNumber} from ${TWILIO_PHONE_NUMBER}`)

    return result
  } catch (error) {
    console.error("💥 Error occurred during call initiation:")

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    if (errorMessage.includes("Authentication")) {
      console.error("   🔐 Authentication failed - check your Twilio credentials")
    } else if (errorMessage.includes("phone number")) {
      console.error("   📞 Phone number issue - verify your phone numbers are correct")
    } else if (errorMessage.includes("Ultravox")) {
      console.error("   🤖 Ultravox API issue - check your API key and try again")
    } else {
      console.error(`   ${errorMessage}`)
    }

    throw error
  }
}

/**
 * Validates all required configuration variables
 * @throws {Error} When configuration is invalid
 */
function validateConfiguration(): void {
  const requiredConfig: ConfigValidation[] = [
    { name: "TWILIO_ACCOUNT_SID", value: TWILIO_ACCOUNT_SID, pattern: /^AC[a-zA-Z0-9]{32}$/ },
    { name: "TWILIO_AUTH_TOKEN", value: TWILIO_AUTH_TOKEN, pattern: /^[a-zA-Z0-9]{32}$/ },
    { name: "TWILIO_PHONE_NUMBER", value: TWILIO_PHONE_NUMBER, pattern: /^\+[1-9]\d{1,14}$/ },
    { name: "ULTRAVOX_API_KEY", value: ULTRAVOX_API_KEY, pattern: /^[a-zA-Z0-9]{8}\.[a-zA-Z0-9]{32}$/ },
  ]

  const errors: string[] = []

  for (const config of requiredConfig) {
    if (!config.value || config.value.includes("your_") || config.value.includes("_here")) {
      errors.push(`❌ ${config.name} is not set or still contains placeholder text`)
    } else if (config.pattern && !config.pattern.test(config.value)) {
      errors.push(`❌ ${config.name} format appears invalid`)
    }
  }

  if (errors.length > 0) {
    console.error("🚨 Configuration Error(s):")
    errors.forEach((error) => console.error(`   ${error}`))
    console.error("\n💡 Please update the configuration variables at the top of this file:")
    console.error('   • TWILIO_ACCOUNT_SID should start with "AC" and be 34 characters')
    console.error("   • TWILIO_AUTH_TOKEN should be 32 characters")
    console.error("   • Phone numbers should be in E.164 format (e.g., +1234567890)")
    console.error("   • ULTRAVOX_API_KEY should be 8 chars + period + 32 chars")
    throw new Error("Configuration validation failed")
  }

  console.log("✅ Configuration validation passed!")
}

/**
 * Creates an Ultravox call with the given configuration
 * @param config - Ultravox call configuration
 * @returns Ultravox API response
 */
async function createUltravoxCall(config: UltravoxCallConfig): Promise<UltravoxResponse> {
  const ULTRAVOX_API_URL = "https://api.ultravox.ai/api/calls"

  const request = https.request(ULTRAVOX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ULTRAVOX_API_KEY,
    },
  })

  return new Promise<UltravoxResponse>((resolve, reject) => {
    let data = ""

    request.on("response", (response) => {
      response.on("data", (chunk: Buffer) => {
        data += chunk.toString()
      })

      response.on("end", () => {
        try {
          const parsedData = JSON.parse(data) as UltravoxResponse
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            resolve(parsedData)
          } else {
            reject(new Error(`Ultravox API error (${response.statusCode}): ${data}`))
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse Ultravox response: ${data}`))
        }
      })
    })

    request.on("error", (error: Error) => {
      reject(new Error(`Network error calling Ultravox: ${error.message}`))
    })

    request.write(JSON.stringify(config))
    request.end()
  })
}
