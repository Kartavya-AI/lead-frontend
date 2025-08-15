import { type NextRequest, NextResponse } from "next/server"

interface LeadRequest {
  size: string
  niche: string
  no_of: string
  designation: string
  geospatial_area: string
  service: string
  gemini_api_key?: string
  hunter_api_key?: string
  serper_api_key?: string
  model_choice: string
}

interface Lead {
  name: string
  email: string
  phone_number?: string // Added phone_number field
  subject: string
  body: string
}

interface LeadResponse {
  success: boolean
  message: string
  emails_count: number
  emails: Lead[]
  contacts_file_path?: string // Added optional file paths
  companies_file_path?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadRequest = await request.json()

    // Validate required fields
    if (!body.size || !body.niche || !body.no_of || !body.designation || !body.geospatial_area || !body.service) {
      return NextResponse.json(
        { success: false, message: "Missing required fields", emails_count: 0, emails: [] },
        { status: 400 },
      )
    }

    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock leads based on the request
    const numberOfLeads = Number.parseInt(body.no_of) || 5
    const mockLeads: Lead[] = Array.from({ length: numberOfLeads }, (_, i) => {
      const companyTypes = ["Tech", "Solutions", "Systems", "Group", "Corp", "Inc", "LLC"]
      const domains = ["tech", "solutions", "systems", "corp", "inc"]
      const firstNames = [
        "John",
        "Sarah",
        "Michael",
        "Emily",
        "David",
        "Lisa",
        "Robert",
        "Jennifer",
        "William",
        "Amanda",
      ]
      const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
      ]

      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const companyType = companyTypes[Math.floor(Math.random() * companyTypes.length)]
      const domain = domains[Math.floor(Math.random() * domains.length)]

      const companyName = `${body.niche} ${companyType} ${i + 1}`
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${body.niche.toLowerCase().replace(/\s+/g, "")}${domain}.com`

      const phoneNumber = `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`

      return {
        name: `${firstName} ${lastName}`,
        email: email,
        phone_number: phoneNumber, // Include phone number in response
        subject: `${body.service} Partnership Opportunity for ${companyName}`,
        body: `Hi ${firstName},

I hope this email finds you well. I'm reaching out regarding our ${body.service} services that could significantly benefit ${body.niche} companies like ${companyName} in the ${body.geospatial_area} market.

As a ${body.designation}, I believe you'd be interested in learning how we've helped similar ${body.size} companies in your industry achieve:

• Increased operational efficiency
• Enhanced market presence
• Improved customer satisfaction
• Measurable ROI within the first quarter

Would you be available for a brief 15-minute conversation this week to explore how our ${body.service} solutions could specifically benefit ${companyName}?

I'd be happy to share some relevant case studies from other ${body.niche} companies we've worked with in ${body.geospatial_area}.

Best regards,
Your Sales Team

P.S. I've attached a brief overview of our recent success stories in the ${body.niche} sector.`,
      }
    })

    const baseFilename =
      `${body.size}_${body.niche}_${body.designation}_${body.geospatial_area}_${body.service}`.replace(/\s+/g, "_")

    const response: LeadResponse = {
      success: true,
      message: "Leads generated successfully",
      emails_count: mockLeads.length,
      emails: mockLeads,
      contacts_file_path: `output/${baseFilename}_contacts.json`, // Added file paths
      companies_file_path: `output/${baseFilename}_companies.json`,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error generating leads:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", emails_count: 0, emails: [] },
      { status: 500 },
    )
  }
}
