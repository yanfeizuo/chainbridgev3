<template>
  <v-btn v-if="noConnect" color="primary" block @click="connect" size="x-large">connect network</v-btn>
  <v-btn v-else-if="wrongNetwork" color="primary" block @click="selectNetwork" size="x-large">switch network</v-btn>
  <v-btn v-else color="primary" :loading="loading" :disabled="actionDisabled" block @click="action" size="x-large">action</v-btn>

  <SelectModalVue title="select from network" v-model="show" :close="close" :data="fromChains" />
  
</template>

<script setup>
  import { useBridgeStore } from '@/store/bridge'
  import { useTxStore } from '@/store/tx'
  import { storeToRefs } from 'pinia'
  import { computed, ref, inject } from 'vue'

  import SelectModalVue from '@/components/SelectModal.vue'
  
  const bridgeStore = useBridgeStore()
  const txStore = useTxStore()

  const { transferAmount, currentToken, currentFromChain, wallet, fromChains } = storeToRefs(bridgeStore)
  const { loading } = storeToRefs(txStore)

  const wrongNetwork = computed(() => {
    return currentFromChain.value.networkId !== wallet.value.networkId
  })

  const actionDisabled = computed(() => {
    return !(Number(transferAmount.value) && currentToken.value)
  })

  const action = () => {
    txStore.deposit()
  }

  /**
   * switch network
   */
  const show = ref(false)

  const selectNetwork = () => {
    show.value = true
  }

  const close = ({ networkId }) => {
    show.value = false
    setChain(networkId)
  }

  const setChain = inject("setChain")

  /**
   * connect
   */
  const noConnect = computed(() => {
    return !wallet.value.account
  })
  const connect = inject('connectWallet')
</script>

<style>

</style>