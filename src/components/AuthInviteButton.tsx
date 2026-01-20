import React, { useState } from 'react'

interface Props {
  clientId: string
}

export default function AuthInviteButton({ clientId }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    // Determine redirect URI based on environment
    const isDev = window.location.hostname === 'localhost'
    const redirectUri = isDev
      ? 'http://localhost:4321/api/auth/callback'
      : `${window.location.origin}/api/auth/callback`

    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=auto&scope=read,activity:read_all`

    navigator.clipboard.writeText(authUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        copied
          ? 'bg-green-500 text-white'
          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'
      }`}
    >
      {copied ? '¡Link Copiado!' : 'Copiar Link de Invitación'}
    </button>
  )
}
