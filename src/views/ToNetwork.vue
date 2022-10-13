<template>
  <span>To Network</span>
  <v-btn
    class="w-100 justify-start"
    size="x-large"
    @click="selectNetwork"
  >
    <template v-slot:prepend>
      <v-avatar>
        <img width="40" height="40" :src="logos[currentToChain.nativeTokenSymbol.toLowerCase()]" alt="">
      </v-avatar>
    </template>
    {{ currentToChain.name }}
  </v-btn>
  <SelectModalVue title="select to network" v-model="show" :close="close" :data="toChains" />
</template>

<script setup>
  import { ref } from 'vue';
  import logos from '@/constants/logos'
  import SelectModalVue from '@/components/SelectModal.vue'
  // import useChain from '@/hooks/useChain'
  import { useBridgeStore } from '@/store/bridge';
  import { storeToRefs } from 'pinia';

  const bridgeStore = useBridgeStore()

  const { toChains, currentToChain } = storeToRefs(bridgeStore)

  // const { toChains, currentToChain, updateCurrentToChain, updateCurrentToken } = useChain()

  const show = ref(false)

  const selectNetwork = () => {
    show.value = true
  }

  const close = (val) => {
    show.value = false
    if (val) {
      // updateCurrentToChain(val)
      // updateCurrentToken(null)
      // bridgeStore.updateCurrentToken(null)
      // bridgeStore.$patch((state) => {
      //   // state.currentToken = null
      //   state.currentToChain = val
      // })
      bridgeStore.updateCurrentToChain(val)
    }
  }
</script>

<style>

</style>