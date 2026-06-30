export type CurrentMemberSession = {
  bucketId: string
  memberId: string
  displayName: string
  avatarPreset?: string
  avatarUrl?: string | null
}

const STORAGE_KEY = 'wishforus-session'
const LEGACY_STORAGE_KEY = 'our-bucket-session'

export const useCurrentMember = () => {
  const session = useState<CurrentMemberSession | null>('wishforus-session', () => null)

  const loadSession = () => {
    if (!process.client) {
      return session.value
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY)

    if (!stored) {
      session.value = null
      return session.value
    }

    try {
      const parsed = JSON.parse(stored) as CurrentMemberSession & { avatarKey?: string }

      if (parsed.bucketId && parsed.memberId && parsed.displayName) {
        session.value = {
          bucketId: parsed.bucketId,
          memberId: parsed.memberId,
          displayName: parsed.displayName,
          avatarPreset: parsed.avatarPreset || parsed.avatarKey || 'heart',
          avatarUrl: parsed.avatarUrl || null
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
      session.value = null
    }

    return session.value
  }

  const saveSession = (nextSession: CurrentMemberSession) => {
    session.value = nextSession

    if (process.client) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  }

  const updateProfile = (profile: { displayName?: string; avatarPreset?: string; avatarUrl?: string | null }) => {
    const cleanName = profile.displayName?.trim()

    if (!session.value) {
      return
    }

    saveSession({
      ...session.value,
      displayName: cleanName || session.value.displayName,
      avatarPreset: profile.avatarPreset || session.value.avatarPreset || 'heart',
      avatarUrl: profile.avatarUrl === undefined ? session.value.avatarUrl || null : profile.avatarUrl || null
    })
  }

  const updateDisplayName = (displayName: string) => {
    const cleanName = displayName.trim()

    if (!session.value || !cleanName) {
      return
    }

    updateProfile({ displayName: cleanName })
  }

  const clearSession = () => {
    session.value = null

    if (process.client) {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  }

  return {
    session,
    loadSession,
    saveSession,
    updateProfile,
    updateDisplayName,
    clearSession
  }
}
