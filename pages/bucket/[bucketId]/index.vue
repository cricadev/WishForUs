<script setup lang="ts">
import type { Bucket } from '~/types/bucket'
import type { BucketItem } from '~/types/item'
import type { BucketList } from '~/types/list'
import type { Member } from '~/types/member'
import { friendlyError } from '~/utils/errors'

const route = useRoute()
const bucketId = computed(() => String(route.params.bucketId || ''))

const { fetchBucketById } = useBuckets()
const { createList, deleteList, fetchListsByBucket, updateList } = useLists()
const { fetchItemsByList } = useItems()
const { fetchMembersByBucket, updateMemberProfile } = useMembers()
const { loadSession, session, updateProfile } = useCurrentMember()

const bucket = ref<Bucket | null>(null)
const lists = ref<BucketList[]>([])
const itemsByList = ref<Record<string, BucketItem[]>>({})
const members = ref<Member[]>([])
const loading = ref(true)
const error = ref('')

const showListForm = ref(false)
const editingList = ref<BucketList | null>(null)
const listActionLoading = ref(false)
const listFormError = ref('')
const listToDelete = ref<BucketList | null>(null)
const deleteLoading = ref(false)

const nicknameInput = ref('')
const avatarPresetInput = ref('heart')
const avatarUrlInput = ref('')
const nicknameMessage = ref('')
const nicknameError = ref('')

const allItems = computed(() => Object.values(itemsByList.value).flat())
const completedItems = computed(() => allItems.value.filter((item) => item.status === 'done').length)
const memberById = computed(() => new Map(members.value.map((member) => [member.id, member])))
const recentItems = computed(() =>
  [...allItems.value]
    .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
    .slice(0, 5)
)

const listStats = (listId: string) => {
  const items = itemsByList.value[listId] || []

  return {
    itemCount: items.length,
    completedCount: items.filter((item) => item.status === 'done').length
  }
}

useHead({
  title: computed(() => (bucket.value ? `${bucket.value.name} - WishForUS` : 'Bucket - WishForUS'))
})

