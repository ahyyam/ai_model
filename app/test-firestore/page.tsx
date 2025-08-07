'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { createUserData, testFirestoreAccess } from '@/lib/users'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestFirestorePage() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testFirestore = async () => {
    setIsLoading(true)
    setTestResult('Testing...')
    
    try {
      const result = await testFirestoreAccess()
      if (result) {
        setTestResult('✅ Firestore access test successful!')
      } else {
        setTestResult('❌ Firestore access test failed!')
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testUserCreation = async () => {
    setIsLoading(true)
    setTestResult('Testing user creation...')
    
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        setTestResult('❌ No user logged in. Please log in first.')
        return
      }
      
      const userData = await createUserData(currentUser)
      setTestResult(`✅ User data created successfully! UID: ${userData.uid}`)
    } catch (error) {
      setTestResult(`❌ Error creating user data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testApiEndpoint = async () => {
    setIsLoading(true)
    setTestResult('Testing API endpoint...')
    
    try {
      const response = await fetch('/api/test-firestore')
      const data = await response.json()
      
      if (data.success) {
        setTestResult('✅ API endpoint test successful!')
      } else {
        setTestResult(`❌ API endpoint test failed: ${data.error}`)
      }
    } catch (error) {
      setTestResult(`❌ Error testing API endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Firestore Debug Test</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Test Firestore Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testFirestore} disabled={isLoading} className="w-full">
              {isLoading ? 'Testing...' : 'Test Access'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test User Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testUserCreation} disabled={isLoading} className="w-full">
              {isLoading ? 'Testing...' : 'Test User Creation'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test API Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testApiEndpoint} disabled={isLoading} className="w-full">
              {isLoading ? 'Testing...' : 'Test API'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {testResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {testResult}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
