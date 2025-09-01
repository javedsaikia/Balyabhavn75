"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, Unlink, Link, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface ConnectionStatus {
  connected: boolean
  enabled: boolean
  error?: string
  lastChecked?: string
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    enabled: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/connection/status')
      const data = await response.json()
      setStatus({
        ...data,
        lastChecked: new Date().toLocaleTimeString()
      })
    } catch (error) {
      setStatus({
        connected: false,
        enabled: false,
        error: 'Failed to check connection status',
        lastChecked: new Date().toLocaleTimeString()
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const toggleConnection = async (enable: boolean) => {
    setIsToggling(true)
    try {
      const response = await fetch('/api/connection/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: enable })
      })
      
      if (response.ok) {
        await checkConnection()
      } else {
        const error = await response.json()
        setStatus(prev => ({
          ...prev,
          error: error.message || 'Failed to toggle connection'
        }))
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: 'Network error occurred'
      }))
    } finally {
      setIsToggling(false)
    }
  }

  useEffect(() => {
    checkConnection()
    // Check connection status every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [checkConnection])

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />
    if (!status.enabled) return <XCircle className="w-4 h-4 text-gray-500" />
    if (status.connected) return <CheckCircle className="w-4 h-4 text-green-500" />
    return <AlertTriangle className="w-4 h-4 text-red-500" />
  }

  const getStatusText = () => {
    if (!status.enabled) return 'Disabled'
    if (status.connected) return 'Connected'
    return 'Disconnected'
  }

  const getStatusColor = () => {
    if (!status.enabled) return 'secondary'
    if (status.connected) return 'default'
    return 'destructive'
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle className="text-lg">Supabase Connection</CardTitle>
          </div>
          <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription>
          Manage your secure database connection
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-medium ${
              status.connected ? 'text-green-600' : 
              status.enabled ? 'text-red-600' : 'text-gray-600'
            }`}>
              {status.enabled ? 
                (status.connected ? 'Active & Secure' : 'Connection Failed') : 
                'Disabled'
              }
            </span>
          </div>
          
          {status.lastChecked && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last checked:</span>
              <span>{status.lastChecked}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          {status.enabled ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toggleConnection(false)}
              disabled={isToggling}
              className="flex-1"
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Unlink className="w-4 h-4 mr-2" />
              )}
              Disconnect
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={() => toggleConnection(true)}
              disabled={isToggling}
              className="flex-1"
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Link className="w-4 h-4 mr-2" />
              )}
              Connect
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkConnection}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>• Connection excludes Facebook authorization</p>
          <p>• All data exchanges are encrypted and secure</p>
          <p>• You can disconnect at any time</p>
        </div>
      </CardContent>
    </Card>
  )
}