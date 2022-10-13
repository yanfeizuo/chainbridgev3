import { toRaw } from "vue";
import { defineStore } from "pinia";
import { ethers, utils, BigNumber } from "ethers";

import erc20 from "@/constants/erc20";
import amplController from "@/constants/amplController";
import { packXCTransferData } from '@/utils/XCAmple'
import { useBridgeStore } from "./bridge";

const maximum_approve_amount = "0x" + "f".repeat(64);

export const useTxStore = defineStore({
  id: 'tx',
  state: () => ({
    loading: false,
    depositNonce: '',
    depositVotes: 0,
    /**
     * [
     *  {
     *    status: string; // info,success,error
     *    title: string;
     *    msg: string;
     *    txHash: string;
     *  }
     * ]
     */
    depositInfo: [],
    proposalInfo: []
  }),
  getters: {},
  actions: {
    async deposit() {
      const bridgeStore = useBridgeStore()
      // console.log(bridgeStore.currentToken)
      const token = bridgeStore.currentToken

      this.loading = true
      this.depositInfo = []
      this.proposalInfo = []
      if (token.native) {
        // native token
        this.depositNative()
      } else if (token.symbol === 'AMPL') {
        // AMPL
        this.depositAMPL()
      } else {
        // ERC20
        this.depositERC20()
      }
    },
    async depositNative() {
      console.log("Deposit Native");
      const { wallet, currentFromChain, transferAmount, bridgeFee } = useBridgeStore()
      const nativeDecimals = currentFromChain.nativeTokenDecimals;
      const fee = utils.parseUnits(bridgeFee, nativeDecimals);
      const amount = utils.parseUnits(transferAmount, nativeDecimals);

      const recipient = wallet.account

      const data =
        "0x" +
        utils.hexZeroPad(BigNumber.from(amount).toHexString(), 32).substring(2) +
        utils.hexZeroPad(utils.hexlify((recipient.length - 2) / 2), 32).substring(2) +
        recipient.substring(2);

      await this.actionDeposit(data, "0x00", { value: amount.add(fee) });
    },
    async depositAMPL() {
      console.log("Deposit AMPL");
      const { currentToken, wallet, currentFromChain, transferAmount, bridgeFee } = useBridgeStore()
      if (!currentFromChain.amplController || !currentFromChain.amplApprovalContract) {
        alert('amplController and amplApprovalContract are needed')
        this.loading = false
        return;
      }

      const contract = new ethers.Contract(currentToken.address, erc20, wallet.signer)
      const controller = new ethers.Contract(currentFromChain.amplController, amplController, wallet.signer)
      const erc20Decimals = currentToken.decimals
      const account = wallet.account
      const recipient = wallet.account

      // eslint-disable-next-line
      const [epoch, totalSupply] = await controller.globalAmpleforthEpochAndAMPLSupply();
      
      const data = packXCTransferData(
        account,
        recipient,
        utils.parseUnits(transferAmount, erc20Decimals),
        totalSupply
      );

      const currentAllowance = await contract.allowance(account, currentFromChain.amplApprovalContract);
      
      if (Number(utils.formatUnits(currentAllowance, erc20Decimals)) < Number(transferAmount)) {
        // unlimited approval
        await (await contract.approve(currentFromChain.amplApprovalContract, BigNumber.from(maximum_approve_amount))).wait()
      }

      const nativeDecimals = currentFromChain.nativeTokenDecimals;
      const options = { value: utils.parseUnits(bridgeFee, nativeDecimals) };

      await this.actionDeposit(data, "0x00", options);
    },
    async depositERC20() {
      const { currentToken, wallet, currentFromChain, currentToChain, transferAmount, bridgeFee } = useBridgeStore()

      const contract = new ethers.Contract(currentToken.address, erc20, wallet.signer)
      const erc20Decimals = currentToken.decimals
      const recipient = wallet.account
      let approvalAddress = currentToken.tokenProxy || currentFromChain.erc20HandlerAddress
      if (
        currentFromChain.networkId === 56 &&
        currentToChain.networkId === 333999 &&
        currentFromChain.erc20HandlerAddress1
      ) {
        approvalAddress = currentToken.tokenProxy || currentFromChain.erc20HandlerAddress1;
      }
      const data =
        "0x" + 
        utils.hexZeroPad(BigNumber.from(utils.parseUnits(transferAmount, erc20Decimals)).toHexString(),32).substring(2) +
        utils.hexZeroPad(utils.hexlify((recipient.length - 2) / 2), 32).substring(2) + 
        recipient.substring(2);

      const currentAllowance = await contract.allowance(wallet.account, approvalAddress)
      console.log('currentAllowance', currentAllowance.toString())

      if (Number(utils.formatUnits(currentAllowance, erc20Decimals)) < Number(transferAmount)) {
        if (Number(utils.formatUnits(currentAllowance, erc20Decimals)) > 0) {
          await (await contract.approve(approvalAddress, BigNumber.from(utils.parseUnits("0", erc20Decimals)))).wait()
        }
  
        // unlimited approve
        await (await contract.approve(approvalAddress, BigNumber.from(maximum_approve_amount))).wait()
      }

      const nativeDecimals = currentFromChain.nativeTokenDecimals
      const options = {
        value: utils.parseUnits(bridgeFee, nativeDecimals),
      };
      await this.actionDeposit(data, "0x00", options);
    },
    async actionDeposit(data, feeData, options) {
      const { homeBridge, currentToken, currentToChain } = useBridgeStore()
      let tx = {}
      try {
        tx = await homeBridge.deposit(currentToChain.chainId, currentToken.resourceId, data, feeData, options);
        console.log('deposit tx', tx)
        this.depositInfo.push({
          status: 'info',
          title: 'Start Deposit',
          msg: 'Start Deposit',
          txHash: tx.hash
        })
        
        this.listenDeposit()
      } catch(e) {
        this.loading = false

        let msg = e.message
        if (String(e.message).includes('user rejected transaction')) {
          msg = 'user rejected transaction'
        }
        this.depositInfo.push({
          status: 'error',
          title: 'Deposit Error',
          msg,
          txHash: tx.hash
        })
      }
    },
    async listenDeposit() {
      const { homeBridge, wallet } = useBridgeStore()
      const rawHomeBridge = toRaw(homeBridge)
      const recipient = wallet.account
      rawHomeBridge.once(
        rawHomeBridge.filters.Deposit(null, null, null, recipient, null, null),
        (destChainId, resourceId, depositNonce) => {
          console.log("deposit nonce: ", depositNonce.toString());
          this.depositNonce = depositNonce.toString()
          this.depositInfo.push({
            status: 'success',
            title: 'Deposit Success',
            msg: 'Deposit Success',
          })

          this.listenProposal()
        }
      );
    },
    async listenProposal() {
      const { destBridge, currentFromChain, currentToChain } = useBridgeStore()
      const rawDestBridge = toRaw(destBridge)

      rawDestBridge.on(rawDestBridge.filters.ProposalEvent(), (originChainId, _depositNonce, status, dataHash, tx) => {

        if (originChainId == currentFromChain.chainId && _depositNonce == this.depositNonce) {
          console.log("proposalEvent status: ", status);
          switch (BigNumber.from(status).toNumber()) {
            case 1:
              this.proposalInfo.push({
                status: 'info',
                title: 'Create Proposal',
                msg: `Proposal created on ${currentToChain.name}`,
                txHash: tx.transactionHash
              })
              break;
            case 2:
              this.proposalInfo.push({
                status: 'success',
                title: 'Pass Proposal',
                msg: 'Proposal has passed. Executing...',
                txHash: tx.transactionHash
              })
              break;
            case 3:
              this.loading = false
              
              this.proposalInfo.push({
                status: 'success',
                title: 'Transfer Completed',
                msg: 'Transfer Completed',
                txHash: tx.transactionHash
              })
              break;
            case 4:
              this.loading = false

              this.proposalInfo.push({
                status: 'error',
                title: 'Transfer Aborted',
                msg: 'Transfer Aborted',
                txHash: tx.transactionHash
              })
              break;
            }
          }

        }
      )

      rawDestBridge.on(rawDestBridge.filters.ProposalVote(), async (originChainId, _depositNonce, status, dataHash, tx) => {
          console.log('proposal vote')
          if (originChainId == currentFromChain.chainId && _depositNonce == this.depositNonce) {
            try {
              const txReceipt = await tx.getTransactionReceipt();
              console.log("proposalVote txReceipt: ", txReceipt);
              if (txReceipt.status === 1) {
                this.depositVotes = this.depositVotes + 1
              }
              this.proposalInfo.push({
                status: 'info',
                title: 'Vote Result',
                msg: `${txReceipt.from} ${txReceipt.status === 1 ? "Confirmed" : "Rejected"}`,
                txHash: tx.transactionHash
              })
            } catch (e) {
              this.loading = false

              this.proposalInfo.push({
                status: 'error',
                title: 'Transfer Aborted',
                msg: 'Transfer Aborted',
                txHash: tx.transactionHash
              })
            }
          }
        }
      )
    }
  }
})