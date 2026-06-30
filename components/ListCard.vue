<script setup lang="ts">
import type { BucketList } from '~/types/list'
import type { Member } from '~/types/member'

const props = defineProps<{
  list: BucketList
  bucketId: string
  itemCount: number
  completedCount: number
  creator?: Member | null
  currentMemberId?: string | null
}>()

const emit = defineEmits<{
  edit: [list: BucketList]
  delete: [list: BucketList]
}>()

const percentage = computed(() => {
  if (!props.itemCount) {
    return 0
  }

  return Math.round((props.completedCount / props.itemCount) * 100)
})

const creatorLabel = computed(() => {
  if (!props.creator) {
    return 'Created by someone'
  }

  if (props.creator.id === props.currentMemberId) {
    return 'Created by you'
  }

  return `Created by ${props.creator.display_name}`
})
</script>

<template>
  <article class="surface-card flex h-full flex-col p-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="break-words text-lg font-bold text-ink">{{ list.title }}</h3>
        <p v-if="list.description" class="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">
          {{ list.description }}
        </p>
      </div>
      <span class="rounded-full bg-sage/15 px-2.5 py-1 text-xs font-bold text-fern">{{ percentage }}%</span>
    </div>

    <div class="mt-4 flex items-center gap-2 text-xs font-semibold text-ink/55">
      <MemberAvatar
        v-if="creator"
        :display-name="creator.display_name"
        :avatar-preset="creator.avatar_preset"
        :avatar-url="creator.avatar_url"
        size="sm"
      />
      <span>{{ creatorLabel }}</span>
    </div>

    <div class="mt-5 h-2 overflow-hidden rounded-lg bg-ink/10">
      <div class="h-full rounded-lg bg-sage" :style="{ width: `${percentage}%` }" />
    </div>

    <div class="mt-4 flex items-center justify-between text-sm text-ink/55">
      <span>{{ completedCount }} done</span>
      <span>{{ itemCount }} items</span>
    </div>

    <div class="mt-5 grid grid-cols-3 gap-2">
      <NuxtLink class="btn-primary min-h-10 px-3" :to="`/bucket/${bucketId}/list/${list.id}`">
        Open
      </NuxtLink>
      <button class="btn-secondary min-h-10 px-3" type="button" @click="emit('edit', list)">
        Edit
      </button>
      <button class="btn-secondary min-h-10 px-3 text-red-700" type="button" @click="emit('delete', list)">
        Delete
      </button>
    </div>
  </article>
</template>
