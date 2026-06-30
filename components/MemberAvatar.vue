<script setup lang="ts">
import { getAvatarPreset, getMemberInitials } from '~/utils/avatar'

const props = withDefaults(
  defineProps<{
    displayName?: string | null
    avatarPreset?: string | null
    avatarUrl?: string | null
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    displayName: '',
    avatarPreset: 'heart',
    avatarUrl: null,
    size: 'md'
  }
)

const preset = computed(() => getAvatarPreset(props.avatarPreset))
const initials = computed(() => getMemberInitials(props.displayName))
const sizeClass = computed(() => {
  if (props.size === 'sm') {
    return 'size-8 text-xs'
  }

  if (props.size === 'lg') {
    return 'size-14 text-base'
  }

  return 'size-10 text-sm'
})
</script>

<template>
  <img
    v-if="avatarUrl"
    :src="avatarUrl"
    :alt="displayName || 'Member avatar'"
    class="shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-white/70"
    :class="sizeClass"
  />
  <span
    v-else-if="avatarPreset"
    class="inline-grid shrink-0 place-items-center rounded-lg bg-blush font-black shadow-sm ring-1 ring-white/70"
    :class="sizeClass"
    :title="displayName || 'Member'"
  >
    {{ preset?.emoji || initials }}
  </span>
  <span
    v-else
    class="inline-grid shrink-0 place-items-center rounded-lg bg-ink font-black text-white shadow-sm ring-1 ring-white/70"
    :class="sizeClass"
    :title="displayName || 'Member'"
  >
    {{ initials }}
  </span>
</template>
