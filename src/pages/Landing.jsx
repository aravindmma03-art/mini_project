import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* Animated particles background — pure CSS + canvas                    */
/* ------------------------------------------------------------------ */

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Feature card component                                               */
/* ------------------------------------------------------------------ */

const FeatureCard = ({ icon, title, description }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '1rem',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div
      style={{
        fontSize: '2.5rem',
        marginBottom: '1rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        height: 64,
        background: 'rgba(99,102,241,0.12)',
        borderRadius: '1rem',
      }}
    >
      {icon}
    </div>
    <h3
      style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#f9fafb',
        marginBottom: '0.75rem',
      }}
    >
      {title}
    </h3>
    <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.7 }}>
      {description}
    </p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Landing Page                                                          */
/* ------------------------------------------------------------------ */

const Landing = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1529 40%, #111827 100%)',
        color: '#f9fafb',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ---- HERO SECTION ---- */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem 1.5rem',
          overflow: 'hidden',
        }}
      >
        <ParticleCanvas />

        {/* Glow blobs */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: 999,
              padding: '0.4rem 1.25rem',
              marginBottom: '2rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#818cf8',
            }}
          >
            <span style={{ fontSize: '0.7rem' }}>●</span>
            AI-Powered · Real-Time · Secure
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              animation: 'fadeIn 0.6s ease',
            }}
          >
            <span
              style={{
                background:
                  'linear-gradient(135deg, #f9fafb 0%, #e0e7ff 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AI-Powered Attendance
            </span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Management
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#9ca3af',
              maxWidth: 580,
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
              animation: 'fadeIn 0.8s ease',
            }}
          >
            Secure, fast face recognition attendance for modern institutions.
            No cards. No queues. Just look at the camera.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeIn 1s ease',
            }}
          >
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                padding: '0.875rem 2.25rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(99,102,241,0.4)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(99,102,241,0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(99,102,241,0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🚀 Login to Dashboard
            </Link>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f9fafb',
                padding: '0.875rem 2.25rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                transition: 'all 0.25s ease',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📝 Register as Student
            </Link>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '2.5rem',
              justifyContent: 'center',
              marginTop: '3.5rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '< 2s', label: 'Recognition Time' },
              { value: '99.2%', label: 'Accuracy Rate' },
              { value: '256-bit', label: 'Encryption' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #818cf8, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'float 2s ease-in-out infinite',
            color: '#4b5563',
            fontSize: '0.8rem',
          }}
        >
          ↓ Scroll to explore
        </div>
      </section>

      {/* ---- FEATURES SECTION ---- */}
      <section
        style={{
          padding: '5rem 2rem',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #f9fafb, #9ca3af)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Why AttendAI?
          </h2>
          <p style={{ color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Built for modern institutions that demand accuracy, security, and simplicity.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <FeatureCard
            icon="👁️"
            title="Face Recognition"
            description="State-of-the-art deep learning model recognizes students in under 2 seconds with over 99% accuracy, even with glasses or different hairstyles."
          />
          <FeatureCard
            icon="📊"
            title="Real-Time Analytics"
            description="Interactive dashboards with live attendance rates, trends, and automated low-attendance alerts keep mentors fully informed."
          />
          <FeatureCard
            icon="🔒"
            title="Secure & Reliable"
            description="JWT authentication, encrypted face embeddings, and audit logs ensure your data is always protected and compliant."
          />
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section
        style={{
          padding: '4rem 2rem 6rem',
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            marginBottom: '3rem',
            color: '#f9fafb',
          }}
        >
          How It Works
        </h2>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {[
            { step: '01', icon: '📝', title: 'Register', desc: 'Student signs up and completes profile' },
            { step: '02', icon: '📷', title: 'Enroll Face', desc: 'Upload or capture a clear face photo' },
            { step: '03', icon: '📡', title: 'Session Starts', desc: 'Mentor starts an attendance session' },
            { step: '04', icon: '✅', title: 'Mark Present', desc: 'Student looks at camera — done!' },
          ].map((item, i, arr) => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'center', maxWidth: 150 }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.12)',
                    border: '2px solid rgba(99,102,241,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    margin: '0 auto 0.75rem',
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ fontWeight: 700, color: '#f9fafb', marginBottom: '0.35rem' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.desc}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ color: '#374151', fontSize: '1.5rem', flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '2rem',
          textAlign: 'center',
          color: '#4b5563',
          fontSize: '0.875rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <span>👁️</span>
          <span style={{ fontWeight: 700, color: '#6366f1' }}>AttendAI</span>
        </div>
        <div>Powered by AttendAI · Built with React + Python AI</div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 40px rgba(99,102,241,0.5); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
