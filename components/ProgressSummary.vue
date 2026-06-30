<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    totalItems: number
    completedItems: number
    listCount?: number
    recentItemTitle?: string
  }>(),
  {
    listCount: 0,
    recentItemTitle: ''
  }
)

const percentage = computed(() => {
  if (!props.totalItems) {
    return 0
  }

  return Math.round((props.completedItems / props.totalItems) * 100)
})
</script>

<template>
  <section class="surface-card p-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-ember">{{ percentage }}% complete</p>
        <h2 class="mt-1 text-2xl font-bold tracking-normal text-ink">
          {{ completedItems }} of {{ totalItems }} dreams completed
        </h2>
      </div>
      <div class="grid grid-cols-2 gap-2 text-sm sm:min-w-56">
        <div class="rounded-lg border border-ink/10 bg-linen p-3">
          <p class="text-2xl font-bold text-ink">{{ listCount }}</p>
          <p class="text-ink/55">lists</p>
        </div>
        <div class="rounded-lg border border-ink/10 bg-linen p-3">
          <p class="text-2xl font-bold text-ink">{{ totalItems }}</p>
          <p class="text-ink/55">items</p>
        </div>
      </div>
    </div>

    <div class="mt-5 h-3 overflow-hidden rounded-lg bg-ink/10">
      <div class="h-full rounded-lg bg-ember transition-all" :style="{ width: `${percentage}%` }" />
    </div>

    <p v-if="recentItemTitle" class="mt-4 truncate text-sm text-ink/60">
      Last item added: <span class="font-semibold text-ink">{{ recentItemTitle }}</span>
    </p>
  </section>
</template>
