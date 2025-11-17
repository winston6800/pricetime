"use client"

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { FaHome } from 'react-icons/fa'

export default function SignUpPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f8f9fa',
      position: 'relative'
    }}>
      <Link 
        href="/"
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: '#2c3e50',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
          border: '1px solid #34495e',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#34495e'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#2c3e50'}
      >
        <FaHome />
        <span>Home</span>
      </Link>
      <SignUp />
    </div>
  )
}

