import { utils } from "ethers";

const toHex = (covertThis, padding) => {
  return utils.hexZeroPad(utils.hexlify(covertThis), padding);
};

export const packXCTransferData = (
  depositor,
  recipient,
  amount,
  totalSupply
) => {
  return createGenericDepositData(
    utils.defaultAbiCoder.encode(
      ["address", "address", "uint256", "uint256"],
      [depositor, recipient, amount, totalSupply]
    )
  );
};

const createGenericDepositData = (hexMetaData) => {
  if (hexMetaData === null) {
    return "0x" + toHex(0, 32).substr(2);
  }
  const hexMetaDataLength = hexMetaData.substr(2).length / 2;
  return "0x" + toHex(hexMetaDataLength, 32).substr(2) + hexMetaData.substr(2);
};