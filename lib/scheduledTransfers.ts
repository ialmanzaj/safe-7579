import {
  getScheduledTransferData,
  getScheduledTransfersExecutor,
  getCreateScheduledTransferAction,
  getExecuteScheduledTransferAction
} from '@rhinestone/module-sdk'

import { SafeSmartAccountClient } from './permissionless'
import abi from '../abi/ScheduleTransfersModule.json'

export interface ScheduledTransferDataInput {
  startDate: number
  repeatEvery: number
  numberOfRepeats: number
  amount: number
  recipient: `0x${string}`
}

export const scheduledTransfersModuleAddress =
  '0xF1aE317941efeb1ffB103D959EF58170F1e577E0'
const USDCTokenAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
console.log('USDCTokenAddress', USDCTokenAddress)

export const install7579Module = async (
  safe: SafeSmartAccountClient,
  scheduledTransferInput: ScheduledTransferDataInput
) => {
  const { startDate, repeatEvery, numberOfRepeats, amount, recipient } =
    scheduledTransferInput
  const scheduledTransfer = {
    startDate,
    repeatEvery,
    numberOfRepeats,
    token: {
      token_address: USDCTokenAddress as `0x${string}`,
      decimals: 6
    },
    amount,
    recipient
  }
  console.log('scheduledTransfer', scheduledTransfer)

  const executionData = getScheduledTransferData({
    scheduledTransfer
  })
  console.log('executionData', executionData)

  const scheduledTransfersExecutor = getScheduledTransfersExecutor({
    executeInterval: repeatEvery,
    numberOfExecutions: numberOfRepeats,
    startDate,
    executionData
  })


  console.log('scheduledTransfersExecutor', scheduledTransfersExecutor)

  const txHash = await safe.installModule({
    type: 'executor',
    address: scheduledTransfersModuleAddress,
    context: scheduledTransfersExecutor.initData as `0x${string}`
  })

  console.log(
    'Scheduled transfers module is being installed: https://sepolia.etherscan.io/tx/' +
      txHash
  )

  return txHash
}

export const scheduleTransfer = async (
  safe: SafeSmartAccountClient,
  scheduledTransferInput: ScheduledTransferDataInput
) => {
  const { startDate, repeatEvery, numberOfRepeats, amount, recipient } =
    scheduledTransferInput
  console.log('startDate', startDate)
  const scheduledTransfer = {
    startDate,
    repeatEvery,
    numberOfRepeats,
    token: {
      token_address: USDCTokenAddress as `0x${string}`,
      decimals: 6
    },
    amount,
    recipient
  }
  console.log('scheduledTransfer', scheduledTransfer)

  const scheduledTransferData = getCreateScheduledTransferAction({
    scheduledTransfer
  })
  const txHash = await safe.sendTransaction({
    to: scheduledTransferData.target,
    value: scheduledTransferData.value as bigint,
    data: scheduledTransferData.callData
  })

  console.log(
    'Transfer is being scheduled: https://sepolia.etherscan.io/tx/' + txHash
  )
  return txHash
}

export const executeOrder = async (jobId: number) => {
  console.log('jobId', jobId)
  const executeTransfer = getExecuteScheduledTransferAction({ jobId })
  console.log('executeTransfer', executeTransfer)
  return executeTransfer
}
