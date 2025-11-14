"use client"

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LandingPage from './landing'

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  // If signed in, redirect to app (use useEffect to avoid render-time side effects)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/app')
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading or redirecting state
  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ fontSize: 18, color: '#666' }}>Loading...</div>
      </div>
    )
  }

  // If signed in, show redirecting message while useEffect handles redirect
  if (isSignedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ fontSize: 18, color: '#666' }}>Redirecting...</div>
      </div>
    )
  }

  // Show landing page
  return <LandingPage />
}
