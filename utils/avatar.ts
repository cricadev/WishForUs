export type AvatarPreset = {
  id: string
  label: string
  emoji: string
}

export const avatarPresets: AvatarPreset[] = [
  { id: 'tiger', label: 'Tiger', emoji: '🐯' },
  { id: 'butterfly', label: 'Butterfly', emoji: '🦋' },
  { id: 'moon', label: 'Moon', emoji: '🌙' },
  { id: 'sun', label: 'Sun', emoji: '☀️' },
  { id: 'heart', label: 'Heart', emoji: '💗' },
  { id: 'star', label: 'Star', emoji: '⭐' },
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'dog', label: 'Dog', emoji: '🐶' },
  { id: 'flower', label: 'Flower', emoji: '🌸' },
  { id: 'planet', label: 'Planet', emoji: '🪐' },
  { id: 'fire', label: 'Fire', emoji: '🔥' },
  { id: 'cloud', label: 'Cloud', emoji: '☁️' }
]

export const defaultAvatarPreset = 'heart'

export const getAvatarPreset = (avatarPreset?: string | null) =>
  avatarPresets.find((preset) => preset.id === avatarPreset) || avatarPresets.find((preset) => preset.id === defaultAvatarPreset)

export const getMemberInitials = (displayName?: string | null) => {
  const parts = (displayName || 'US')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (!parts.length) {
    return 'US'
  }

  return parts.map((part) => part[0]?.toUpperCase()).join('')
}
