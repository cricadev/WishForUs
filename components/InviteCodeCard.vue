<script setup lang="ts">
const props = defineProps<{
  inviteCode: string
}>()

const { copyInviteCode } = useInviteCode()
const copied = ref(false)

const copy = async () => {
  copied.value = await copyInviteCode(props.inviteCode)

  if (copied.value) {
    window.setTimeout(() => {
      copied.value = false
    }, 1800)
  }
}
</script>

<template>
  <section class="surface-card p-5">
    <p class="text-sm font-semibold text-ember">Invite code</p>
    <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
      <code class="rounded-lg border border-dashed border-ink/20 bg-linen px-4 py-3 text-center text-lg font-black tracking-wider text-ink">
        {{ inviteCode }}
      </code>
      <button class="btn-primary" type="button" @click="copy">
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
    <p class="mt-3 text-sm leading-6 text-ink/60">Share this code with your person so they can join this bucket.</p>
  </section>
</template>
