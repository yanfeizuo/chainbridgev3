import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'

import { chains } from "@/constants/chains"
import { markRaw, onBeforeUnmount, onMounted, ref } from 'vue'

import { useBridgeStore } from '@/store/bridge'
import { ethers } from 'ethers'

const injected = injectedModule()
const walletConnect = walletConnectModule()

export default () => {

  const bridgeStore = useBridgeStore()

  const onboard = ref(null)
  const unsubscribe = ref(null)
  // const wallet = reactive({
    // account: '',
    // balance: '',
    // symbol: '',
    // icon: '',
    // provider: null,
    // networkName: '',
    // networkId: ''
  // })

  onMounted(() => {
    onboard.value = Onboard({
      wallets: [injected, walletConnect],
      chains: chains.map(c => ({
        id: `0x${c.networkId.toString(16)}`,
        token: c.nativeTokenSymbol,
        label: c.name,
        rpcUrl: c.rpcUrl,
        publicRpcUrl: c.officialRpc,
        blockExplorerUrl: c.blockExplorer
      })),
      accountCenter: {
        desktop: {
          enabled: false,
        },
        mobile: {
          enabled: false,
        }
      },
      appMetadata: {
        name: 'Meter Wallet',
        icon: '<svg></svg>',
        description: 'Meter chainbridge'
      }
    })

    connectWallet()
    subscribe()
  })

  const connectWallet = () => {
    if (onboard.value) {
      onboard.value.connectWallet()
    }
  }

  const subscribe = () => {
    const wallets = onboard.value.state.select('wallets')
    const sub = wallets.subscribe(update => {
      const wallet = {}
      if (update.length) {
        const newWallet = update[0]
        // console.log('newWallet', newWallet)
        if (newWallet.accounts) {
          wallet.account = newWallet.accounts[0].address
          if (newWallet.accounts[0].balance) {
            wallet.balance = Object.values(newWallet.accounts[0].balance)[0]
            wallet.symbol = Object.keys(newWallet.accounts[0].balance)[0]
          }
        }
        wallet.icon = newWallet.icon
        wallet.networkId = Number(newWallet.chains[0].id)
        wallet.networkName = chains.find(c => c.networkId === Number(newWallet.chains[0].id)).name
        if (newWallet.provider) {
          wallet.provider = markRaw(newWallet.provider)
          const web3Provider = new ethers.providers.Web3Provider(newWallet.provider)
          wallet.web3Provider = markRaw(web3Provider)
          wallet.signer = markRaw(web3Provider.getSigner())
        }
      }
      bridgeStore.initData(wallet)

      disconnectOtherWallet()
    })
    unsubscribe.value = sub.unsubscribe
  }

  const setChain = (chainId) => {
    if (onboard.value) {
      onboard.value.setChain({ chainId: `0x${Number(chainId).toString(16)}`})
    }
  }

  const disconnectWallet = () => {
    if (onboard.value) {
      const wallets = onboard.value.state.get().wallets
      if (wallets.length) {
        onboard.value.disconnectWallet({ label: wallets[0].label })
      }
    }
  }

  const disconnectOtherWallet = () => {
    if (onboard.value) {
      const wallets = onboard.value.state.get().wallets
      if (wallets.length > 1) {
        onboard.value.disconnectWallet({ label: wallets[1].label })
      }
    }
  }

  onBeforeUnmount(() => {
    if (unsubscribe.value) {
      unsubscribe.value()
    }
  })

  return {
    connectWallet,
    setChain,
    disconnectWallet,
    // wallet
  }
}
