"use client"

import Link from 'next/link'

export default function PricingPage() {
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
          <Link href="/" style={{ fontSize: '20px', fontWeight: 700, color: '#111', textDecoration: 'none' }}>
            PriceTime
          </Link>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/sign-in" style={{ fontSize: '15px', color: '#666', textDecoration: 'none', fontWeight: 500 }}>
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              style={{ 
                fontSize: '15px', 
                color: '#fff', 
                background: '#111',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '4rem 1.5rem 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
          fontWeight: 700, 
          color: '#111',
          marginBottom: '1rem',
          lineHeight: 1.1
        }}>
          Simple, transparent pricing
        </h1>
        <p style={{ 
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', 
          color: '#666',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          Start free. Upgrade when you see the value.
        </p>
        <p style={{ fontSize: '1rem', color: '#888', marginTop: '1rem' }}>
          Join 1,247 doers using PriceTime
        </p>
      </section>

      {/* Pricing Cards */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem 1.5rem 4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        alignItems: 'stretch'
      }}>
        {/* Free Tier */}
        <div style={{
          background: '#fff',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>
              Free
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111' }}>$0</span>
              <span style={{ fontSize: '1rem', color: '#666' }}>/month</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
              Perfect for getting started and building the habit
            </p>
          </div>
          
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: '0 0 2rem 0',
            flex: 1
          }}>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6 }}>
                Core timer with real-time cost tracking
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6 }}>
                Task history (30 days)
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6 }}>
                Productivity charts
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6 }}>
                Open loops tracking
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6 }}>
                Login streak tracking
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#ef4444', fontSize: '1.25rem', marginTop: '2px' }}>✗</span>
              <span style={{ fontSize: '0.95rem', color: '#999', lineHeight: 1.6 }}>
                Unlimited history
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#ef4444', fontSize: '1.25rem', marginTop: '2px' }}>✗</span>
              <span style={{ fontSize: '0.95rem', color: '#999', lineHeight: 1.6 }}>
                Data export
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#ef4444', fontSize: '1.25rem', marginTop: '2px' }}>✗</span>
              <span style={{ fontSize: '0.95rem', color: '#999', lineHeight: 1.6 }}>
                Multi-device sync
              </span>
            </li>
          </ul>

          <Link
            href="/sign-up"
            style={{
              display: 'block',
              textAlign: 'center',
              background: '#f5f5f5',
              color: '#111',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
          >
            Start Free
          </Link>
        </div>

        {/* Pro Tier */}
        <div style={{
          background: '#111',
          border: '2px solid #111',
          borderRadius: '12px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#10b981',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            MOST POPULAR
          </div>
          
          <div style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Pro
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>$9</span>
              <span style={{ fontSize: '1rem', color: '#999' }}>/month</span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#999', textDecoration: 'line-through' }}>$90/year</span>
              <span style={{ fontSize: '0.9rem', color: '#10b981', marginLeft: '0.5rem', fontWeight: 600 }}>
                Save 17% with annual
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#999', lineHeight: 1.6 }}>
              For serious doers who want unlimited tracking
            </p>
          </div>
          
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: '0 0 2rem 0',
            flex: 1
          }}>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>
                Everything in Free
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>
                Unlimited task history
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>
                Multi-device sync (real-time)
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>
                Export data (CSV, JSON)
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>
                Advanced analytics & reports
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>
                Custom hourly rates per category
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6 }}>
                Priority support
              </span>
            </li>
          </ul>

          <Link
            href="/sign-up"
            style={{
              display: 'block',
              textAlign: 'center',
              background: '#fff',
              color: '#111',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            Upgrade to Pro
          </Link>
        </div>
      </section>

      {/* Value Proposition */}
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
          Save 2+ hours/day = $180+ value. Pro costs $9/month.
        </div>
        <p style={{ fontSize: '1rem', color: '#666' }}>
          If PriceTime helps you reclaim just 2 hours per day, that's worth $180+ monthly at a $90/hour rate.
        </p>
      </section>

      {/* FAQ Section */}
      <section style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '4rem 1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 700, 
          color: '#111',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          Frequently Asked Questions
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              Can I cancel anytime?
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
              Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              What happens to my data if I cancel?
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
              Your data remains safe. You can export it before canceling, and it will be available if you resubscribe.
            </p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              Do you offer refunds?
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
              We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
            </p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              Is there a free trial for Pro?
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
              The Free tier is our trial. Use it to see the value, then upgrade when you're ready for unlimited features.
            </p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
              What payment methods do you accept?
            </h3>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6 }}>
              We accept all major credit cards. Payment is processed securely through Stripe.
            </p>
          </div>
        </div>
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

