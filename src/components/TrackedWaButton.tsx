'use client'

import { useCallback } from 'react'
import { MessageCircle } from 'lucide-react'

interface TrackedWaButtonProps {
  href: string
  businessId?: number
  phone: string
  businessName?: string
  label?: string
  className?: string
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  children?: React.ReactNode
}

export default function TrackedWaButton({
  href, businessId, phone, businessName, label = 'Chat on WhatsApp',
  className = '', fullWidth = true, size = 'md', pulse = false,
  children,
}: TrackedWaButtonProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (businessId) {
      navigator.sendBeacon('/api/track/whatsapp', JSON.stringify({
        businessId,
        phone,
        name: businessName || null,
        message: `WhatsApp click from LOCObiz listing`,
      }))
    }
  }, [businessId, phone, businessName])

  const sizeClasses = {
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-8 py-5 text-lg',
  }

  const pulseClass = pulse ? 'animate-pulse-whatsapp' : ''

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2.5 bg-whatsapp text-white font-bold rounded-xl hover:bg-whatsapp-dark transition-all shadow-md shadow-whatsapp/20 ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${pulseClass} ${className}`}
    >
      {children || (
        <>
          <MessageCircle className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
          {label}
        </>
      )}
    </a>
  )
}
