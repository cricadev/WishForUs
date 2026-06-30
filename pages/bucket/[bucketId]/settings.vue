<script setup lang="ts">
import type { Bucket } from '~/types/bucket'
import type { Member } from '~/types/member'
import { friendlyError } from '~/utils/errors'

const route = useRoute()
const bucketId = computed(() => String(route.params.bucketId || ''))

const { fetchBucketById, updateBucketName } = useBuckets()
const { fetchMembersByBucket, updateMemberProfile } = useMembers()
const { clearSession, loadSession, session, updateProfile } = useCurrentMember()

const bucket = ref<Bucket | null>(null)
const members = ref<Member[]>([])
const bucketName = ref('')
const displayName = ref('')
const avatarPreset = ref('heart')
const avatarUrl = ref('')
const loading = ref(true)
const savingBucket = ref(false)
const savingName = ref(false)
const error = ref('')
const bucketMessage = ref('')
const nameMessage = ref('')

useHead({
  title: 'Settings - WishForUS'
})

const refresh = async () => {
  loading.value = true
  error.value = ''

  try {
    const [foundBucket, foundMembers] = await Promise.all([
      fetchBucketById(bucketId.value),
      fetchMembersByBucket(bucketId.value)
    ])

    if (!foundBucket) {
      throw new Error('We could not find that bucket.')
    }

    bucket.value = foundBucket
    members.value = foundMembers
    bucketName.value = foundBucket.name
  } catch (caughtError) {
    error.value = friendlyError(caughtError, 'We could not load settings.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loadSession()
  displayName.value = session.value?.displayName || ''
  avatarPreset.value = session.value?.avatarPreset || 'heart'
  avatarUrl.value = session.value?.avatarUrl || ''
  await refresh()
})

const saveBucketName = async () => {
  savingBucket.value = true
  error.value = ''
  bucketMessage.value = ''

  try {
    bucket.value = await updateBucketName(bucketId.value, bucketName.value)
    bucketMessage.value = 'Bucket name updated.'
  } catch (caughtError) {
    error.value = friendlyError(caughtError, 'We could not update the bucket name.')
  } finally {
    savingBucket.value = false
  }
}

const saveDisplayName = async () => {
  savingName.value = true
  error.value = ''
  nameMessage.value = ''

  try {
    if (!displayName.value.trim()) {
      throw new Error('Display name is required.')
    }

    if (!session.value) {
      throw new Error('Create or join a bucket first to save your local display name.')
    }

    const updatedMember = await updateMemberProfile(session.value.memberId, {
      displayName: displayName.value,
      avatarPreset: avatarPreset.value,
      avatarUrl: avatarUrl.value
    })

    updateProfile({
      displayName: updatedMember.display_name,
      avatarPreset: updatedMember.avatar_preset || 'heart',
      avatarUrl: updatedMember.avatar_url || null
    })
    nameMessage.value = 'Profile saved for this browser and bucket.'
    await refresh()
  } catch (caughtError) {
    error.value = friendlyError(caughtError, 'We could not update your display name.')
  } finally {
    savingName.value = false
  }
}

const leaveLocalBucket = async () => {
  clearSession()
  await navigateTo('/')
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
    <LoadingState v-if="loading" label="Loading settings..." />

    <ErrorState v-else-if="error && !bucket" :message="error" action-label="Try again" @retry="refresh" />

    <div v-else-if="bucket" class="mx-auto max-w-3xl space-y-6">
      <section>
        <NuxtLink :to="`/bucket/${bucket.id}`" class="text-sm font-semibold text-ember">Back to bucket</NuxtLink>
        <h1 class="mt-2 text-3xl font-black tracking-normal text-ink sm:text-4xl">Settings</h1>
      </section>

      <ErrorState v-if="error" :message="error" />

      <form class="surface-card p-5" @submit.prevent="saveBucketName">
        <div class="mb-5">
          <p class="text-sm font-semibold text-ember">Bucket</p>
          <h2 class="text-xl font-bold text-ink">Shared name</h2>
        </div>

        <label class="block">
          <span class="field-label">Bucket name</span>
          <input v-model="bucketName" class="field-input mt-2" maxlength="80" />
        </label>

        <p v-if="bucketMessage" class="mt-3 rounded-lg bg-sage/15 px-3 py-2 text-sm font-semibold text-fern">
          {{ bucketMessage }}
        </p>

        <button class="btn-primary mt-5" type="submit" :disabled="savingBucket">
          {{ savingBucket ? 'Saving...' : 'Save bucket name' }}
        </button>
      </form>

      <InviteCodeCard :invite-code="bucket.invite_code" />

      <form class="surface-card p-5" @submit.prevent="saveDisplayName">
        <div class="mb-5">
          <p class="text-sm font-semibold text-fern">You</p>
          <h2 class="text-xl font-bold text-ink">Nickname and avatar</h2>
        </div>

        <label class="block">
          <span class="field-label">Display name</span>
          <input v-model="displayName" class="field-input mt-2" maxlength="60" placeholder="Your name" />
        </label>

        <AvatarPicker v-model="avatarPreset" class="mt-4" :display-name="displayName" />

        <label class="mt-4 block">
          <span class="field-label">Avatar image URL</span>
          <input v-model="avatarUrl" class="field-input mt-2" type="url" placeholder="Optional image link" />
        </label>

        <p v-if="nameMessage" class="mt-3 rounded-lg bg-sage/15 px-3 py-2 text-sm font-semibold text-fern">
          {{ nameMessage }}
        </p>

        <button class="btn-secondary mt-5" type="submit" :disabled="savingName">
          {{ savingName ? 'Saving...' : 'Save profile' }}
        </button>
      </form>

      <MembersSection :members="members" :current-member-id="session?.memberId" />

      <section class="rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 class="text-xl font-bold text-red-800">Leave this browser session</h2>
        <p class="mt-2 text-sm leading-6 text-red-700">
          This clears only the saved bucket and display name from this browser.
        </p>
        <button class="btn-danger mt-5" type="button" @click="leaveLocalBucket">Clear local session</button>
      </section>
    </div>
  </AppShell>
</template>
