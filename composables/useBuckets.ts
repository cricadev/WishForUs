import type { SupabaseClient } from '@supabase/supabase-js'
import type { Bucket } from '~/types/bucket'
import type { Member } from '~/types/member'
import { defaultAvatarPreset } from '~/utils/avatar'

type CreateBucketInput = {
  name: string
  displayName: string
  avatarPreset?: string
  avatarUrl?: string | null
}

type JoinBucketInput = {
  inviteCode: string
  displayName: string
  avatarPreset?: string
  avatarUrl?: string | null
}

const ensureAnonymousSession = async (supabase: SupabaseClient) => {
  try {
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      return
    }

    await supabase.auth.signInAnonymously()
  } catch {
    // Anonymous auth is optional for the MVP. The invite-code flow still works
    // when Supabase Auth is not configured for anonymous users.
  }
}

export const useBuckets = () => {
  const { generateInviteCode, normalizeInviteCode, validateInviteCode } = useInviteCode()

  const fetchBucketById = async (bucketId: string) => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase.from('buckets').select('*').eq('id', bucketId).maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data as Bucket | null
  }

  const fetchBucketByInviteCode = async (inviteCode: string) => {
    const supabase = useSupabaseClient()
    const normalizedCode = normalizeInviteCode(inviteCode)

    const { data, error } = await supabase
      .from('buckets')
      .select('*')
      .eq('invite_code', normalizedCode)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data as Bucket | null
  }

  const createBucket = async (input: CreateBucketInput) => {
    const name = input.name.trim()
    const displayName = input.displayName.trim()
    const avatarPreset = input.avatarPreset || defaultAvatarPreset
    const avatarUrl = input.avatarUrl?.trim() || null

    if (!name) {
      throw new Error('Bucket name is required.')
    }

    if (!displayName) {
      throw new Error('Display name is required.')
    }

    const supabase = useSupabaseClient()
    await ensureAnonymousSession(supabase)

    let bucket: Bucket | null = null
    let lastError = ''

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const inviteCode = generateInviteCode()
      const { data, error } = await supabase
        .from('buckets')
        .insert({ name, invite_code: inviteCode })
        .select()
        .single()

      if (!error && data) {
        bucket = data as Bucket
        break
      }

      lastError = error?.message || 'Unable to create bucket.'

      if (!lastError.toLowerCase().includes('duplicate')) {
        break
      }
    }

    if (!bucket) {
      throw new Error(lastError || 'Unable to create bucket. Please try again.')
    }

    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        bucket_id: bucket.id,
        display_name: displayName,
        avatar_preset: avatarPreset,
        avatar_url: avatarUrl
      })
      .select()
      .single()

    if (memberError || !member) {
      throw new Error(memberError?.message || 'Bucket was created, but the first member could not be saved.')
    }

    return {
      bucket,
      member: member as Member
    }
  }

  const joinBucket = async (input: JoinBucketInput) => {
    const displayName = input.displayName.trim()
    const inviteCode = normalizeInviteCode(input.inviteCode)
    const avatarPreset = input.avatarPreset || defaultAvatarPreset
    const avatarUrl = input.avatarUrl?.trim() || null

    if (!displayName) {
      throw new Error('Display name is required.')
    }

    if (!validateInviteCode(inviteCode)) {
      throw new Error('That invite code does not look right. Check it and try again.')
    }

    const supabase = useSupabaseClient()
    await ensureAnonymousSession(supabase)

    const bucket = await fetchBucketByInviteCode(inviteCode)

    if (!bucket) {
      throw new Error('We could not find that bucket. Check the invite code and try again.')
    }

    const { data: member, error } = await supabase
      .from('members')
      .insert({
        bucket_id: bucket.id,
        display_name: displayName,
        avatar_preset: avatarPreset,
        avatar_url: avatarUrl
      })
      .select()
      .single()

    if (error || !member) {
      throw new Error(error?.message || 'We found the bucket, but could not add you yet.')
    }

    return {
      bucket,
      member: member as Member
    }
  }

  const updateBucketName = async (bucketId: string, name: string) => {
    const cleanName = name.trim()

    if (!cleanName) {
      throw new Error('Bucket name is required.')
    }

    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('buckets')
      .update({ name: cleanName })
      .eq('id', bucketId)
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Bucket name could not be updated.')
    }

    return data as Bucket
  }

  return {
    createBucket,
    fetchBucketById,
    fetchBucketByInviteCode,
    joinBucket,
    updateBucketName
  }
}
