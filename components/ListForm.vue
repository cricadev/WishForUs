<script setup lang="ts">
import type { BucketList } from '~/types/list'

type ListFormPayload = {
  title: string
  description: string | null
}

const props = withDefaults(
  defineProps<{
    initial?: BucketList | null
    loading?: boolean
    buttonLabel?: string
  }>(),
  {
    initial: null,
    loading: false,
    buttonLabel: 'Save list'
  }
)

const emit = defineEmits<{
  submit: [payload: ListFormPayload]
  cancel: []
}>()

const title = ref(props.initial?.title || '')
const description = ref(props.initial?.description || '')
const localError = ref('')

watch(
  () => props.initial,
  (nextInitial) => {
    title.value = nextInitial?.title || ''
    description.value = nextInitial?.description || ''
    localError.value = ''
  },
  { immediate: true }
)

const submit = () => {
  localError.value = ''

  if (!title.value.trim()) {
    localError.value = 'List title is required.'
    return
  }

  emit('submit', {
    title: title.value,
    description: description.value.trim() || null
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <label class="block">
      <span class="field-label">Title</span>
      <input v-model="title" class="field-input mt-2" maxlength="100" placeholder="Places we want to visit" />
    </label>

    <label class="block">
      <span class="field-label">Description</span>
      <textarea v-model="description" class="field-textarea mt-2" maxlength="240" placeholder="Optional notes for this list" />
    </label>

    <ErrorState v-if="localError" :message="localError" />

    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button class="btn-secondary" type="button" @click="emit('cancel')">Cancel</button>
      <button class="btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Saving...' : buttonLabel }}
      </button>
    </div>
  </form>
</template>
