<template>
  <v-app-bar>
    <h1>Meter Passport</h1>
    <v-spacer></v-spacer>
    <v-chip v-if="wallet.networkName">{{ wallet.networkName }}</v-chip>
    <v-chip class="ml-2" @click="connect">
      <div v-if="shortAccount" class="d-flex">
        <span class="wallet-icon d-flex align-center" v-html="wallet.icon"></span>
        <span>{{ shortAccount }}</span>
      </div>
      <div v-else>CONNECT</div>
    </v-chip>
  </v-app-bar>
</template>

<script setup>
  import { useBridgeStore } from '@/store/bridge'
  import { storeToRefs } from 'pinia'
  import { computed, inject } from 'vue'

  const bridgeStore = useBridgeStore()
  const { wallet } = storeToRefs(bridgeStore)
  // import useWallet from '@/hooks/useWallet'

  // // import logos from '@/constants/logos'
  // const { connect, wallet } = useWallet()

  const shortAccount = computed(() => {
    // console.log('wallet', wallet)
    if (wallet.value.account) {
      const account = wallet.value.account
      return `${account.substring(0, 6)}...${account.substring(account.length - 4, account.length)}`
    } else {
      return ''
    }
  })

  const connect = inject('connectWallet')
</script>

<style scoped>
  .wallet-icon > :deep svg,img {
    width: 20px !important;
    height: 20px !important;
  }
</style>