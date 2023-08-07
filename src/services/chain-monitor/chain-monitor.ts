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

const updateBlockNumber = (num: number) => {
  fs.writeFileSync(`${__dirname}/block.txt`, num.toString())
}

const prevBlockNumber = () => {
  let num = 1
  try {
    const res = fs.readFileSync(`${__dirname}/block.txt`)
    num = parseInt(res.toString())
  } catch (e) {}
  return num
}

const getMemberEvents = async (contract: any, fromBlock: number, toBlock: number) => {
  const addMemberFilter = contract.filters.MemberAdded()
  const removeMemberFilter = contract.filters.MemberRemoved()

  // Retrieve logs that match the filters for both events
  const addMemberLogs = await contract.queryFilter(addMemberFilter, fromBlock, toBlock)
  const removeMemberLogs = await contract.queryFilter(removeMemberFilter, fromBlock, toBlock)
  const results = new Array<MemberEventResult>()
  addMemberLogs.forEach((log: any) => {
    const event = contract.interface.parseLog(log)
    results.push({
      blockNumber: log.blockNumber,
      groupId: parseInt(event.args[0].toString()),
      commitment: event.args[2].toString(),
      type: 'ADD'
    })
  })

  removeMemberLogs.forEach((log: any) => {
    const event = contract.interface.parseLog(log)
    results.push({
      blockNumber: log.blockNumber,
      groupId: parseInt(event.args[0].toString()),
      commitment: event.args[2].toString(),
      type: 'REMOVE'
    })
  })

  return results.sort((a, b) => a.blockNumber - b.blockNumber)
}

export const chainMonitor = (app: Application) => {
  let prevNumber = prevBlockNumber()
  const contractAddress = app.get('contracts').semaphore
  const provider = new ethers.JsonRpcProvider('https://1rpc.io/base-goerli')
  const contract = new ethers.Contract(contractAddress, contractABI, provider)

  cron.schedule('* * * * *', async () => {
    try {
      const newBlockNumber = await provider.getBlockNumber()
      const identityCache: Record<string, Identity> = {}
      // Public JSON rpc capped at 10000 blocks
      const events = await getMemberEvents(
        contract,
        Math.max(prevNumber, newBlockNumber - 10000) + 1,
        newBlockNumber
      )
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
        if (identity) {
          if (event.type === 'ADD') {
            await app.service('traits').create({
              id: randomUUID().toString(),
              groupId: event.groupId,
              blockNumber: event.blockNumber,
              userId: identity.userId
            })
          } else {
            await app.service('traits').remove(null, {
              query: {
                groupId: event.groupId,
                userId: identity.userId
              }
            })
          }
        }
      }

      prevNumber = newBlockNumber
      updateBlockNumber(newBlockNumber)
    } catch (e) {
      console.log(e)
    }
  })
}
