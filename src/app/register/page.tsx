'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AuthForm from '@/components/ui/AuthForm'

export default function SignupPage() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center justify-center space-y-2">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to Signup
          </CardDescription>
        </CardHeader>
        <AuthForm type="register" />
      </Card>
    </div>
  )
}

