<script setup lang="ts">
defineProps<{
  bucketId?: string
  bucketName?: string | null
  memberName?: string | null
  memberAvatarPreset?: string | null
  memberAvatarUrl?: string | null
}>()
</script>

<template>
  <header class="border-b border-ink/10 bg-cream/90 backdrop-blur">
    <div class="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <NuxtLink to="/" class="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
        <span class="grid size-8 place-items-center rounded-lg bg-ink text-sm font-black text-white">WF</span>
        <span>WishForUS</span>
      </NuxtLink>

      <div class="flex items-center gap-2 text-right">
        <span v-if="memberName" class="hidden sm:inline-flex">
          <MemberAvatar
            :display-name="memberName"
            :avatar-preset="memberAvatarPreset"
            :avatar-url="memberAvatarUrl"
            size="sm"
          />
        </span>
        <div v-if="bucketName || memberName" class="hidden sm:block">
          <p v-if="bucketName" class="max-w-52 truncate text-sm font-semibold text-ink">{{ bucketName }}</p>
          <p v-if="memberName" class="max-w-52 truncate text-xs text-ink/55">{{ memberName }}</p>
        </div>

        <NuxtLink
          v-if="bucketId"
          :to="`/bucket/${bucketId}/settings`"
          class="btn-secondary min-h-10 px-3"
        >
          Settings
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
