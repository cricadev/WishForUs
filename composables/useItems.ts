import type { BucketItem, ItemPriority, ItemStatus } from '~/types/item'

type ItemPayload = {
  title: string
  description?: string | null
  markdown_notes?: string | null
  image_url?: string | null
  priority?: ItemPriority
  due_date?: string | null
}

const cleanItemPayload = (payload: ItemPayload) => {
  const title = payload.title.trim()

  if (!title) {
    throw new Error('Item title is required.')
  }

  return {
    title,
    description: payload.description?.trim() || null,
    markdown_notes: payload.markdown_notes?.trim() || null,
    image_url: payload.image_url?.trim() || null,
    priority: payload.priority || 'medium',
    due_date: payload.due_date || null
  }
}

export const useItems = () => {
  const fetchItemsByList = async (listId: string) => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []) as BucketItem[]
  }

  const createItem = async (listId: string, payload: ItemPayload, createdBy?: string | null) => {
    const supabase = useSupabaseClient()
    const cleanPayload = cleanItemPayload(payload)

    const { data, error } = await supabase
      .from('items')
      .insert({
        ...cleanPayload,
        list_id: listId,
        created_by: createdBy || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Item could not be added.')
    }

    return data as BucketItem
  }

  const updateItem = async (itemId: string, payload: ItemPayload) => {
    const supabase = useSupabaseClient()
    const cleanPayload = cleanItemPayload(payload)

    const { data, error } = await supabase
      .from('items')
      .update({
        ...cleanPayload,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Item could not be updated.')
    }

    return data as BucketItem
  }

  const toggleItemStatus = async (item: BucketItem, completedBy?: string | null) => {
    const nextStatus: ItemStatus = item.status === 'done' ? 'pending' : 'done'
    const supabase = useSupabaseClient()
    const completedAt = nextStatus === 'done' ? new Date().toISOString() : null

    const { data, error } = await supabase
      .from('items')
      .update({
        status: nextStatus,
        completed_by: nextStatus === 'done' ? completedBy || null : null,
        completed_at: completedAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message || 'Item status could not be updated.')
    }

    return data as BucketItem
  }

  const deleteItem = async (itemId: string) => {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('items').delete().eq('id', itemId)

    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    createItem,
    deleteItem,
    fetchItemsByList,
    toggleItemStatus,
    updateItem
  }
}
