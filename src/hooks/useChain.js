import { chains } from "@/constants/chains"
import { computed, ref, watch } from "vue"
import useWallet from "./useWallet"
export default () => {
  const { wallet } = useWallet()

  const currentFromChain = ref(chains[0])
  const currentToChain = ref(chains[1])

  const currentToken = ref(null)

  watch(wallet, ({ networkId }) => {
    const tempFromChain = chains.find(c => c.networkId === networkId)
    if (tempFromChain) {
      currentFromChain.value = tempFromChain
      const tempToChains = chains.filter(c => c.networkId !== networkId)
      currentToChain.value = tempToChains[0]
    }
  })

  const fromChains = computed(() => {
    return chains.filter(c => c.networkId !== currentFromChain.value.networkId)
  })

  const toChains = computed(() => {
    return chains.filter(c => c.networkId !== currentFromChain.value.networkId && c.networkId !== currentToChain.value.networkId)
  })

  const tokens = computed(() => {
    const toTokensResourceId = currentToChain.value.tokens.map(t => t.resourceId)
    const t = currentFromChain.value.tokens.filter(t => toTokensResourceId.includes(t.resourceId))
    return t
  })

  const updateCurrentFromChain = (val) => {
    currentFromChain.value = val
  }

  const updateCurrentToChain = (val) => {
    currentToChain.value = val
  }

  const updateCurrentToken = (val) => {
    currentToken.value = val
  }

  return {
    currentFromChain,
    currentToChain,
    fromChains,
    toChains,
    tokens,
    currentToken,
    updateCurrentFromChain,
    updateCurrentToChain,
    updateCurrentToken
  }
}