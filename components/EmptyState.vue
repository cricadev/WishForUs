<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    message?: string
    actionLabel?: string
  }>(),
  {
    message: '',
    actionLabel: ''
  }
)

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="surface-card px-5 py-8 text-center">
    <div class="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-blush text-lg font-bold text-ember">
      +
    </div>
    <h2 class="text-lg font-bold text-ink">{{ title }}</h2>
    <p v-if="message" class="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">{{ message }}</p>
    <button v-if="actionLabel" class="btn-primary mt-5" type="button" @click="emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>
