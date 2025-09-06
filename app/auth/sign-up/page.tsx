"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Eye, EyeOff, CheckCircle, Mail } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  const { signUp } = useAuth()
  const router = useRouter()

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push("At least 8 characters")
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter")
    if (!/\d/.test(password)) errors.push("One number")
    return errors
  }

  const passwordErrors = validatePassword(password)
  const isPasswordValid = passwordErrors.length === 0 && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!isPasswordValid) {
      setError("Please fix password requirements")
      setLoading(false)
      return
    }

    try {
      const result = await signUp(email, password, fullName)

      // Check if user needs email verification
      if (result && result.user && !result.session) {
        setNeedsVerification(true)
      } else if (result && result.session) {
        // User is immediately signed in (email confirmation disabled)
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        // Fallback - assume needs verification
        setNeedsVerification(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
                <p className="text-gray-600">
                  We've sent a verification link to <strong>{email}</strong>. Please check your email and click the link
                  to verify your account.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" onClick={() => setNeedsVerification(false)} className="w-full">
                    Back to Sign Up
                  </Button>
                  <Link href="/auth/sign-in">
                    <Button variant="ghost" className="w-full">
                      Already verified? Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
                <p className="text-gray-600">Welcome to StudyMaster! Redirecting to your dashboard...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="h-6 w-6" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-medium text-primary hover:text-primary/80">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Sign Up Form */}
        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>Create your StudyMaster account to begin learning</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Password Requirements */}
                {password && (
                  <div className="text-xs space-y-1">
                    {passwordErrors.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-red-600">
                        <div className="w-1 h-1 bg-red-600 rounded-full" />
                        <span>{error}</span>
                      </div>
                    ))}
                    {isPasswordValid && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Password meets requirements</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {confirmPassword && password !== confirmPassword && (
                  <div className="text-xs text-red-600">Passwords do not match</div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading || !isPasswordValid}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="text-center text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:text-primary/80">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:text-primary/80">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
