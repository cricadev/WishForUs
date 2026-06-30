<script setup lang="ts">
import type { BucketItem, ItemPriority } from '~/types/item'

type ItemFormPayload = {
  title: string
  description: string | null
  markdown_notes: string | null
  image_url: string | null
  priority: ItemPriority
  due_date: string | null
}

const props = withDefaults(
  defineProps<{
    initial?: BucketItem | null
    loading?: boolean
    buttonLabel?: string
  }>(),
  {
    initial: null,
    loading: false,
    buttonLabel: 'Save item'
  }
)

const emit = defineEmits<{
  submit: [payload: ItemFormPayload]
  cancel: []
}>()

const title = ref('')
const description = ref('')
const markdownNotes = ref('')
const imageUrl = ref('')
const priority = ref<ItemPriority>('medium')
const dueDate = ref('')
const localError = ref('')

watch(
  () => props.initial,
  (nextInitial) => {
    title.value = nextInitial?.title || ''
    description.value = nextInitial?.description || ''
    markdownNotes.value = nextInitial?.markdown_notes || ''
    imageUrl.value = nextInitial?.image_url || ''
    priority.value = nextInitial?.priority || 'medium'
    dueDate.value = nextInitial?.due_date || ''
    localError.value = ''
  },
  { immediate: true }
)

const submit = () => {
  localError.value = ''

  if (!title.value.trim()) {
    localError.value = 'Item title is required.'
    return
  }

  emit('submit', {
    title: title.value,
    description: description.value.trim() || null,
    markdown_notes: markdownNotes.value.trim() || null,
    image_url: imageUrl.value.trim() || null,
    priority: priority.value,
    due_date: dueDate.value || null
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <label class="block">
      <span class="field-label">Title</span>
      <input v-model="title" class="field-input mt-2" maxlength="140" placeholder="Try ramen together" />
    </label>

    <label class="block">
      <span class="field-label">Description</span>
      <textarea v-model="description" class="field-textarea mt-2" maxlength="360" placeholder="Optional detail" />
    </label>

    <label class="block">
      <span class="field-label">Notes</span>
      <textarea v-model="markdownNotes" class="field-textarea mt-2" maxlength="1200" placeholder="Plain text notes for now" />
    </label>

    <label class="block">
      <span class="field-label">Image URL</span>
      <input v-model="imageUrl" class="field-input mt-2" type="url" placeholder="https://example.com/photo.jpg" />
    </label>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block">
        <span class="field-label">Priority</span>
        <select v-model="priority" class="field-input mt-2">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label class="block">
        <span class="field-label">Due date</span>
        <input v-model="dueDate" class="field-input mt-2" type="date" />
      </label>
    </div>

    <ErrorState v-if="localError" :message="localError" />

    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button class="btn-secondary" type="button" @click="emit('cancel')">Cancel</button>
      <button class="btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Saving...' : buttonLabel }}
      </button>
    </div>
  </form>
</template>
