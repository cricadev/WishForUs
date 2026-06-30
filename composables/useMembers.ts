import type { Member } from '~/types/member'
import { defaultAvatarPreset } from '~/utils/avatar'

type MemberProfilePayload = {
  displayName: string
  avatarPreset?: string
  avatarUrl?: string | null
}

const cleanMemberProfile = (payload: MemberProfilePayload) => {
  const displayName = payload.displayName.trim()

  if (!displayName) {
    throw new Error('Display name is required.')
  }

  return {
    display_name: displayName,
    avatar_preset: payload.avatarPreset || defaultAvatarPreset,
    avatar_url: payload.avatarUrl?.trim() || null
  }
}

export const useMembers = () => {
  const fetchMembersByBucket = async (bucketId: string) => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('bucket_id', bucketId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []) as Member[]
  }

  const updateMemberProfile = async (memberId: string, payload: MemberProfilePayload) => {
    const supabase = useSupabaseClient()
    const cleanPayload = cleanMemberProfile(payload)

    const { data, error } = await supabase
      .from('members')
      .update(cleanPayload)
      .eq('id', memberId)
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Member profile could not be updated.')
    }

    return data as Member
  }

  return {
    fetchMembersByBucket,
    updateMemberProfile
  }
}
