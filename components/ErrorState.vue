<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    message: string
    actionLabel?: string
  }>(),
  {
    title: 'Something needs attention',
    actionLabel: ''
  }
)

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-red-800">
    <p class="font-semibold">{{ title }}</p>
    <p class="mt-1 text-sm leading-6">{{ message }}</p>
    <button v-if="actionLabel" class="mt-3 text-sm font-semibold underline" type="button" @click="emit('retry')">
      {{ actionLabel }}
    </button>
  </div>
</template>
