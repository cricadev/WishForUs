<script setup lang="ts">
import type { Bucket } from '~/types/bucket'
import type { BucketItem } from '~/types/item'
import type { BucketList } from '~/types/list'
import type { Member } from '~/types/member'
import { friendlyError } from '~/utils/errors'

const route = useRoute()
const bucketId = computed(() => String(route.params.bucketId || ''))
const listId = computed(() => String(route.params.listId || ''))

const { fetchBucketById } = useBuckets()
const { fetchListById } = useLists()
const { createItem, deleteItem, fetchItemsByList, toggleItemStatus, updateItem } = useItems()
const { fetchMembersByBucket } = useMembers()
const { loadSession, session } = useCurrentMember()

const bucket = ref<Bucket | null>(null)
const list = ref<BucketList | null>(null)
const items = ref<BucketItem[]>([])
const members = ref<Member[]>([])
const loading = ref(true)
const error = ref('')

const showItemForm = ref(false)
const editingItem = ref<BucketItem | null>(null)
const itemFormError = ref('')
const itemActionLoading = ref(false)
const itemToDelete = ref<BucketItem | null>(null)
const deleteLoading = ref(false)

const completedItems = computed(() => items.value.filter((item) => item.status === 'done').length)
const memberById = computed(() => new Map(members.value.map((member) => [member.id, member])))
const listCreator = computed(() => (list.value?.created_by ? memberById.value.get(list.value.created_by) || null : null))
const pendingItems = computed(() => items.value.length - completedItems.value)
const progressPercentage = computed(() => {
  if (!items.value.length) {
    return 0
  }

  return Math.round((completedItems.value / items.value.length) * 100)
})

useHead({
  title: computed(() => (list.value ? `${list.value.title} - WishForUS` : 'List - WishForUS'))
})

