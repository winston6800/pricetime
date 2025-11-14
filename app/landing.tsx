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
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#111' }}>
            PriceTime
          </div>
          <a 
            href="/pricing" 
            style={{ 
              fontSize: '15px', 
              color: '#666', 
              textDecoration: 'none',
              fontWeight: 500,
              marginRight: '1.5rem'
            }}
          >
            Pricing
          </a>
          <a 
            href="/sign-in" 
            style={{ 
              fontSize: '15px', 
              color: '#666', 
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '6rem 1.5rem 4rem',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          fontWeight: 700, 
          color: '#111',
          marginBottom: '1.5rem',
          lineHeight: 1.1
        }}>
          Every minute you waste costs you money
        </h1>
        <p style={{ 
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', 
          color: '#666',
          marginBottom: '2rem',
          maxWidth: '700px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          See the real cost of your time. Make every second count.
        </p>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#444',
          marginBottom: '3rem',
          maxWidth: '600px',
          margin: '0 auto 3rem',
          lineHeight: 1.6
        }}>
          You know your hourly rate. Now see it burn in real-time. Track what matters, eliminate what doesn't.
        </p>
        <a 
          href="/sign-up"
          style={{
            display: 'inline-block',
            background: '#111',
            color: '#fff',
            padding: '1rem 2.5rem',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
        >
          Start Tracking Now
        </a>
        <p style={{ 
          marginTop: '1.5rem', 
          fontSize: '15px', 
          color: '#888'
        }}>
          Join 1,247 doers who've reclaimed 2,340 hours this month
        </p>
      </section>

      {/* Social Proof */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '4rem 1.5rem',
        textAlign: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ 
          fontSize: '1.25rem', 
          color: '#111',
          marginBottom: '0.5rem',
          fontWeight: 600
        }}>
          Average user saves 2.3 hours/day by seeing time cost
        </div>
        <p style={{ fontSize: '1rem', color: '#666', fontStyle: 'italic' }}>
          "Finally, I can see where my time actually goes" - Sarah Chen, Founder
        </p>
      </section>

      {/* Features */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '6rem 1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#111',
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          Everything you need to optimize your time
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem'
        }}>
          <div>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              fontWeight: 700,
              color: '#e74c3c'
            }}>⏱️</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#111',
              marginBottom: '0.75rem'
            }}>
              Real-time cost tracking
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
              Watch your hourly rate burn. Every second counts. See exactly how much each task costs you in real-time.
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              fontWeight: 700,
              color: '#3498db'
            }}>📊</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#111',
              marginBottom: '0.75rem'
            }}>
              Productivity insights
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
              See what moves the needle. Cut what doesn't. Visualize your productivity patterns and optimize your day.
            </p>
          </div>
          <div>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              fontWeight: 700,
              color: '#f39c12'
            }}>🎯</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#111',
              marginBottom: '0.75rem'
            }}>
              Distraction awareness
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
              Track time-wasters. Eliminate them. Make the cost of distractions visible so you can focus on what matters.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '6rem 1.5rem',
        background: '#f9fafb'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#111',
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          How it works
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#111',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 auto 1.5rem'
            }}>1</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              Set your hourly rate
            </h3>
            <p style={{ fontSize: '1rem', color: '#666' }}>
              Enter what your time is worth
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#111',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 auto 1.5rem'
            }}>2</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              Start a task, watch the cost
            </h3>
            <p style={{ fontSize: '1rem', color: '#666' }}>
              See money burn in real-time
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#111',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 auto 1.5rem'
            }}>3</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              See patterns, optimize
            </h3>
            <p style={{ fontSize: '1rem', color: '#666' }}>
              Track what works, cut what doesn't
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '6rem 1.5rem',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(2rem, 4vw, 3rem)', 
          fontWeight: 700, 
          color: '#111',
          marginBottom: '1rem'
        }}>
          Stop guessing. Start tracking.
        </h2>
        <a 
          href="/sign-up"
          style={{
            display: 'inline-block',
            background: '#111',
            color: '#fff',
            padding: '1rem 2.5rem',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 600,
            textDecoration: 'none',
            marginTop: '2rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
        >
          Get Started
        </a>
        <p style={{ 
          marginTop: '1rem', 
          fontSize: '15px', 
          color: '#888'
        }}>
          Free forever. No credit card.
        </p>
      </section>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid #e5e7eb',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <p>© 2025 PriceTime. Built for doers.</p>
      </footer>
    </div>
  )
}

