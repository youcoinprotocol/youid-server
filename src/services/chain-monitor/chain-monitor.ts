import type { Application } from '../../declarations'
import * as cron from 'node-cron'

export const chainMonitorPath = 'chain-monitor'
export const chainMonitorMethods = [] as const
import fs from 'fs'
import { ethers } from 'ethers'
import { Trait } from '../traits/traits.class'
import { randomUUID } from 'crypto'
import { Identity } from '../identities/identities.class'

type MemberEventResult = {
  blockNumber: number
  commitment: string
  groupId: number
  idx: number
  type: 'ADD' | 'REMOVE'
}

const contractABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'merkleTreeRoot',
        type: 'uint256'
      }
    ],
    name: 'MemberAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'merkleTreeRoot',
        type: 'uint256'
      }
    ],
    name: 'MemberRemoved',
    type: 'event'
  }
]

const updateBlockNumber = (path: string, num: number) => {
  fs.writeFileSync(path, num.toString())
}

const prevBlockNumber = (path: string, defaultStartBlock: number) => {
  let num = defaultStartBlock
  try {
    const res = fs.readFileSync(path).toString()

    num = parseInt(res)
  } catch (e) {}
  return num
}

const getMemberEvents = async (contract: any, fromBlock: number, toBlock: number) => {
  const addMemberFilter = contract.filters.MemberAdded()
  const removeMemberFilter = contract.filters.MemberRemoved()

  // Retrieve logs that match the filters for both events
  const addMemberLogs = await contract.queryFilter(addMemberFilter, fromBlock, toBlock)
  //console.log(addMemberLogs)
  const removeMemberLogs = await contract.queryFilter(removeMemberFilter, fromBlock, toBlock)
  const results = new Array<MemberEventResult>()
  addMemberLogs.forEach((log: any) => {
    const event = contract.interface.parseLog(log)
    results.push({
      blockNumber: log.blockNumber,
      groupId: parseInt(event.args[0].toString()),
      commitment: event.args[2].toString(),
      type: 'ADD',
      idx: event.args[1].toString()
    })
  })

  removeMemberLogs.forEach((log: any) => {
    const event = contract.interface.parseLog(log)
    results.push({
      blockNumber: log.blockNumber,
      groupId: parseInt(event.args[0].toString()),
      commitment: event.args[2].toString(),
      type: 'REMOVE',
      idx: event.args[1].toString()
    })
  })

  return results.sort((a, b) => a.blockNumber - b.blockNumber)
}

export const chainMonitor = (app: Application) => {
  const contractsConfig = app.get('contracts')
  const blockPath = `${app.get('resources')}block.txt`
  let prevNumber = prevBlockNumber(blockPath, contractsConfig.startBlock)
  const contractAddress = contractsConfig.semaphore
  const provider = new ethers.JsonRpcProvider(contractsConfig.rpc)
  const contract = new ethers.Contract(contractAddress, contractABI, provider)

  cron.schedule('* * * * *', async () => {
    try {
      const currentBlock = await provider.getBlockNumber()
      let newBlockNumber = Math.min(prevNumber + 10000, currentBlock)
      const identityCache: Record<string, Identity> = {}
      // Public JSON rpc capped at 10000 blocks
      const events = await getMemberEvents(contract, prevNumber, newBlockNumber)
      for (const event of events) {
        let identity = identityCache[event.commitment]
        if (!identity) {
          const identities = await app.service('identities').find({
            query: {
              commitment: event.commitment
            },
            paginate: false
          })
          if (identities.length) {
            identity = identities[0]
            identityCache[event.commitment] = identity
          }
        }

        if (event.type === 'ADD') {
          await app.service('traits').create({
            id: randomUUID().toString(),
            groupId: event.groupId,
            blockNumber: event.blockNumber,
            userId: identity?.userId ?? null,
            commitment: event.commitment,
            idx: event.idx ?? null
          })
        } else {
          await app.service('traits').remove(null, {
            query: {
              groupId: event.groupId,
              commitment: event.commitment,
              idx: event.idx
            }
          })
        }
      }
      prevNumber = newBlockNumber
      updateBlockNumber(blockPath, newBlockNumber)
    } catch (e) {
      console.log(e)
    }
  })
}
