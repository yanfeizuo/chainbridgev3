<template>
  <v-text-field
    :hint="availableBalance"
    persistent-hint
    label="Amount"
    v-model="amount"
    :suffix="tokenSymbol"
  ></v-text-field>
  <v-item-group selected-class="bg-primary" v-model="amountPercent">
    <v-row>
      <v-col
        v-for="item in amountPercents"
        :key="item.value"
      >
        <v-item v-slot="{ selectedClass, toggle }" :value="item.value">
          <v-card
            :class="['d-flex align-center', selectedClass]"
            dark
            @click="toggle"
          >
            <div
              class="flex-grow-1 text-center"
            >
              {{ item.label }}
            </div>
          </v-card>
        </v-item>
      </v-col>
    </v-row>
  </v-item-group>
</template>

<script setup>
  import amountPercents from '@/constants/amountPercent'
  import { computed, ref, watch, watchEffect } from 'vue'
  // import useChain from '@/hooks/useChain'
  import { useBridgeStore } from '@/store/bridge'
  import { storeToRefs } from 'pinia';
  import BigNumber from 'bignumber.js';

  const bridgeStore = useBridgeStore()
  const { currentToken } = storeToRefs(bridgeStore)

  // const { currentToken } = useChain()
  
  const amountPercent = ref('')

  const amount = ref('')

  watchEffect(() => {
    if (currentToken.value && currentToken.value.balance && amountPercent.value) {
      amount.value = new BigNumber(currentToken.value.balance).times(amountPercent.value).div(100).toFixed()
    }
  })
  watch(amount, (val) => {
    bridgeStore.$patch(state => {
      state.transferAmount = val
    })
  })

  const tokenSymbol = computed(() => {
    if (currentToken.value) {
      return currentToken.value.symbol
    }
    return ''
  })

  const availableBalance = computed(() => {
    if (currentToken.value) {
      
      return `Balance: ${currentToken.value.balance || '0'}`
    }
    return 'Balance: 0'
  })
</script>

<style>

</style>