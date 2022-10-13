<template>
  <v-chip color="red" text-color="white">{{ computedBridgeFee }}</v-chip>
</template>

<script setup>
  import { useBridgeStore } from '@/store/bridge'
  import { storeToRefs } from 'pinia'
  import { computed } from 'vue'
  const bridgeStore = useBridgeStore()

  const { bridgeFee, wallet } = storeToRefs(bridgeStore)

  const computedBridgeFee = computed(() => {
    if (bridgeFee) {
      return `Bridge Fee ${bridgeFee.value} ${wallet.value.symbol || ''}`
    }
    return `Bridge Fee`
  })
</script>

<style>

</style>