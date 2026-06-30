<script setup lang="ts">
import type { BucketItem } from '~/types/item'
import type { Member } from '~/types/member'

const props = defineProps<{
  item: BucketItem
  createdBy?: Member | null
  completedBy?: Member | null
  currentMemberId?: string | null
}>()

const emit = defineEmits<{
  edit: [item: BucketItem]
  toggle: [item: BucketItem]
  delete: [item: BucketItem]
}>()

const priorityClass = computed(() => {
  if (props.item.priority === 'high') {
    return 'bg-red-50 text-red-700 border-red-200'
  }

  if (props.item.priority === 'low') {
    return 'bg-sage/15 text-fern border-sage/25'
  }

  return 'bg-blush text-ember border-blush'
})

const dueDateLabel = computed(() => {
  if (!props.item.due_date) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${props.item.due_date}T00:00:00`))
})

const memberLabel = (prefix: string, member?: Member | null) => {
  if (!member) {
    return `${prefix} someone`
  }

  if (member.id === props.currentMemberId) {
    return `${prefix} you`
  }

  return `${prefix} ${member.display_name}`
}
</script>

<template>
  <article
    class="surface-card overflow-hidden p-5 transition"
    :class="item.status === 'done' ? 'opacity-75' : ''"
  >
    <img
      v-if="item.image_url"
      :src="item.image_url"
      :alt="item.title"
      class="mb-4 aspect-video w-full rounded-lg object-cover"
    />

    <div class="flex items-start justify-between gap-3">
      <div>
        <h3
          class="break-words text-lg font-bold text-ink"
          :class="item.status === 'done' ? 'line-through decoration-ember/70 decoration-2' : ''"
        >
          {{ item.title }}
        </h3>
        <p v-if="item.description" class="mt-2 whitespace-pre-line break-words text-sm leading-6 text-ink/60">
          {{ item.description }}
        </p>
      </div>
      <span class="rounded-full border px-2.5 py-1 text-xs font-bold capitalize" :class="priorityClass">
        {{ item.priority }}
      </span>
    </div>

    <p v-if="item.markdown_notes" class="mt-4 whitespace-pre-line rounded-lg bg-linen p-3 text-sm leading-6 text-ink/65">
      {{ item.markdown_notes }}
    </p>

    <div class="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink/50">
      <span class="rounded-full bg-ink/5 px-2.5 py-1 capitalize">{{ item.status }}</span>
      <span v-if="dueDateLabel" class="rounded-full bg-tide/10 px-2.5 py-1 text-tide">Due {{ dueDateLabel }}</span>
    </div>

    <div class="mt-4 space-y-2 rounded-lg bg-linen p-3 text-xs font-semibold text-ink/55">
      <div class="flex items-center gap-2">
        <MemberAvatar
          v-if="createdBy"
          :display-name="createdBy.display_name"
          :avatar-preset="createdBy.avatar_preset"
          :avatar-url="createdBy.avatar_url"
          size="sm"
        />
        <span>{{ memberLabel('Added by', createdBy) }}</span>
      </div>
      <div v-if="item.status === 'done'" class="flex items-center gap-2">
        <MemberAvatar
          v-if="completedBy"
          :display-name="completedBy.display_name"
          :avatar-preset="completedBy.avatar_preset"
          :avatar-url="completedBy.avatar_url"
          size="sm"
        />
        <span>{{ memberLabel('Completed by', completedBy) }}</span>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-3 gap-2">
      <button class="btn-secondary min-h-10 px-3" type="button" @click="emit('toggle', item)">
        {{ item.status === 'done' ? 'Undo' : 'Done' }}
      </button>
      <button class="btn-secondary min-h-10 px-3" type="button" @click="emit('edit', item)">Edit</button>
      <button class="btn-secondary min-h-10 px-3 text-red-700" type="button" @click="emit('delete', item)">
        Delete
      </button>
    </div>
  </article>
</template>
