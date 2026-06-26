import { ImageResponse } from 'next/og'

export const alt = 'ADZBE - Find Local Businesses on WhatsApp'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #075E54 0%, #128C7E 40%, #25D366 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '16px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 800,
            color: '#25D366',
          }}>
            A
          </div>
          <span style={{
            fontSize: '72px',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-2px',
          }}>
            ADZBE
          </span>
        </div>
        <p style={{
          fontSize: '28px',
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          maxWidth: '700px',
          lineHeight: 1.4,
          margin: 0,
        }}>
          India&apos;s WhatsApp-first local business directory
        </p>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.6)',
          marginTop: '24px',
        }}>
          Find trusted businesses near you · Connect instantly
        </p>
      </div>
    ),
    size,
  )
}
