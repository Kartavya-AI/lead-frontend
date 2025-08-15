"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Mail,
  Phone,
  Target,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Zap,
  AlertCircle,
  LogOut,
  Eye,
  Calendar,
  CalendarDays,
  CheckCircle,
  Settings,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import {
  generateLeads,
  sendEmails,
  getTodaysLeads,
  getLeadsByDate,
} from "@/lib/api"

// Define types locally since they're not exported from lib/api
type LeadRequest = {
  size: string
  niche: string
  no_of: string
  designation: string
  geospatial_area: string
  service: string
  model_choice: string
}

type Lead = {
  name: string
  email: string
  phone?: string
  subject: string
  body: string
}

type LeadGenerationResult = {
  success: boolean
  message?: string
  emails: Lead[]
}

type EmailStatus = {
  leadIndex: number
  status: "idle" | "sending" | "sent" | "failed"
  message?: string
}

type CallStatus = "idle" | "calling" | "called" | "failed"

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [leadGenerations, setLeadGenerations] = useState<LeadGenerationResult[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null)

  const [leads, setLeads] = useState<Lead[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set())
  const [emailsSent, setEmailsSent] = useState(0)
  const [callsMade, setCallsMade] = useState(0)
  const [emailStatuses, setEmailStatuses] = useState<Map<number, EmailStatus>>(new Map())
  const [callStatuses, setCallStatuses] = useState<Map<string, CallStatus>>(new Map())
  const [error, setError] = useState<string>("")

  // Email modal states
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [currentLead, setCurrentLead] = useState<Lead | null>(null)
  const [currentLeadIndex, setCurrentLeadIndex] = useState<number | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [senderPassword, setSenderPassword] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [showBulkEmail, setShowBulkEmail] = useState(false)

  // Subject preview dialog states
  const [showSubjectDialog, setShowSubjectDialog] = useState(false)
  const [selectedLeadForPreview, setSelectedLeadForPreview] = useState<Lead | null>(null)

  const [formData, setFormData] = useState<LeadRequest>({
    size: "",
    niche: "",
    no_of: "",
    designation: "",
    geospatial_area: "",
    service: "",
    model_choice: "gemini/gemini-2.5-flash-preview-05-20",
  })
  const router = useRouter()

  useEffect(() => {
    loadLeadsForDate(selectedDate)
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/user", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
        setSenderEmail(data.user.email)
      }
    } catch (error) {
      console.error("Error loading user info:", error)
    }
  }

  const loadLeadsForDate = async (date: string) => {
    setIsLoadingLeads(true)
    setError("")
    try {
      let response
      const today = new Date().toISOString().split("T")[0]

      if (date === today) {
        response = await getTodaysLeads()
      } else {
        response = await getLeadsByDate(date)
      }

      if (response.success) {
        setLeadGenerations(response.results)
        // Flatten all leads from all generations for the selected date
        const flattenedLeads = response.results.flatMap((result) => result.emails || [])
        setAllLeads(flattenedLeads)
        setLeads(flattenedLeads)
      } else {
        setError(response.message || "Failed to load leads")
        setLeadGenerations([])
        setAllLeads([])
        setLeads([])
      }
    } catch (error) {
      console.error("Error loading leads:", error)
      setError("Failed to load leads for the selected date")
      setLeadGenerations([])
      setAllLeads([])
      setLeads([])
    } finally {
      setIsLoadingLeads(false)
    }
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    loadLeadsForDate(date)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always redirect to home page
      router.push("/")
    }
  }

  const handleInputChange = (field: keyof LeadRequest, value: string) => {
    setFormData((prev: LeadRequest) => ({ ...prev, [field]: value }))
  }

  // Updated generateLeads to use real API
  const handleGenerateLeads = async () => {
    setIsGenerating(true)
    setError("")

    try {
      const response = await generateLeads(formData)
      if (response.success) {
        setLeads(response.emails)
        setShowForm(false)
        await loadLeadsForDate(selectedDate)
        // Reset form
        setFormData({
          size: "",
          niche: "",
          no_of: "",
          designation: "",
          geospatial_area: "",
          service: "",
          model_choice: "gemini/gemini-2.5-flash-preview-05-20",
        })
      } else {
        setError(response.message || "Failed to generate leads")
      }
    } catch (error) {
      console.error("Error generating leads:", error)
      setError("Failed to generate leads. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const openEmailModal = (lead: Lead, index: number) => {
    setCurrentLead(lead)
    setCurrentLeadIndex(index)
    setEmailSubject(lead.subject)
    setEmailBody(lead.body)
    setSenderEmail(currentUser?.email || "")
    setShowEmailModal(true)
  }

  const openBulkEmailModal = () => {
    if (selectedLeads.size === 0) {
      alert("Please select leads to send emails to")
      return
    }
    setShowBulkEmail(true)
    setSenderEmail(currentUser?.email || "")
  }

  // Updated sendSingleEmail to use real API
  const sendSingleEmail = async () => {
    if (!currentLead || currentLeadIndex === null) return

    setIsSendingEmail(true)
    setEmailStatuses(
      (prev) =>
        new Map(
          prev.set(currentLeadIndex, {
            leadIndex: currentLeadIndex,
            status: "sending",
          }),
        ),
    )

    try {
      const emailRequest = {
        sender_email: senderEmail,
        sender_password: senderPassword,
        emails: [
          {
            name: currentLead.name,
            email: currentLead.email,
            subject: emailSubject,
            body: emailBody,
          },
        ],
      }

      const response = await sendEmails(emailRequest)

      if (response.success && response.results.length > 0) {
        const result = response.results[0]

        if (result.status === "success") {
          setEmailStatuses(
            (prev) =>
              new Map(
                prev.set(currentLeadIndex, {
                  leadIndex: currentLeadIndex,
                  status: "sent",
                  message: result.message,
                }),
              ),
          )
          setEmailsSent((prev) => prev + 1)
        } else {
          setEmailStatuses(
            (prev) =>
              new Map(
                prev.set(currentLeadIndex, {
                  leadIndex: currentLeadIndex,
                  status: "failed",
                  message: result.message,
                }),
              ),
          )
        }
      }

      setShowEmailModal(false)
    } catch (error) {
      console.error("Error sending email:", error)
      setEmailStatuses(
        (prev) =>
          new Map(
            prev.set(currentLeadIndex, {
              leadIndex: currentLeadIndex,
              status: "failed",
              message: "Network error",
            }),
          ),
      )
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Updated sendBulkEmails to use real API
  const sendBulkEmails = async () => {
    setIsSendingEmail(true)
    const selectedIndices = Array.from(selectedLeads)

    // Set all selected leads to sending status
    const newStatuses = new Map(emailStatuses)
    selectedIndices.forEach((index) => {
      newStatuses.set(index, { leadIndex: index, status: "sending" })
    })
    setEmailStatuses(newStatuses)

    try {
      const emailsToSend = selectedIndices.map((index) => ({
        name: leads[index].name,
        email: leads[index].email,
        subject: leads[index].subject,
        body: leads[index].body,
      }))

      const emailRequest = {
        sender_email: senderEmail,
        sender_password: senderPassword,
        emails: emailsToSend,
      }

      const response = await sendEmails(emailRequest)

      if (response.success) {
        // Update status for each email based on API response
        response.results.forEach((result, resultIndex) => {
          const leadIndex = selectedIndices[resultIndex]
          if (result.status === "success") {
            setEmailStatuses(
              (prev) =>
                new Map(
                  prev.set(leadIndex, {
                    leadIndex: leadIndex,
                    status: "sent",
                    message: result.message,
                  }),
                ),
            )
          } else {
            setEmailStatuses(
              (prev) =>
                new Map(
                  prev.set(leadIndex, {
                    leadIndex: leadIndex,
                    status: "failed",
                    message: result.message,
                  }),
                ),
            )
          }
        })

        setEmailsSent((prev) => prev + response.sent_count)
      }
    } catch (error) {
      console.error("Error sending bulk emails:", error)
      // Set all to failed status
      selectedIndices.forEach((index) => {
        setEmailStatuses(
          (prev) =>
            new Map(
              prev.set(index, {
                leadIndex: index,
                status: "failed",
                message: "Network error",
              }),
            ),
        )
      })
    } finally {
      setSelectedLeads(new Set())
      setShowBulkEmail(false)
      setIsSendingEmail(false)
    }
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleLeadSelection = (index: number) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedLeads(newSelected)
  }

  const getEmailButtonContent = (index: number) => {
    const status = emailStatuses.get(index)
    if (!status) {
      return (
        <>
          <Mail className="h-4 w-4 mr-1" />
          Email
        </>
      )
    }

    switch (status.status) {
      case "sending":
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
            Sending...
          </>
        )
      case "sent":
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Sent
          </>
        )
      case "failed":
        return (
          <>
            <AlertCircle className="h-4 w-4 mr-1" />
            Failed
          </>
        )
      default:
        return (
          <>
            <Mail className="h-4 w-4 mr-1" />
            Email
          </>
        )
    }
  }

  const getEmailButtonStyle = (index: number) => {
    const status = emailStatuses.get(index)
    if (!status) return "bg-amber-500 hover:bg-amber-600 text-white"

    switch (status.status) {
      case "sending":
        return "bg-blue-500 text-white cursor-not-allowed"
      case "sent":
        return "bg-green-500 text-white cursor-default"
      case "failed":
        return "bg-red-500 hover:bg-red-600 text-white"
      default:
        return "bg-amber-500 hover:bg-amber-600 text-white"
    }
  }

  const openSubjectPreview = (lead: Lead) => {
    setSelectedLeadForPreview(lead)
    setShowSubjectDialog(true)
  }

  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "User"
  const userEmail = currentUser?.email || ""

  const makeCall = async (lead: Lead) => {
    if (!lead.phone) {
      alert("No phone number available for this lead")
      return
    }

    setCallStatuses((prev) => ({ ...prev, [lead.email]: "calling" }))

    try {
      const response = await fetch("/api/voice-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: lead.phone,
          systemPrompt: `Hello! I'm calling ${lead.name} regarding your business inquiry about ${lead.subject}. I'd like to discuss how our services can help you generate more leads and grow your business. Is this a good time to talk?`,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setCallStatuses((prev) => ({ ...prev, [lead.email]: "called" }))
        setCallsMade((prev) => prev + 1)
        alert(`Call initiated successfully! Call SID: ${result.callSid}`)
      } else {
        throw new Error(result.error || "Failed to make call")
      }
    } catch (error) {
      console.error("Call error:", error)
      setCallStatuses((prev) => ({ ...prev, [lead.email]: "failed" }))
      alert(`Failed to make call: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const getCallButtonContent = (lead: Lead) => {
    const status = callStatuses.get(lead.email)
    if (!status) {
      return (
        <>
          <Phone className="h-4 w-4 mr-1" />
          Call
        </>
      )
    }

    switch (status) {
      case "calling":
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
            Calling...
          </>
        )
      case "called":
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Called
          </>
        )
      case "failed":
        return (
          <>
            <AlertCircle className="h-4 w-4 mr-1" />
            Failed
          </>
        )
      default:
        return (
          <>
            <Phone className="h-4 w-4 mr-1" />
            Call
          </>
        )
    }
  }

  const getCallButtonStyle = (lead: Lead) => {
    const status = callStatuses.get(lead.email)
    if (!status) return "bg-green-500 hover:bg-green-600 text-white"

    switch (status) {
      case "calling":
        return "bg-blue-500 text-white cursor-not-allowed"
      case "called":
        return "bg-green-600 text-white cursor-default"
      case "failed":
        return "bg-red-500 hover:bg-red-600 text-white"
      default:
        return "bg-green-500 hover:bg-green-600 text-white"
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-white to-cyan-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-cyan-800" />
                <span className="text-2xl font-bold text-cyan-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  LeadGen Pro
                </span>
              </div>
              <Badge className="bg-amber-100 text-amber-800">Dashboard</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-300 bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-300 bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-cyan-800" />
                <Label htmlFor="date-select" className="text-sm font-medium text-slate-700">
                  Select Date:
                </Label>
                <Input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-auto border-slate-300"
                />
              </div>
              {isLoadingLeads && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-800"></div>
                  <span className="text-sm">Loading leads...</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <CalendarDays className="h-4 w-4" />
              <span>
                {leadGenerations.length} generation{leadGenerations.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-cyan-800" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {allLeads.length}
                </div>
                <p className="text-xs text-slate-500">
                  {selectedDate === new Date().toISOString().split("T")[0]
                    ? "Generated today"
                    : `Generated on ${selectedDate}`}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Successful Generations</CardTitle>
                <Target className="h-4 w-4 text-cyan-800" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {leadGenerations.filter((gen) => gen.success).length}
                </div>
                <p className="text-xs text-slate-500">
                  {leadGenerations.length > 0
                    ? `${Math.round((leadGenerations.filter((gen) => gen.success).length / leadGenerations.length) * 100)}% success rate`
                    : "No data"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Emails Sent</CardTitle>
                <Mail className="h-4 w-4 text-cyan-800" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {emailsSent}
                </div>
                <p className="text-xs text-slate-500">
                  {allLeads.length > 0 ? `${allLeads.length - emailsSent} remaining` : "Ready to send"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Calls Made</CardTitle>
                <Phone className="h-4 w-4 text-cyan-800" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {callsMade}
                </div>
                <p className="text-xs text-slate-500">
                  {allLeads.length > 0 ? `${allLeads.length - callsMade} remaining` : "Ready to call"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Lead Generation Form */}
          {showForm && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Generate New Leads
                </CardTitle>
                <CardDescription>Configure your lead generation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-slate-700 font-medium">
                      Company Size
                    </Label>
                    <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1-50 employees)</SelectItem>
                        <SelectItem value="mid">Mid (51-500 employees)</SelectItem>
                        <SelectItem value="large">Large (500+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="niche" className="text-slate-700 font-medium">
                      Industry Niche
                    </Label>
                    <Input
                      id="niche"
                      placeholder="e.g., SaaS, E-commerce, Healthcare"
                      value={formData.niche}
                      onChange={(e) => handleInputChange("niche", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="no_of" className="text-slate-700 font-medium">
                      Number of Leads
                    </Label>
                    <Input
                      id="no_of"
                      type="number"
                      placeholder="e.g., 10"
                      value={formData.no_of}
                      onChange={(e) => handleInputChange("no_of", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation" className="text-slate-700 font-medium">
                      Target Designation
                    </Label>
                    <Input
                      id="designation"
                      placeholder="e.g., CEO, CTO, Marketing Manager"
                      value={formData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="geospatial_area" className="text-slate-700 font-medium">
                      Geographic Area
                    </Label>
                    <Input
                      id="geospatial_area"
                      placeholder="e.g., San Francisco, New York, Global"
                      value={formData.geospatial_area}
                      onChange={(e) => handleInputChange("geospatial_area", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-slate-700 font-medium">
                      Your Service
                    </Label>
                    <Input
                      id="service"
                      placeholder="e.g., Web Development, Marketing, Consulting"
                      value={formData.service}
                      onChange={(e) => handleInputChange("service", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <Button variant="outline" onClick={() => setShowForm(false)} className="border-slate-300">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateLeads}
                    disabled={isGenerating || !formData.size || !formData.niche || !formData.no_of}
                    className="bg-cyan-800 hover:bg-cyan-900 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Leads
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    Leads for {selectedDate === new Date().toISOString().split("T")[0] ? "Today" : selectedDate}
                  </CardTitle>
                  <CardDescription>
                    {leadGenerations.length > 0
                      ? `${leadGenerations.length} generation${leadGenerations.length !== 1 ? "s" : ""} • ${allLeads.length} total leads`
                      : "No lead generations found for this date"}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedLeads.size > 0 && (
                    <Button
                      onClick={openBulkEmailModal}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                      disabled={isSendingEmail}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Email Selected ({selectedLeads.size})
                    </Button>
                  )}
                  {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="bg-cyan-800 hover:bg-cyan-900 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Leads
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {allLeads.length > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-300"
                    />
                  </div>
                  <Button variant="outline" className="border-slate-300 bg-transparent">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" className="border-slate-300 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              )}

              {allLeads.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3
                    className="text-lg font-medium text-slate-900 mb-2"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {isLoadingLeads ? "Loading leads..." : "No leads found"}
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {isLoadingLeads
                      ? "Please wait while we fetch your leads..."
                      : selectedDate === new Date().toISOString().split("T")[0]
                        ? "Generate your first leads to start building your pipeline."
                        : `No leads were generated on ${selectedDate}. Try selecting a different date or generate new leads.`}
                  </p>
                  {!isLoadingLeads && (
                    <Button onClick={() => setShowForm(true)} className="bg-cyan-800 hover:bg-cyan-900 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Your First Leads
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-slate-700">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-cyan-800 focus:ring-cyan-800"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLeads(new Set(Array.from({ length: filteredLeads.length }, (_, i) => i)))
                                } else {
                                  setSelectedLeads(new Set())
                                }
                              }}
                            />
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-slate-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-700">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-700">Phone</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-700">Subject</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredLeads.map((lead, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedLeads.has(index)}
                                onChange={() => toggleLeadSelection(index)}
                                className="rounded border-slate-300 text-cyan-800 focus:ring-cyan-800"
                              />
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900">{lead.name}</td>
                            <td className="py-3 px-4 text-slate-600">{lead.email}</td>
                            <td className="py-3 px-4 text-slate-600">
                              {lead.phone ? (
                                <a href={`tel:${lead.phone}`} className="text-cyan-800 hover:underline">
                                  {lead.phone}
                                </a>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600 max-w-xs">
                              <button
                                onClick={() => openSubjectPreview(lead)}
                                className="text-left hover:text-cyan-800 hover:underline transition-colors truncate block w-full"
                                title="Click to view full subject and message"
                              >
                                {lead.subject}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                {emailStatuses.get(index) && (
                                  <Badge
                                    className={
                                      emailStatuses.get(index)!.status === "sent"
                                        ? "bg-green-100 text-green-800"
                                        : emailStatuses.get(index)!.status === "failed"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-blue-100 text-blue-800"
                                    }
                                  >
                                    Email: {emailStatuses.get(index)!.status}
                                  </Badge>
                                )}
                                {callStatuses.get(lead.email) && (
                                  <Badge
                                    className={
                                      callStatuses.get(lead.email) === "called"
                                        ? "bg-green-100 text-green-800"
                                        : callStatuses.get(lead.email) === "failed"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-blue-100 text-blue-800"
                                    }
                                  >
                                    Call: {callStatuses.get(lead.email)}
                                  </Badge>
                                )}
                                {!emailStatuses.get(index) && !callStatuses.get(lead.email) && (
                                  <Badge className="bg-slate-100 text-slate-600">Ready</Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  className={getEmailButtonStyle(index)}
                                  onClick={() => openEmailModal(lead, index)}
                                  disabled={
                                    emailStatuses.get(index)?.status === "sending" ||
                                    emailStatuses.get(index)?.status === "sent"
                                  }
                                >
                                  {getEmailButtonContent(index)}
                                </Button>
                                {lead.phone && (
                                  <Button
                                    size="sm"
                                    className={getCallButtonStyle(lead)}
                                    onClick={() => makeCall(lead)}
                                    disabled={
                                      callStatuses.get(lead.email) === "calling" ||
                                      callStatuses.get(lead.email) === "called"
                                    }
                                  >
                                    {getCallButtonContent(lead)}
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" className="border-slate-300 bg-transparent">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Single Email Modal */}
        <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Send Email to {currentLead?.name}
              </DialogTitle>
              <DialogDescription>Review and customize your email before sending</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Your Email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderPassword">App Password</Label>
                  <Input
                    id="senderPassword"
                    type="password"
                    value={senderPassword}
                    onChange={(e) => setSenderPassword(e.target.value)}
                    placeholder="Your email app password"
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientEmail">To</Label>
                <Input
                  id="recipientEmail"
                  value={currentLead?.email || ""}
                  disabled
                  className="border-slate-300 bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSubject">Subject</Label>
                <Input
                  id="emailSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailBody">Message</Label>
                <Textarea
                  id="emailBody"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="border-slate-300"
                />
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This is a demo. No actual emails will be sent. The system will simulate the email sending process.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setShowEmailModal(false)} disabled={isSendingEmail}>
                Cancel
              </Button>
              <Button
                onClick={sendSingleEmail}
                disabled={isSendingEmail || !senderEmail || !emailSubject || !emailBody}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Email Modal */}
        <Dialog open={showBulkEmail} onOpenChange={setShowBulkEmail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Send Bulk Emails ({selectedLeads.size} recipients)
              </DialogTitle>
              <DialogDescription>Send emails to all selected leads at once</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulkSenderEmail">Your Email</Label>
                  <Input
                    id="bulkSenderEmail"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulkSenderPassword">App Password</Label>
                  <Input
                    id="bulkSenderPassword"
                    type="password"
                    value={senderPassword}
                    onChange={(e) => setSenderPassword(e.target.value)}
                    placeholder="Your email app password"
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selected Recipients</Label>
                <div className="max-h-32 overflow-y-auto border border-slate-300 rounded-md p-3 bg-slate-50">
                  {Array.from(selectedLeads).map((index) => (
                    <div key={index} className="text-sm text-slate-600 py-1">
                      {leads[index]?.name} - {leads[index]?.email}
                    </div>
                  ))}
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This is a demo. No actual emails will be sent. The system will simulate sending emails to all selected
                  leads.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setShowBulkEmail(false)} disabled={isSendingEmail}>
                Cancel
              </Button>
              <Button
                onClick={sendBulkEmails}
                disabled={isSendingEmail || !senderEmail}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending to {selectedLeads.size} leads...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to {selectedLeads.size} Leads
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Subject Preview Dialog */}
        <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Email Preview - {selectedLeadForPreview?.name}
              </DialogTitle>
              <DialogDescription>Full subject line and message content</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Recipient</Label>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <p className="font-medium text-slate-900">{selectedLeadForPreview?.name}</p>
                  <p className="text-sm text-slate-600">{selectedLeadForPreview?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Subject Line</Label>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <p className="text-slate-900">{selectedLeadForPreview?.subject}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Message Content</Label>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200 max-h-64 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-slate-900 text-sm leading-relaxed">
                    {selectedLeadForPreview?.body}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setShowSubjectDialog(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  if (selectedLeadForPreview) {
                    const leadIndex = leads.findIndex(
                      (lead) =>
                        lead.email === selectedLeadForPreview.email && lead.name === selectedLeadForPreview.name,
                    )
                    if (leadIndex !== -1) {
                      setShowSubjectDialog(false)
                      openEmailModal(selectedLeadForPreview, leadIndex)
                    }
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
