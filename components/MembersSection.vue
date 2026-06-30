<script setup lang="ts">
import type { Member } from '~/types/member'

const props = defineProps<{
  members: Member[]
  currentMemberId?: string | null
}>()

const joinedLabel = (createdAt: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(createdAt))

const sortedMembers = computed(() =>
  [...props.members].sort((first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime())
)

const onlyCurrentMember = computed(() => props.members.length === 1 && props.members[0]?.id === props.currentMemberId)
</script>

<template>
  <section class="surface-card p-5">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-fern">Together</p>
        <h2 class="text-lg font-bold text-ink">Members in this bucket</h2>
      </div>
      <span class="rounded-full bg-sage/15 px-2.5 py-1 text-xs font-bold text-fern">{{ members.length }}</span>
    </div>

    <div v-if="sortedMembers.length" class="mt-4 space-y-3">
      <div
        v-for="member in sortedMembers"
        :key="member.id"
        class="flex items-center gap-3 rounded-lg border border-ink/10 bg-linen p-3"
      >
        <MemberAvatar
          :display-name="member.display_name"
          :avatar-preset="member.avatar_preset"
          :avatar-url="member.avatar_url"
        />
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="break-words text-sm font-bold text-ink">{{ member.display_name }}</p>
            <span
              v-if="member.id === currentMemberId"
              class="rounded-full bg-ember/10 px-2 py-0.5 text-xs font-bold text-ember"
            >
              You
            </span>
          </div>
          <p class="mt-0.5 text-xs text-ink/50">Joined {{ joinedLabel(member.created_at) }}</p>
        </div>
      </div>
    </div>

    <p v-else class="mt-4 text-sm leading-6 text-ink/60">Members will appear here after joining this bucket.</p>
    <p v-if="onlyCurrentMember" class="mt-4 rounded-lg bg-blush/60 px-3 py-3 text-sm leading-6 text-ink/65">
      Share the invite code so your person can join this bucket.
    </p>
  </section>
</template>
