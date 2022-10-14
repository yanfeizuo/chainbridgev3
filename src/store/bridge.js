import { defineStore } from "pinia";
import { BridgeFactory } from "@meterio/chainbridge-contracts";
import { ethers, utils } from "ethers";
import BigNumber from "bignumber.js";

import erc20 from "@/constants/erc20";
import { chains } from "@/constants/chains";

export const useBridgeStore = defineStore({
  id: 'bridge',
  state: () => ({
    wallet: {
      account: '',
      balance: '',
      symbol: '',
      icon: '',
      provider: null,
      web3Provider: null,
      signer: null,
      networkName: '',
      networkId: ''
    },
    currentFromChain: chains[0],
    currentToChain: chains[1],
    currentToken: null,
    
    transferAmount: '',
    bridgeFee: '',
    homeBridge: null,
    destBridge: null,
  }),
  getters: {
    fromChains() {
      // return chains.filter(c => c.networkId !== this.currentFromChain.networkId)
      return chains
    },
    toChains() {
      return chains.filter(c => c.networkId !== this.currentFromChain.networkId && c.networkId !== this.currentToChain)
    },
    tokens() {
      const toTokensResourceId = this.currentToChain.tokens.map(t => t.resourceId)
      const t = this.currentFromChain.tokens.filter(t => toTokensResourceId.includes(t.resourceId))
      return t
    },
  },
  actions: {
    initData(wallet) {
      // console.log('wallet', wallet)
      this.wallet = wallet

      if (wallet.networkId) {
        // this.currentToken = null
        this.updateCurrentToken(null)
        const tempFromChain = chains.find(c => c.networkId === wallet.networkId)
        if (tempFromChain) {
          this.currentFromChain = tempFromChain
          const tempToChains = chains.filter(c => c.networkId !== wallet.networkId)
          this.currentToChain = tempToChains[0]
        }
      }

      let homeBridge = null
      let destBridge = null
      if (this.currentFromChain.networkId === 333999 && this.currentToChain.networkId === 56) {
        homeBridge = BridgeFactory.connect(this.currentFromChain.bridgeAddress, this.wallet.signer)
        destBridge = BridgeFactory.connect(this.currentToChain.bridgeAddress1, new ethers.providers.JsonRpcProvider(this.currentToChain.rpcUrl))
      } else if (this.currentFromChain.networkId === 56 && this.currentToChain.networkId === 333999) {
        homeBridge = BridgeFactory.connect(this.currentFromChain.bridgeAddress1, this.wallet.signer)
        destBridge = BridgeFactory.connect(this.currentToChain.bridgeAddress, new ethers.providers.JsonRpcProvider(this.currentToChain.rpcUrl))
      } else {
        homeBridge = BridgeFactory.connect(this.currentFromChain.bridgeAddress, this.wallet.signer)
        destBridge = BridgeFactory.connect(this.currentToChain.bridgeAddress, new ethers.providers.JsonRpcProvider(this.currentToChain.rpcUrl))
      }
      // home bridge
      this.homeBridge = homeBridge
      // destination bridge
      this.destBridge = destBridge

      //bridge fee
      this.updateBridgeFee()
    },
    async updateBridgeFee() {
      const bridgeFee = utils.formatEther(await this.homeBridge.getFee(this.currentToChain.chainId))
      this.bridgeFee = bridgeFee
    },
    updateCurrentToChain(chain) {
      this.updateCurrentToken(null)
      this.currentToChain = chain
      if (this.currentFromChain.networkId === 333999) {
        let destBridge = null
        if (this.currentToChain.networkId === 56) {
          destBridge = BridgeFactory.connect(this.currentToChain.bridgeAddress1, new ethers.providers.JsonRpcProvider(this.currentToChain.rpcUrl))
        } else {
          destBridge = BridgeFactory.connect(this.currentToChain.bridgeAddress, new ethers.providers.JsonRpcProvider(this.currentToChain.rpcUrl))
        }
        this.destBridge = destBridge
      } else if (this.currentFromChain.networkId === 56) {
        if (this.currentToChain.networkId === 333999) {
          this.homeBridge = BridgeFactory.connect(this.currentFromChain.bridgeAddress1, this.wallet.signer)
          this.destBridge = BridgeFactory.connect(this.currentToChain.bridgeAddress, new ethers.providers.JsonRpcProvider(this.currentToChain.rpcUrl))
        } else {
          this.destBridge = BridgeFactory.connect(chain.bridgeAddress, new ethers.providers.JsonRpcProvider(chain.rpcUrl))
        }
      } else {
        this.destBridge = BridgeFactory.connect(chain.bridgeAddress, new ethers.providers.JsonRpcProvider(chain.rpcUrl))
      }

      this.updateBridgeFee()
    },
    async updateCurrentToken(token) {
      // console.log('token', token)
      this.currentToken = token
      this.getCurrentTokenBalance()
    },
    loopCurrentTokenBalance() {
      // console.log('get token balance')
      setTimeout(async () => {
        await this.getCurrentTokenBalance()
        this.loopCurrentTokenBalance()
      }, 5000);
    },
    async getCurrentTokenBalance() {
      if (this.currentToken && this.wallet.web3Provider) {
        if (this.currentToken.native) {
          const nativeBalance = await this.wallet.web3Provider.getBalance(this.wallet.account)
          this.currentToken.balance = utils.formatEther(nativeBalance)
        } else {
          const c = new ethers.Contract(this.currentToken.address, erc20, this.wallet.web3Provider)
          const balance = await c.balanceOf(this.wallet.account)
          // console.log('balance', balance.toString())
          this.currentToken.balance = new BigNumber(String(balance)).div(`1e${this.currentToken.decimals}`).toFixed()
        }
      }
    }
  }
})