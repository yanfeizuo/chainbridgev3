<template>
  <span>Token</span>
  <v-btn
    class="w-100 justify-start"
    size="x-large"
    @click="selectToken"
  >
    <template v-if="currentToken" v-slot:prepend>
      <v-avatar>
        <img width="40" height="40" :src="currentToken.imageUri" alt="">
      </v-avatar>
    </template>
    <span v-if="currentToken">{{ currentToken.symbol }}</span>
    <span v-else class="justify-center">SELECT</span>
  </v-btn>
  <SelectModalVue title="select token" v-model="show" :close="close" :data="tokens" symbol-name="symbol" />
</template>

<script setup>
  import { ref } from 'vue';
  import SelectModalVue from '@/components/SelectModal.vue'
  // import useChain from '@/hooks/useChain'
  import { useBridgeStore } from '@/store/bridge';
  import { storeToRefs } from 'pinia';

  const bridgeStore = useBridgeStore()

  const { currentToken, tokens } = storeToRefs(bridgeStore)

  // const { tokens, currentToken, updateCurrentToken } = useChain()

  const show = ref(false)

  const selectToken = () => {
    show.value = true
  }

  const close = (val) => {
    show.value = false
    if (val) {
      // updateCurrentToken(val)
      bridgeStore.updateCurrentToken(val)
    }
  }
</script>

<style>

</style>