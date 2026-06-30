<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    loading?: boolean
  }>(),
  {
    confirmLabel: 'Delete',
    loading: false
  }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4 backdrop-blur-sm">
      <section class="w-full max-w-md rounded-lg bg-cream p-5 shadow-soft">
        <h2 class="text-xl font-bold text-ink">{{ title }}</h2>
        <p class="mt-2 text-sm leading-6 text-ink/65">{{ message }}</p>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button class="btn-secondary" type="button" :disabled="loading" @click="emit('cancel')">Cancel</button>
          <button class="btn-danger" type="button" :disabled="loading" @click="emit('confirm')">
            {{ loading ? 'Deleting...' : confirmLabel }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
