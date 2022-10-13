<template>
  <v-card v-if="infos.length" :loading="loading" class="card-center mb-4" elevation="10" max-width="500">
    <v-card-title>Deposit Info</v-card-title>
    <v-card-text>
      <v-timeline v-for="(item, index) in infos" :key="index" side="end" class="justify-start">
        <v-timeline-item
          :dot-color="item.color"
          size="small"
        >
          <template v-slot:icon>
            <span>{{ index + 1 }}</span>
          </template>
          <v-card>
            <v-card-title :class="['text-h6', `bg-${item.color}`]">
              {{ item.title }}
            </v-card-title>
            <v-card-text class="white text--primary">
              <p class="mt-2">{{ item.msg }}</p>
              <v-btn
                v-if="item.txHash"
                class="mt-2"
                :color="item.color"
                variant="outlined"
                @click="viewScan(item.txHash)"
              >
                View
              </v-btn>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </v-card>
</template>

<script setup>
  import { useTxStore } from '@/store/tx'
  import { useBridgeStore } from '@/store/bridge'
  import { storeToRefs } from 'pinia'
  import { computed, watch } from 'vue';

  const txStore = useTxStore()
  const bridgeStore = useBridgeStore()

  const { depositInfo, proposalInfo, loading } = storeToRefs(txStore)

  const infos = computed(() => {
    return [ ...depositInfo.value, ...proposalInfo.value ].map(item => {
      const color = item.status === 'info' ? 'indigo-lighten-2' : (
        item.status === 'error' ? 'red-lighten-2' : 'green-lighten-1'
      )
      return {
        ...item,
        color
      }
    })
  })

  watch(infos, () => {
    window.scrollTo({top: 0, behavior: 'smooth'})
  })

  const viewScan = (txHash) => {
    window.open(`${bridgeStore.currentFromChain.blockExplorer}/tx/${txHash}`, '_blank')
  }
</script>

<style>

</style>