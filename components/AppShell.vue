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
  <div class="min-h-screen bg-linen">
    <AppHeader
      :bucket-id="bucketId"
      :bucket-name="bucketName"
      :member-name="memberName"
      :member-avatar-preset="memberAvatarPreset"
      :member-avatar-url="memberAvatarUrl"
    />
    <main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <slot />
    </main>
  </div>
</template>
