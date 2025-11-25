"use client"

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  // Redirect to app if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/app')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ fontSize: 18, color: '#666' }}>Loading...</div>
      </div>
    )
  }

  if (isSignedIn) {
    return null // Will redirect
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* Navigation */}
      <nav style={{ 
        borderBottom: '1px solid #e5e7eb', 
        background: '#fff',
        padding: 'clamp(0.75rem, 2vw, 1rem) 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 clamp(1rem, 4vw, 1.5rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700, color: '#111' }}>
            BurnEngine
          </div>
          <div style={{ display: 'flex', gap: 'clamp(1rem, 3vw, 1.5rem)', alignItems: 'center' }}>
            <a 
              href="/pricing" 
              style={{ 
                fontSize: 'clamp(13px, 2vw, 14px)', 
                color: '#666', 
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Pricing
            </a>
            <a 
              href="/sign-in" 
              style={{ 
                fontSize: 'clamp(13px, 2vw, 14px)', 
                color: '#666', 
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 1.5rem) clamp(2rem, 6vw, 4rem)',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
          fontWeight: 700, 
          color: '#111',
          marginBottom: '1.25rem',
          lineHeight: 1.2
        }}>
          Focus on what matters.<br />
          Never lose momentum.
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
          color: '#666',
          marginBottom: '2.5rem',
          maxWidth: '650px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          See the real cost of your time. Make every second count toward what truly matters.
        </p>

        {/* Demo Card - Showing App in Action */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: 'clamp(24px, 5vw, 36px)',
          maxWidth: '500px',
          margin: '0 auto 2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
            fontWeight: 700,
            color: '#e74c3c',
            marginBottom: '12px',
            lineHeight: '1',
          }}>
            -$47.50
          </div>
          <div style={{
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
            color: '#1a1a1a',
            marginBottom: '8px',
            fontWeight: 500,
          }}>
            Cost of this distraction so far
          </div>
          <div style={{
            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
            color: '#666',
          }}>
            Based on your $95/hour rate • 30 minutes wasted
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}>
          <a
            href="/sign-up"
            style={{
              padding: 'clamp(12px, 2vw, 14px) clamp(24px, 4vw, 28px)',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(52, 152, 219, 0.25)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2980b9'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.35)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3498db'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.25)'
            }}
          >
            Try BurnEngine Now
            <span style={{ fontSize: '12px' }}>→</span>
          </a>
          <button
            onClick={() => {
              // In production, this would open a demo video/modal
              alert('Demo coming soon!')
            }}
            style={{
              padding: 'clamp(12px, 2vw, 14px) clamp(24px, 4vw, 28px)',
              backgroundColor: 'white',
              color: '#1a1a1a',
              border: '1.5px solid #e9ecef',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ddd'
              e.currentTarget.style.backgroundColor = '#f8f9fa'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e9ecef'
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            <span style={{ fontSize: '12px' }}>▶</span>
            Watch Demo
          </button>
        </div>

        {/* Social Proof */}
        <p style={{ 
          fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
          color: '#999',
          marginBottom: '1.5rem',
        }}>
          Trusted by 10,000+ professionals
        </p>

        {/* Company Logos */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'clamp(24px, 6vw, 40px)',
          flexWrap: 'wrap',
          opacity: 0.5,
        }}>
          <div style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', fontWeight: 600, color: '#1a1a1a' }}>Google</div>
          <div style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', fontWeight: 600, color: '#1a1a1a' }}>Microsoft</div>
          <div style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', fontWeight: 600, color: '#1a1a1a' }}>Apple</div>
          <div style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', fontWeight: 600, color: '#1a1a1a' }}>Meta</div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(2.5rem, 6vw, 4rem) clamp(1rem, 4vw, 1.5rem)',
        textAlign: 'center',
      }}>
        <div style={{ 
          fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
          color: '#111',
          marginBottom: '0.5rem',
          fontWeight: 600
        }}>
          Average user saves 2.3 hours/day by seeing time cost
        </div>
        <p style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', color: '#666', fontStyle: 'italic' }}>
          "Finally, I can see where my time actually goes" - Sarah Chen, Founder
        </p>
      </section>

      {/* Features */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 1.5rem)'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', 
          fontWeight: 700, 
          color: '#111',
          textAlign: 'center',
          marginBottom: 'clamp(2.5rem, 6vw, 3.5rem)'
        }}>
          Everything you need to build unstoppable momentum
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'clamp(2rem, 4vw, 2.5rem)'
        }}>
          <div>
            <div style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              marginBottom: '0.75rem',
              fontWeight: 700,
              color: '#e74c3c'
            }}>💰</div>
            <h3 style={{ 
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)', 
              fontWeight: 600, 
              color: '#111',
              marginBottom: '0.5rem'
            }}>
              Real-time cost tracking
            </h3>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#666', lineHeight: 1.6 }}>
              Watch your hourly rate burn. Every second counts. See the real cost of your time in real-time.
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              marginBottom: '0.75rem',
              fontWeight: 700,
              color: '#3498db'
            }}>📊</div>
            <h3 style={{ 
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)', 
              fontWeight: 600, 
              color: '#111',
              marginBottom: '0.5rem'
            }}>
              Focus on what matters
            </h3>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#666', lineHeight: 1.6 }}>
              Categorize tasks by importance (Rock/Pebble/Sand). See what moves the needle. Cut what doesn't.
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              marginBottom: '0.75rem',
              fontWeight: 700,
              color: '#f39c12'
            }}>🎯</div>
            <h3 style={{ 
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)', 
              fontWeight: 600, 
              color: '#111',
              marginBottom: '0.5rem'
            }}>
              Distraction awareness
            </h3>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#666', lineHeight: 1.6 }}>
              Track time-wasters. See where money goes. Eliminate distractions and focus on what matters.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 1.5rem)',
        background: '#f9fafb'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', 
          fontWeight: 700, 
          color: '#111',
          textAlign: 'center',
          marginBottom: 'clamp(2.5rem, 6vw, 3.5rem)'
        }}>
          How it works
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'clamp(2rem, 4vw, 2.5rem)',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 'clamp(48px, 8vw, 56px)', 
              height: 'clamp(48px, 8vw, 56px)', 
              borderRadius: '50%', 
              background: '#111',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
              fontWeight: 700,
              margin: '0 auto clamp(1rem, 2.5vw, 1.25rem)'
            }}>1</div>
            <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              Set your rate and goals
            </h3>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#666' }}>
              Define what your time is worth and what you're working toward
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 'clamp(48px, 8vw, 56px)', 
              height: 'clamp(48px, 8vw, 56px)', 
              borderRadius: '50%', 
              background: '#111',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
              fontWeight: 700,
              margin: '0 auto clamp(1rem, 2.5vw, 1.25rem)'
            }}>2</div>
            <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              Track continuously, build momentum
            </h3>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#666' }}>
              Your timer runs continuously, showing progress in real-time
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 'clamp(48px, 8vw, 56px)', 
              height: 'clamp(48px, 8vw, 56px)', 
              borderRadius: '50%', 
              background: '#111',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
              fontWeight: 700,
              margin: '0 auto clamp(1rem, 2.5vw, 1.25rem)'
            }}>3</div>
            <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              See your progress, keep going
            </h3>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#666' }}>
              Visualize your growth and maintain your momentum
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 1.5rem)',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', 
          fontWeight: 700, 
          color: '#111',
          marginBottom: '1rem'
        }}>
          Stop guessing. Start tracking.
        </h2>
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
          color: '#666',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
        }}>
          See the real cost of your time. Make every second count toward what truly matters.
        </p>
        <a 
          href="/sign-up"
          style={{
            display: 'inline-block',
            background: '#111',
            color: '#fff',
            padding: 'clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)',
            borderRadius: '8px',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            fontWeight: 600,
            textDecoration: 'none',
            marginTop: '1.5rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
        >
          Get Started
        </a>
        <p style={{ 
          marginTop: '1rem', 
          fontSize: 'clamp(13px, 2vw, 14px)', 
          color: '#888'
        }}>
          No credit card required to start.
        </p>
      </section>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid #e5e7eb',
        padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 1.5rem)',
        textAlign: 'center',
        color: '#666',
        fontSize: 'clamp(12px, 2vw, 14px)'
      }}>
        <p>© 2025 BurnEngine. Built for doers.</p>
      </footer>
    </div>
  )
}