const refresh = async () => {
  loading.value = true
  error.value = ''

  try {
    const foundBucket = await fetchBucketById(bucketId.value)

    if (!foundBucket) {
      throw new Error('We could not find that bucket.')
    }

    bucket.value = foundBucket
    const [foundMembers, foundLists] = await Promise.all([
      fetchMembersByBucket(bucketId.value),
      fetchListsByBucket(bucketId.value)
    ])

    members.value = foundMembers
    lists.value = foundLists

    const itemEntries = await Promise.all(
      lists.value.map(async (list) => {
        const items = await fetchItemsByList(list.id)
        return [list.id, items] as const
      })
    )

    itemsByList.value = Object.fromEntries(itemEntries)
  } catch (caughtError) {
    error.value = friendlyError(caughtError, 'We could not load this bucket.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loadSession()
  nicknameInput.value = session.value?.displayName || ''
  avatarPresetInput.value = session.value?.avatarPreset || 'heart'
  avatarUrlInput.value = session.value?.avatarUrl || ''
  await refresh()
})

const startCreateList = () => {
  editingList.value = null
  listFormError.value = ''
  showListForm.value = true
}

const startEditList = (list: BucketList) => {
  editingList.value = list
  listFormError.value = ''
  showListForm.value = true
}

const closeListForm = () => {
  showListForm.value = false
  editingList.value = null
  listFormError.value = ''
}

const handleListSubmit = async (payload: { title: string; description: string | null }) => {
  listActionLoading.value = true
  listFormError.value = ''

  try {
    if (editingList.value) {
      await updateList(editingList.value.id, payload)
    } else {
      await createList(bucketId.value, payload, session.value?.memberId)
    }

    closeListForm()
    await refresh()
  } catch (caughtError) {
    listFormError.value = friendlyError(caughtError, 'We could not save that list.')
  } finally {
    listActionLoading.value = false
  }
}

const confirmDeleteList = (list: BucketList) => {
  listToDelete.value = list
}

const handleDeleteList = async () => {
  if (!listToDelete.value) {
    return
  }

  deleteLoading.value = true
  error.value = ''

  try {
    await deleteList(listToDelete.value.id)
    listToDelete.value = null
    await refresh()
  } catch (caughtError) {
    error.value = friendlyError(caughtError, 'We could not delete that list.')
  } finally {
    deleteLoading.value = false
  }
}

const saveProfile = async () => {
  nicknameError.value = ''
  nicknameMessage.value = ''

  if (!nicknameInput.value.trim()) {
    nicknameError.value = 'Display name is required.'
    return
  }

  if (!session.value) {
    nicknameError.value = 'Create or join a bucket first to save your local display name.'
    return
  }

  try {
    const updatedMember = await updateMemberProfile(session.value.memberId, {
      displayName: nicknameInput.value,
      avatarPreset: avatarPresetInput.value,
      avatarUrl: avatarUrlInput.value
    })

    updateProfile({
      displayName: updatedMember.display_name,
      avatarPreset: updatedMember.avatar_preset || 'heart',
      avatarUrl: updatedMember.avatar_url || null
    })
    nicknameMessage.value = 'Saved for this browser and bucket.'
    await refresh()
  } catch (caughtError) {
    nicknameError.value = friendlyError(caughtError, 'We could not update your profile.')
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
    <LoadingState v-if="loading" label="Loading bucket..." />

    <ErrorState v-else-if="error" :message="error" action-label="Try again" @retry="refresh" />

    <div v-else-if="bucket" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="space-y-6">
        <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <NuxtLink to="/" class="text-sm font-semibold text-ember">Home</NuxtLink>
            <h1 class="mt-2 break-words text-3xl font-black tracking-normal text-ink sm:text-4xl">
              {{ bucket.name }}
            </h1>
            <p class="mt-2 text-sm leading-6 text-ink/60">
              {{ session?.displayName || 'A shared space' }} in WishForUS
            </p>
          </div>

          <button class="btn-primary" type="button" @click="startCreateList">New list</button>
        </section>

        <ProgressSummary
          :total-items="allItems.length"
          :completed-items="completedItems"
          :list-count="lists.length"
          :recent-item-title="recentItems[0]?.title"
        />

        <section v-if="showListForm" class="surface-card p-5">
          <div class="mb-5">
            <p class="text-sm font-semibold text-ember">{{ editingList ? 'Edit list' : 'New list' }}</p>
            <h2 class="text-xl font-bold text-ink">{{ editingList ? editingList.title : 'Create a list' }}</h2>
          </div>

          <ErrorState v-if="listFormError" class="mb-4" :message="listFormError" />
          <ListForm
            :initial="editingList"
            :loading="listActionLoading"
            :button-label="editingList ? 'Update list' : 'Create list'"
            @submit="handleListSubmit"
            @cancel="closeListForm"
          />
        </section>

        <EmptyState
          v-if="!lists.length"
          title="No lists yet"
          message="Start with places, food, dates, movies, future dreams, or anything the two of you keep saying you should do."
          action-label="Create a list"
          @action="startCreateList"
        />

        <section v-else class="grid gap-4 sm:grid-cols-2">
          <ListCard
            v-for="list in lists"
            :key="list.id"
            :list="list"
            :bucket-id="bucket.id"
            :item-count="listStats(list.id).itemCount"
            :completed-count="listStats(list.id).completedCount"
            :creator="list.created_by ? memberById.get(list.created_by) : null"
            :current-member-id="session?.memberId"
            @edit="startEditList"
            @delete="confirmDeleteList"
          />
        </section>
      </div>

      <aside class="space-y-6">
        <MembersSection :members="members" :current-member-id="session?.memberId" />

        <InviteCodeCard :invite-code="bucket.invite_code" />

        <section class="surface-card p-5">
          <div class="flex items-center gap-3">
            <MemberAvatar
              :display-name="nicknameInput || session?.displayName"
              :avatar-preset="avatarPresetInput"
              :avatar-url="avatarUrlInput"
              size="lg"
            />
            <div>
              <p class="text-sm font-semibold text-fern">You</p>
              <h2 class="text-lg font-bold text-ink">Nickname and avatar</h2>
            </div>
          </div>
          <label class="mt-3 block">
            <span class="field-label">Display name</span>
            <input v-model="nicknameInput" class="field-input mt-2" maxlength="60" placeholder="Your name" />
          </label>
          <AvatarPicker v-model="avatarPresetInput" class="mt-4" :display-name="nicknameInput" />
          <label class="mt-4 block">
            <span class="field-label">Avatar image URL</span>
            <input v-model="avatarUrlInput" class="field-input mt-2" type="url" placeholder="Optional image link" />
          </label>
          <ErrorState v-if="nicknameError" class="mt-3" :message="nicknameError" />
          <p v-if="nicknameMessage" class="mt-3 rounded-lg bg-sage/15 px-3 py-2 text-sm font-semibold text-fern">
            {{ nicknameMessage }}
          </p>
          <button class="btn-secondary mt-4 w-full" type="button" @click="saveProfile">Save profile</button>
        </section>

        <section class="surface-card p-5">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-bold text-ink">Recently added</h2>
            <span class="text-sm font-semibold text-ink/45">{{ recentItems.length }}</span>
          </div>

          <div v-if="recentItems.length" class="mt-4 space-y-3">
            <NuxtLink
              v-for="item in recentItems"
              :key="item.id"
              :to="`/bucket/${bucket.id}/list/${item.list_id}`"
              class="block rounded-lg border border-ink/10 bg-linen px-3 py-3 transition hover:border-ember/40"
            >
              <div class="flex items-center gap-2">
                <MemberAvatar
                  v-if="item.created_by && memberById.get(item.created_by)"
                  :display-name="memberById.get(item.created_by)?.display_name"
                  :avatar-preset="memberById.get(item.created_by)?.avatar_preset"
                  :avatar-url="memberById.get(item.created_by)?.avatar_url"
                  size="sm"
                />
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-ink">{{ item.title }}</p>
                  <p class="mt-1 text-xs capitalize text-ink/50">{{ item.status }} / {{ item.priority }} priority</p>
                </div>
              </div>
            </NuxtLink>
          </div>

          <p v-else class="mt-4 text-sm leading-6 text-ink/60">New items will collect here as you add them.</p>
        </section>
      </aside>
    </div>

    <ConfirmDialog
      :open="Boolean(listToDelete)"
      title="Delete this list?"
      :message="`This will delete '${listToDelete?.title || 'this list'}' and every item inside it.`"
      confirm-label="Delete list"
      :loading="deleteLoading"
      @cancel="listToDelete = null"
      @confirm="handleDeleteList"
    />
  </AppShell>
</template>
