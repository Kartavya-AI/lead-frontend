import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Target, Users, Mail, BarChart3, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-cyan-800" />
            <span className="text-2xl font-bold text-cyan-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              LeadGen Pro
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-cyan-800 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-cyan-800 transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-slate-600 hover:text-cyan-800 transition-colors">
              About
            </a>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-cyan-800 text-cyan-800 hover:bg-cyan-800 hover:text-white bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">AI-Powered Lead Generation</Badge>
                <h1
                  className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Transform Your Lead Generation Process
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Effortlessly capture, manage, and convert leads with our all-in-one platform. Generate targeted
                  prospects and reach them instantly with personalized emails.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="bg-cyan-800 hover:bg-cyan-900 text-white px-8 py-3 text-lg">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 text-lg bg-transparent"
                >
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    10K+
                  </div>
                  <div className="text-sm text-slate-600">Leads Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    500+
                  </div>
                  <div className="text-sm text-slate-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    98%
                  </div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <img
                  src="/business-lead-dashboard.png"
                  alt="LeadGen Pro Dashboard"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-amber-500 text-white p-3 rounded-full shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2
              className="text-3xl lg:text-4xl font-bold text-slate-900"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Everything You Need to Generate Quality Leads
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our comprehensive platform combines AI-powered lead generation with seamless email outreach
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-cyan-800 mb-4" />
                <CardTitle className="text-xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Smart Lead Generation
                </CardTitle>
                <CardDescription>
                  Generate targeted leads based on company size, niche, location, and specific criteria
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-12 w-12 text-cyan-800 mb-4" />
                <CardTitle className="text-xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Instant Email Outreach
                </CardTitle>
                <CardDescription>
                  Send personalized emails to your leads directly from the platform with one click
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-cyan-800 mb-4" />
                <CardTitle className="text-xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Analytics & Insights
                </CardTitle>
                <CardDescription>
                  Track your lead generation performance and email campaign success rates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-cyan-800 mb-4" />
                <CardTitle className="text-xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Lead Management
                </CardTitle>
                <CardDescription>
                  Organize and manage your leads with powerful filtering and sorting capabilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-cyan-800 mb-4" />
                <CardTitle className="text-xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Secure & Reliable
                </CardTitle>
                <CardDescription>
                  Enterprise-grade security with 99.9% uptime guarantee for your business
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-cyan-800 mb-4" />
                <CardTitle className="text-xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  AI-Powered
                </CardTitle>
                <CardDescription>
                  Leverage advanced AI algorithms to find the most relevant prospects for your business
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cyan-800">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-6">
            <h2
              className="text-3xl lg:text-4xl font-bold text-white"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Ready to Transform Your Lead Generation?
            </h2>
            <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
              Join thousands of businesses already using LeadGen Pro to grow their customer base
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 text-lg">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-cyan-400" />
                <span className="text-xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  LeadGen Pro
                </span>
              </div>
              <p className="text-slate-400">
                Transform your lead generation process with AI-powered tools and seamless email outreach.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Product
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Company
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Legal
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 LeadGen Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
