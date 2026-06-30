<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean
    error?: string
  }>(),
  {
    loading: false,
    error: ''
  }
)

const emit = defineEmits<{
  create: [payload: { name: string; displayName: string; avatarPreset: string; avatarUrl: string | null }]
}>()

const name = ref('')
const displayName = ref('')
const avatarPreset = ref('heart')
const avatarUrl = ref('')
const localError = ref('')

const submit = () => {
  localError.value = ''

  if (!name.value.trim()) {
    localError.value = 'Bucket name is required.'
    return
  }

  if (!displayName.value.trim()) {
    localError.value = 'Display name is required.'
    return
  }

  emit('create', {
    name: name.value,
    displayName: displayName.value,
    avatarPreset: avatarPreset.value,
    avatarUrl: avatarUrl.value.trim() || null
  })
}
</script>

<template>
  <form class="surface-card p-5" @submit.prevent="submit">
    <div class="mb-5">
      <p class="text-sm font-semibold text-ember">Create</p>
      <h2 class="mt-1 text-xl font-bold text-ink">Start a bucket</h2>
    </div>

    <div class="space-y-4">
      <label class="block">
        <span class="field-label">Bucket name</span>
        <input v-model="name" class="field-input mt-2" maxlength="80" placeholder="Cristian & Valentina" />
      </label>

      <label class="block">
        <span class="field-label">Your display name</span>
        <input v-model="displayName" class="field-input mt-2" maxlength="60" placeholder="Cristian" />
      </label>

      <AvatarPicker v-model="avatarPreset" :display-name="displayName" />

      <label class="block">
        <span class="field-label">Avatar image URL</span>
        <input v-model="avatarUrl" class="field-input mt-2" type="url" placeholder="Optional image link" />
      </label>
    </div>

    <ErrorState v-if="localError || error" class="mt-4" :message="localError || error" />

    <button class="btn-primary mt-5 w-full" type="submit" :disabled="loading">
      {{ loading ? 'Creating...' : 'Create bucket' }}
    </button>
  </form>
</template>
