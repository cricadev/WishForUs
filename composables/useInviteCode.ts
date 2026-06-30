const INVITE_WORDS = [
  'AURORA',
  'CLOVER',
  'DATE',
  'DREAM',
  'GARDEN',
  'HARBOR',
  'HOME',
  'LUNAR',
  'MAPLE',
  'NOVA',
  'PICNIC',
  'SPARK',
  'SUNSET',
  'TICKET'
]

const randomIndex = (max: number) => {
  if (process.client && window.crypto) {
    const values = new Uint32Array(1)
    window.crypto.getRandomValues(values)
    return values[0] % max
  }

  return Math.floor(Math.random() * max)
}

export const useInviteCode = () => {
  const normalizeInviteCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '-')

  const validateInviteCode = (code: string) => /^[A-Z0-9-]{4,24}$/.test(normalizeInviteCode(code))

  const generateInviteCode = () => {
    const word = INVITE_WORDS[randomIndex(INVITE_WORDS.length)]
    const digits = String(1000 + randomIndex(9000))
    return `${word}-${digits}`
  }

  const copyInviteCode = async (code: string) => {
    if (!process.client) {
      return false
    }

    try {
      await window.navigator.clipboard.writeText(code)
      return true
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = code
      textArea.setAttribute('readonly', 'true')
      textArea.style.position = 'absolute'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      const copied = document.execCommand('copy')
      document.body.removeChild(textArea)
      return copied
    }
  }

  return {
    copyInviteCode,
    generateInviteCode,
    normalizeInviteCode,
    validateInviteCode
  }
}
