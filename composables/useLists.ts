import type { BucketList } from '~/types/list'

type ListPayload = {
  title: string
  description?: string | null
}

const cleanListPayload = (payload: ListPayload) => {
  const title = payload.title.trim()

  if (!title) {
    throw new Error('List title is required.')
  }

  return {
    title,
    description: payload.description?.trim() || null
  }
}

export const useLists = () => {
  const fetchListsByBucket = async (bucketId: string) => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('bucket_id', bucketId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []) as BucketList[]
  }

  const fetchListById = async (listId: string) => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase.from('lists').select('*').eq('id', listId).maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data as BucketList | null
  }

  const createList = async (bucketId: string, payload: ListPayload, createdBy?: string | null) => {
    const supabase = useSupabaseClient()
    const cleanPayload = cleanListPayload(payload)

    const { data, error } = await supabase
      .from('lists')
      .insert({ ...cleanPayload, bucket_id: bucketId, created_by: createdBy || null })
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'List could not be created.')
    }

    return data as BucketList
  }

  const updateList = async (listId: string, payload: ListPayload) => {
    const supabase = useSupabaseClient()
    const cleanPayload = cleanListPayload(payload)

    const { data, error } = await supabase
      .from('lists')
      .update(cleanPayload)
      .eq('id', listId)
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'List could not be updated.')
    }

    return data as BucketList
  }

  const deleteList = async (listId: string) => {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('lists').delete().eq('id', listId)

    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    createList,
    deleteList,
    fetchListById,
    fetchListsByBucket,
    updateList
  }
}
