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
  phone_number?: string
  subject: string
  body: string
}

interface LeadResponse {
  success: boolean
  message: string
  emails_count: number
  emails: Lead[]
  contacts_file_path?: string
  companies_file_path?: string
}

interface EmailData {
  name: string
  email: string
  phone_number?: string
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

interface ContactData {
  company: string
  full_name: string
  phone_number?: string
  title: string
  linkedin_url?: string
  email: string
}

interface ContactsResponse {
  success: boolean
  message: string
  contacts_count: number
  contacts: ContactData[]
}

interface LeadGenerationResult {
  _id: string
  execution_date: string
  request_parameters: {
    topic: string
    niche: string
    no_of: string
    designation: string
    geospatial_area: string
    service: string
  }
  success: boolean
  message: string
  emails_count: number
  emails: Lead[]
  contacts_file_path?: string
  companies_file_path?: string
  execution_duration: number
  error_message?: string
}

interface LeadGenerationHistoryResponse {
  success: boolean
  message: string
  total_count: number
  results: LeadGenerationResult[]
}

export async function generateLeads(request: LeadRequest): Promise<LeadResponse> {
  const response = await fetch("/api/generate-leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function sendEmails(request: EmailRequest): Promise<EmailResponse> {
  const response = await fetch("/api/send-emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getContacts(baseFilename: string): Promise<ContactsResponse> {
  const response = await fetch(`/api/get-contacts/${baseFilename}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getTodaysLeads(): Promise<LeadGenerationHistoryResponse> {
  const response = await fetch("/api/leads/today", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getLeadsByDate(date: string): Promise<LeadGenerationHistoryResponse> {
  const response = await fetch(`/api/leads/date/${date}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}
