<template>
  <v-container>
    <section>
      <TxInfo />
      <v-card class="card-center" elevation="10" max-width="500">
        <v-card-title>BRIDGE</v-card-title>
        <v-card-text>
          <!-- from network -->
          <section class="my-4">
            <FromNetworkVue />
          </section>
          <!-- to network -->
          <section class="my-4">
            <ToNetworkVue />
          </section>
          <!-- aim token -->
          <section class="my-4">
            <FromTokensVue />
          </section>
          <!-- amount input -->
          <section class="my-4">
            <TokenAmount />
          </section>
          <!-- bridge fee -->
          <section>
            <TransferInfo />
          </section>
        </v-card-text>
        <!-- action area -->
        <v-card-actions>
          <v-btn color="primary" :loading="loading" :disabled="actionDisabled" block @click="action" size="x-large">action</v-btn>
        </v-card-actions>
      </v-card>
    </section>
  </v-container>
</template>

<script setup>
  import { useBridgeStore } from '@/store/bridge'
  import { useTxStore } from '@/store/tx'
  import { storeToRefs } from 'pinia'
  import { computed } from 'vue'

  import FromNetworkVue from './FromNetwork.vue'
  import ToNetworkVue from './ToNetwork.vue'
  import FromTokensVue from './FromTokens.vue'
  import TokenAmount from './TokenAmount.vue'
  import TransferInfo from './TransferInfo.vue'
  import TxInfo from './TxInof.vue'

  const bridgeStore = useBridgeStore()
  const txStore = useTxStore()

  const { transferAmount, currentToken } = storeToRefs(bridgeStore)
  const { loading } = storeToRefs(txStore)

  const actionDisabled = computed(() => {
    return !(Number(transferAmount.value) && currentToken.value)
  })

  const action = () => {
    txStore.deposit()
  }
</script>

<style>

</style>