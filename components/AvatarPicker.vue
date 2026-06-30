<script setup lang="ts">
import { avatarPresets, defaultAvatarPreset } from '~/utils/avatar'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    displayName?: string
  }>(),
  {
    modelValue: defaultAvatarPreset,
    displayName: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedValue = computed(() => props.modelValue || defaultAvatarPreset)
</script>

<template>
  <div>
    <span class="field-label">Avatar</span>
    <div class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
      <button
        v-for="preset in avatarPresets"
        :key="preset.id"
        class="flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border bg-cream p-2 text-xs font-semibold text-ink transition"
        :class="selectedValue === preset.id ? 'border-ember ring-4 ring-ember/10' : 'border-ink/10 hover:border-ink/25'"
        type="button"
        @click="emit('update:modelValue', preset.id)"
      >
        <span class="grid size-10 place-items-center rounded-lg bg-blush text-xl">{{ preset.emoji }}</span>
        <span>{{ preset.label }}</span>
      </button>
    </div>
  </div>
</template>
