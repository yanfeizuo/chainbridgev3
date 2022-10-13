<template>
  <v-layout>
    <AppTopVue />
    <v-main>
      <BridgeVue />
    </v-main>
  </v-layout>
</template>

<script setup>
  import { provide } from 'vue';
  import useWallet from '@/hooks/useWallet'
  import BridgeVue from './views/ChainBridge.vue';
  import AppTopVue from './AppTop.vue';
  import { useBridgeStore } from '@/store/bridge'

  const bridgeStore = useBridgeStore()
  bridgeStore.loopCurrentTokenBalance()

  const { connectWallet, setChain } = useWallet()

  provide('connectWallet', connectWallet)
  provide('setChain', setChain)
</script>

<style>
.card-center {
  position: relative;
  left: 50%;
  transform: translate(-50%);
}
</style>
