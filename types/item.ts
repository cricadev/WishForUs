export type ItemStatus = 'pending' | 'done'

export type ItemPriority = 'low' | 'medium' | 'high'

export type BucketItem = {
  id: string
  list_id: string
  title: string
  description?: string | null
  markdown_notes?: string | null
  image_url?: string | null
  status: ItemStatus
  priority: ItemPriority
  due_date?: string | null
  created_by?: string | null
  completed_by?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
  creator?: import('~/types/member').Member | null
  completer?: import('~/types/member').Member | null
}
