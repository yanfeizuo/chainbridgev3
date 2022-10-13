<template>
  <span>From Network</span>
  <v-btn
    class="w-100 justify-start"
    size="x-large"
    @click="selectNetwork"
  >
    <template v-slot:prepend>
      <v-avatar>
        <img width="40" height="40" :src="logos[currentFromChain.nativeTokenSymbol.toLowerCase()]" alt="">
      </v-avatar>
    </template>
    {{ currentFromChain.name }}
  </v-btn>
  <SelectModalVue title="select from network" v-model="show" :close="close" :data="fromChains" />
</template>

<script setup>
  import { ref } from 'vue';
  import logos from '@/constants/logos'
  import SelectModalVue from '@/components/SelectModal.vue'
  // import useChain from '@/hooks/useChain'
  import { useBridgeStore } from '@/store/bridge';
  import { storeToRefs } from 'pinia';

  const bridgeStore = useBridgeStore()

  const { fromChains, currentFromChain } = storeToRefs(bridgeStore)

  // const { fromChains, currentFromChain, updateCurrentFromChain } = useChain()

  const show = ref(false)

  const selectNetwork = () => {
    show.value = true
  }

  const close = (val) => {
    show.value = false
    if (val) {
      // updateCurrentFromChain(val)
      // bridgeStore.$patch((state) => {
      //   state.currentFromChain = val
      // })
    }
  }
</script>

<style>

</style>