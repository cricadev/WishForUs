<script setup lang="ts">
import { friendlyError } from '~/utils/errors'

const router = useRouter()
const { createBucket, joinBucket } = useBuckets()
const { loadSession, saveSession, session } = useCurrentMember()

const createLoading = ref(false)
const joinLoading = ref(false)
const createError = ref('')
const joinError = ref('')

const resumePath = computed(() => {
  if (!session.value?.bucketId) {
    return ''
  }

  return `/bucket/${session.value.bucketId}`
})

useHead({
  title: 'WishForUS - Shared lists for two'
})

onMounted(() => {
  loadSession()
})

const handleCreate = async (payload: {
  name: string
  displayName: string
  avatarPreset: string
  avatarUrl: string | null
}) => {
  createLoading.value = true
  createError.value = ''
  joinError.value = ''

  try {
    const { bucket, member } = await createBucket(payload)
    saveSession({
      bucketId: bucket.id,
      memberId: member.id,
      displayName: member.display_name,
      avatarPreset: member.avatar_preset || 'heart',
      avatarUrl: member.avatar_url || null
    })
    await router.push(`/bucket/${bucket.id}`)
  } catch (error) {
    createError.value = friendlyError(error, 'We could not create that bucket yet. Please try again.')
  } finally {
    createLoading.value = false
  }
}

const handleJoin = async (payload: {
  inviteCode: string
  displayName: string
  avatarPreset: string
  avatarUrl: string | null
}) => {
  joinLoading.value = true
  createError.value = ''
  joinError.value = ''

  try {
    const { bucket, member } = await joinBucket(payload)
    saveSession({
      bucketId: bucket.id,
      memberId: member.id,
      displayName: member.display_name,
      avatarPreset: member.avatar_preset || 'heart',
      avatarUrl: member.avatar_url || null
    })
    await router.push(`/bucket/${bucket.id}`)
  } catch (error) {
    joinError.value = friendlyError(error, 'We could not join that bucket yet. Please try again.')
  } finally {
    joinLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-linen">
    <header class="absolute inset-x-0 top-0 z-20">
      <div class="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-4 text-white sm:px-6 lg:px-8">
        <NuxtLink to="/" class="flex items-center gap-2 text-base font-bold sm:text-lg">
          <span class="grid size-8 place-items-center rounded-lg bg-white text-sm font-black text-ink">WF</span>
          <span>WishForUS</span>
        </NuxtLink>

        <NuxtLink v-if="resumePath" :to="resumePath" class="rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-ink">
          Resume
        </NuxtLink>
      </div>
    </header>

    <section class="relative min-h-[58vh] overflow-hidden bg-ink">
      <img
        src="/images/wishforus-hero.png"
        alt="Cozy notebooks, keepsakes, and a shared planning screen"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/15" />
      <div class="relative z-10 mx-auto flex min-h-[58vh] w-full max-w-6xl items-end px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div class="max-w-2xl text-white">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Private lists for two</p>
          <h1 class="mt-4 text-4xl font-black tracking-normal sm:text-6xl">WishForUS</h1>
          <p class="mt-5 max-w-xl text-base leading-7 text-white/86 sm:text-lg">
            Create a private little universe for your plans, dreams, dates, movies, food cravings, and future adventures.
          </p>
        </div>
      </div>
    </section>

    <main class="mx-auto -mt-8 grid w-full max-w-6xl gap-4 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <BucketCreateForm :loading="createLoading" :error="createError" @create="handleCreate" />
      <BucketJoinForm :loading="joinLoading" :error="joinError" @join="handleJoin" />
    </main>
  </div>
</template>
