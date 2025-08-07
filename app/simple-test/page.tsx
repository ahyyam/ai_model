'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SimpleTestPage() {
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testSimpleWrite = async () => {
    setIsLoading(true)
    setResult('Testing simple Firestore write...')
    
    try {
      const response = await fetch('/api/simple-test')
      const data = await response.json()
      
      if (data.success) {
        setResult(`✅ SUCCESS! Firestore is working!\n\nData written: ${JSON.stringify(data.data, null, 2)}`)
      } else {
        setResult(`❌ FAILED: ${data.error || data.message}\n\nStack: ${data.stack || 'No stack trace'}`)
      }
    } catch (error) {
      setResult(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Simple Firestore Test</h1>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Basic Firestore Write</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testSimpleWrite} 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Simple Write'}
          </Button>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
