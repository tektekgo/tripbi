import { useState, useCallback } from 'react'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '@/lib/firebase'
import type { Trip } from '@/types'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip | null
}

function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  trip,
}: InviteMemberModalProps) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin

  // Create an invitation in Firestore and return the invite link
  const createInvitation = useCallback(async (forEmail?: string): Promise<string> => {
    if (!user || !trip) throw new Error('Missing user or trip')

    const token = generateToken()
    const invitationId = `${trip.id}-${token}`
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    await setDoc(doc(db, 'invitations', invitationId), {
      id: invitationId,
      tripId: trip.id,
      tripName: trip.name,
      email: forEmail || null,
      token,
      status: 'pending',
      createdBy: user.uid,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
    })

    return `${appUrl}/invite/${token}`
  }, [user, trip, appUrl])

  // Handle email invite submission
  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !trip) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create invitation in Firestore
      const link = await createInvitation(email.trim())

      // Call Cloud Function to send email
      const sendInviteEmail = httpsCallable(functions, 'sendInviteEmail')
      await sendInviteEmail({
        invitationId: `${trip.id}-${link.split('/').pop()}`,
        recipientEmail: email.trim(),
        tripName: trip.name,
        inviterName: user?.displayName || user?.email || 'A TripBi user',
        inviteLink: link,
      })

      setSuccess(`Invitation sent to ${email}!`)
      setEmail('')
    } catch (err) {
      console.error('Error sending invite:', err)
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  // Generate a shareable link (no email)
  const handleGenerateLink = async () => {
    if (!trip) return

    setLoading(true)
    setError(null)

    try {
      const link = await createInvitation()
      setInviteLink(link)
    } catch (err) {
      console.error('Error generating link:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate link')
    } finally {
      setLoading(false)
    }
  }

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (!inviteLink) return

    try {
      await navigator.clipboard.writeText(inviteLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Reset state when modal closes
  const handleClose = () => {
    setEmail('')
    setError(null)
    setSuccess(null)
    setInviteLink(null)
    setLinkCopied(false)
    onClose()
  }

  if (!trip) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Members" size="md">
      <div className="space-y-6">
        {/* Trip context */}
        <div className="text-sm text-primary-700/60 dark:text-cream-400">
          Invite people to join <span className="font-medium text-primary-700 dark:text-cream-100">{trip.name}</span>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Option 1: Email Invite */}
        <div>
          <h3 className="text-sm font-medium text-primary-700 dark:text-cream-100 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Invite by Email
          </h3>
          <form onSubmit={handleEmailInvite} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="input flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn-primary"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cream-400 dark:border-surface-dark-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-cream-100 dark:bg-surface-dark text-primary-700/60 dark:text-cream-400">
              or
            </span>
          </div>
        </div>

        {/* Option 2: Share Link */}
        <div>
          <h3 className="text-sm font-medium text-primary-700 dark:text-cream-100 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Share Invite Link
          </h3>
          <p className="text-xs text-primary-700/60 dark:text-cream-400 mb-3">
            Anyone with this link can join the trip. The link expires in 7 days.
          </p>

          {!inviteLink ? (
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="btn-outline w-full"
            >
              {loading ? 'Generating...' : 'Generate Invite Link'}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="input flex-1 text-sm bg-cream-200 dark:bg-surface-dark-muted"
                />
                <button
                  onClick={handleCopyLink}
                  className={`btn-outline ${linkCopied ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700' : ''}`}
                >
                  {linkCopied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Generate new link
              </button>
            </div>
          )}
        </div>

        {/* Current members info */}
        <div className="pt-4 border-t border-cream-400 dark:border-surface-dark-border">
          <p className="text-xs text-primary-700/60 dark:text-cream-400">
            Current members: {trip.members.length}
          </p>
        </div>
      </div>
    </Modal>
  )
}
