export type BucketList = {
  id: string
  bucket_id: string
  title: string
  description?: string | null
  created_by?: string | null
  created_at: string
  creator?: import('~/types/member').Member | null
}
