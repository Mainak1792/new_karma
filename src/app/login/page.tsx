'use client';

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AuthForm from '@/components/ui/AuthForm'

export default function LoginPage() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center justify-center space-y-2">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to login
          </CardDescription>
        </CardHeader>
        <AuthForm type="login" />
        <CardTitle className="text-2xl font-bold">Made with ❤️in Delhi </CardTitle>
        <CardDescription className="text-muted-foreground">
          Copyright © 2025 All rights by <a href="https://www.mainakchakraborty.com/" className="text-blue-500 hover:text-blue-600">Mainak</a>
        </CardDescription>
      </Card>
    </div>
  )
}

