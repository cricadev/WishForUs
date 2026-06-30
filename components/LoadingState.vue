<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Loading...'
  }
)
</script>

<template>
  <div class="surface-card flex items-center gap-3 px-4 py-4 text-sm font-medium text-ink/65">
    <span class="size-4 animate-spin rounded-full border-2 border-ink/20 border-t-ember" />
    <span>{{ label }}</span>
  </div>
</template>