const refresh = async () => {
  loading.value = true
  error.value = ''

  try {
    const [foundBucket, foundList, foundItems, foundMembers] = await Promise.all([
      fetchBucketById(bucketId.value),
      fetchListById(listId.value),
      fetchItemsByList(listId.value),
      fetchMembersByBucket(bucketId.value)
    ])

    if (!foundBucket) {
      throw new Error('We could not find that bucket.')
    }

    if (!foundList || foundList.bucket_id !== bucketId.value) {
      throw new Error('We could not find that list.')
    }

    bucket.value = foundBucket
    list.value = foundList
    items.value = foundItems
    members.value = foundMembers
  } catch (caughtError) {
    error.value = friendlyError(caughtError, 'We could not load this list.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loadSession()
  await refresh()
})

const startAddItem = () => {
  editingItem.value = null
  itemFormError.value = ''
  showItemForm.value = true
}

const startEditItem = (item: BucketItem) => {
  editingItem.value = item
  itemFormError.value = ''
  showItemForm.value = true
}

const closeItemForm = () => {
  showItemForm.value = false
  editingItem.value = null
  itemFormError.value = ''
}

const handleItemSubmit = async (payload: {
  title: string
  description: string | null
  markdown_notes: string | null
  image_url: string | null
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
}) => {
  itemActionLoading.value = true
  itemFormError.value = ''

  try {
    if (editingItem.value) {
      await updateItem(editingItem.value.id, payload)
    } else {
      await createItem(listId.value, payload, session.value?.memberId)
    }

    closeItemForm()
    await refresh()
  } catch (caughtError) {
    itemFormError.value = friendlyError(caughtError, 'We could not save that item.')
  } finally {
    itemActionLoading.value = false
  }
}

const handleToggleItem = async (item: BucketItem) => {
  error.value = ''

  try {
    await toggleItemStatus(item, session.value?.memberId)
    await refresh()
  } catch (caughtError) {
    error.value = friendlyError(caughtError, 'We could not update that item.')
  }
}

const confirmDeleteItem = (item: BucketItem) => {
  itemToDelete.value = item
}

const handleDeleteItem = async () => {
  if (!itemToDelete.value) {
    return
  }

  deleteLoading.value = true
  error.value = ''

  try {
    await deleteItem(itemToDelete.value.id)
    itemToDelete.value = null
    await refresh()
  } catch (caughtError) {
    error.value = friendlyError(caughtError, 'We could not delete that item.')
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <AppShell
    :bucket-id="bucketId"
    :bucket-name="bucket?.name"
    :member-name="session?.displayName"
    :member-avatar-preset="session?.avatarPreset"
    :member-avatar-url="session?.avatarUrl"
  >
    <LoadingState v-if="loading" label="Loading list..." />

    <ErrorState v-else-if="error && !list" :message="error" action-label="Try again" @retry="refresh" />

    <div v-else-if="bucket && list" class="space-y-6">
      <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <NuxtLink :to="`/bucket/${bucket.id}`" class="text-sm font-semibold text-ember">Back to bucket</NuxtLink>
          <h1 class="mt-2 break-words text-3xl font-black tracking-normal text-ink sm:text-4xl">
            {{ list.title }}
          </h1>
          <p v-if="list.description" class="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            {{ list.description }}
          </p>
          <div v-if="listCreator" class="mt-3 flex items-center gap-2 text-sm font-semibold text-ink/55">
            <MemberAvatar
              :display-name="listCreator.display_name"
              :avatar-preset="listCreator.avatar_preset"
              :avatar-url="listCreator.avatar_url"
              size="sm"
            />
            <span>{{ listCreator.id === session?.memberId ? 'Created by you' : `Created by ${listCreator.display_name}` }}</span>
          </div>
        </div>

        <button class="btn-primary" type="button" @click="startAddItem">Add item</button>
      </section>

      <ErrorState v-if="error" :message="error" action-label="Try again" @retry="refresh" />

      <section class="surface-card p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-semibold text-ember">{{ progressPercentage }}% complete</p>
            <h2 class="mt-1 text-2xl font-bold tracking-normal text-ink">
              {{ completedItems }} of {{ items.length }} items done
            </h2>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm sm:min-w-56">
            <div class="rounded-lg border border-ink/10 bg-linen p-3">
              <p class="text-2xl font-bold text-ink">{{ pendingItems }}</p>
              <p class="text-ink/55">pending</p>
            </div>
            <div class="rounded-lg border border-ink/10 bg-linen p-3">
              <p class="text-2xl font-bold text-ink">{{ completedItems }}</p>
              <p class="text-ink/55">done</p>
            </div>
          </div>
        </div>
        <div class="mt-5 h-3 overflow-hidden rounded-lg bg-ink/10">
          <div class="h-full rounded-lg bg-ember transition-all" :style="{ width: `${progressPercentage}%` }" />
        </div>
      </section>

      <section v-if="showItemForm" class="surface-card p-5">
        <div class="mb-5">
          <p class="text-sm font-semibold text-ember">{{ editingItem ? 'Edit item' : 'New item' }}</p>
          <h2 class="text-xl font-bold text-ink">{{ editingItem ? editingItem.title : 'Add something to this list' }}</h2>
        </div>

        <ErrorState v-if="itemFormError" class="mb-4" :message="itemFormError" />
        <ItemForm
          :initial="editingItem"
          :loading="itemActionLoading"
          :button-label="editingItem ? 'Update item' : 'Add item'"
          @submit="handleItemSubmit"
          @cancel="closeItemForm"
        />
      </section>

      <EmptyState
        v-if="!items.length"
        title="No items yet"
        message="Add the first idea, plan, craving, movie, purchase, or promise for this list."
        action-label="Add item"
        @action="startAddItem"
      />

      <section v-else class="grid gap-4 lg:grid-cols-2">
        <ItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :created-by="item.created_by ? memberById.get(item.created_by) : null"
          :completed-by="item.completed_by ? memberById.get(item.completed_by) : null"
          :current-member-id="session?.memberId"
          @edit="startEditItem"
          @toggle="handleToggleItem"
          @delete="confirmDeleteItem"
        />
      </section>
    </div>

    <ConfirmDialog
      :open="Boolean(itemToDelete)"
      title="Delete this item?"
      :message="`This will delete '${itemToDelete?.title || 'this item'}' from the list.`"
      confirm-label="Delete item"
      :loading="deleteLoading"
      @cancel="itemToDelete = null"
      @confirm="handleDeleteItem"
    />
  </AppShell>
</template>
