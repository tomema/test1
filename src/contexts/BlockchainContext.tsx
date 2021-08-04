import { useWeb3React } from "@web3-react/core"
import React from "react"
import Web3 from "web3"
import predictionAbi from "../contracts/prediction_abi.json"
import oracleAbi from "../contracts/oracle_abi.json"
import {AbiItem} from "web3-utils"
import { PredictionAddress, toRound } from "../contracts/prediction"
import { OracleAddresses } from "../contracts/oracle"
import axios from "axios"
import { csvToJson } from "../api/utils"

export type Chain = "main" | "test"


const Urls = {
  rpc: {
    main: "https://bsc-dataseed1.binance.org:443",
    test: "https://data-seed-prebsc-2-s1.binance.org:8545/"  
  },
  bets: {
    main: (address: string) => `https://jkfwxgcdmc.execute-api.us-east-1.amazonaws.com/dev/main/bets/${address}`,
    test: (address: string) => `https://jkfwxgcdmc.execute-api.us-east-1.amazonaws.com/dev/test/bets/${address}`,
  },
  bnbPrice: {
    main: "https://api1.binance.com/api/v3/ticker/price?symbol=BNBUSDT",
    test: "https://api1.binance.com/api/v3/ticker/price?symbol=BNBUSDT",
  },
  latestRounds: {
    main: "https://raw.githubusercontent.com/bsc-predict/bsc-predict-updater/master/data/latest.csv",
    // TODO: Start archiving test
    test: "https://raw.githubusercontent.com/bsc-predict/bsc-predict-updater/master/data/latest.csv",
  },
  allRounds: {
    main: "https://raw.githubusercontent.com/bsc-predict/bsc-predict-updater/master/data/rounds.csv",
    test: "https://raw.githubusercontent.com/bsc-predict/bsc-predict-updater/master/data/rounds.csv",
  },
}


interface IBlockchainContext {
  makeBet: (b: BetType, eth: number, onSent: () => void, onConfirmed: () => void, onError: (e?: Error) => void) => Promise<void>
  claim: (epoch: string, onSent: () => void, onConfirmed: () => void, onError: (e?: Error) => void) => Promise<void>
  fetchBalance: (a: string) => Promise<Balance>
  fetchCurrentEpoch: () => Promise<string>
  fetchGamePaused: () => Promise<boolean>
  fetchRounds: (epochs: Array<string | number>) => Promise<Round[]>
  fetchLatestRounds: (n: number, skip: string[]) => Promise<Round[]>
  fetchLatestOracleRound: () => Promise<Oracle>
  fetchBets: (a: string) => Promise<{claimed: number[], bets: Bet[]}>
  fetchBnbPrice: () => Promise<number>
  fetchArchivedRounds: (latest: boolean) => Promise<Round[]>
  fetchBlockNumber: () => Promise<number>
}

const BlockchainContext = React.createContext<IBlockchainContext>({
  makeBet: () => Promise.reject(),
  claim: () => Promise.reject(),
  fetchBalance: () => Promise.reject(),
  fetchCurrentEpoch: () => Promise.reject(),
  fetchGamePaused: () => Promise.reject(),
  fetchRounds: () => Promise.reject(),
  fetchLatestRounds: () => Promise.reject(),
  fetchLatestOracleRound: () => Promise.reject(),
  fetchBets: () => Promise.reject(),
  fetchBnbPrice: () => Promise.reject(),
  fetchArchivedRounds: () => Promise.reject(),
  fetchBlockNumber: () => Promise.reject(),
})

const BlockchainContextProvider: React.FunctionComponent<{chain: Chain}> = ({ children, chain }) => {
  
  const { library, account } = useWeb3React()

  const web3Provider = React.useCallback(() => {
    const rpc = chain === "test" ? Urls.rpc.test : Urls.rpc.main
    return new Web3(rpc)
  }, [])


  const fetchBalance = React.useCallback(async (account: string): Promise<Balance> => {
    const web3 = web3Provider()

    const bnbPrice = await fetchBnbPrice()
    const balance = web3.eth.getBalance(web3.utils.toChecksumAddress(account))
  
    return Promise.all([bnbPrice, balance])
      .then(([price, bal]) => {
        const balanceEth = web3.utils.fromWei(bal, "ether")
        const balanceUsd = Number(balanceEth) * price
        return{balance: bal, balanceUsd, balanceEth, bnbPrice: price}
      })
  }, [web3Provider])
  
  const makeBet = React.useCallback(async (
    direction: BetType,
    eth: number,
    onSent: () => void,
    onConfirmed: () => void,
    onError: (error: Error | undefined) => void
  ) => {
    const address = PredictionAddress[chain]
    const web3 = new Web3(library)
    const value = web3.utils.toWei(eth.toString(), "ether")
    const betMethod = direction === "bull" ? "betBull" : "betBear"
    const contract = new web3.eth.Contract(predictionAbi as AbiItem[], address)
    return contract.methods[betMethod]()
      .send({ from: account, value })
      .once('sent', onSent)
      .once('confirmation', onConfirmed)
      .once('error', onError)
  }, [library])
  
  const claim = React.useCallback(async (
    epoch: string,
    onSent: () => void,
    onConfirmed: () => void,
    onError: (e: Error | undefined) => void
  ) => {
    const web3 = new Web3(library)
    const address = PredictionAddress[chain]
    const contract = new web3.eth.Contract(predictionAbi as AbiItem[], address)
    return contract.methods.claim(epoch)
      .send({from: account})
      .once('sending', onSent)
      .once('confirmation', onConfirmed)
      .once('error', onError)
  }, [library])

  const fetchCurrentEpoch = React.useCallback(async (): Promise<string> => {
    const web3 = web3Provider()
    const address = PredictionAddress[chain]
    const contract = new web3.eth.Contract(predictionAbi as AbiItem[], address)
    return contract.methods.currentEpoch().call()
  }, [])

  const fetchGamePaused = React.useCallback(async (): Promise<boolean> => {
    const web3 = web3Provider()
    const address = PredictionAddress[chain]
    const contract = new web3.eth.Contract(predictionAbi as AbiItem[], address)
    return contract.methods.paused().call()
  }, [])

  const fetchRounds = React.useCallback(async (epochs: Array<string | number>): Promise<Round[]> => {
    const web3 = web3Provider()
    const address = PredictionAddress[chain]
    const contract = new web3.eth.Contract(predictionAbi as AbiItem[], address)
  
    const rounds = epochs.map(async epoch => {
      const r = await contract.methods.rounds(epoch.toString()).call() as Object
      return toRound(r as RoundResponse)
    })
    return await Promise.all(rounds)
  }, [])

  const fetchLatestRounds = React.useCallback(async (n: number, skip: string[]): Promise<Round[]> => {  
    const web3 = web3Provider()
    const address = PredictionAddress[chain]
    const contract = new web3.eth.Contract(predictionAbi as AbiItem[], address)
    const skipSet = new Set(skip)
    const epoch = await contract.methods.currentEpoch().call()
    const epochs = Array.from(Array(n).keys()).map(offset => `${epoch - offset}`).filter(e => !skipSet.has(e) && Number(e) >= 0)
    return fetchRounds(epochs)
  }, [fetchRounds])

  const fetchLatestOracleRound = React.useCallback(async (): Promise<Oracle> => {
    const web3 = web3Provider()
    const address = OracleAddresses[chain]
    const contract = new web3.eth.Contract(oracleAbi as AbiItem[], address)
    const o = await contract.methods.latestRoundData().call()
    return o
  }, [])
  
  const fetchBets = React.useCallback(async (address: string) => {
    const web3 = web3Provider()
    const url = Urls.bets[chain](web3.utils.toChecksumAddress(address))
    const res = await axios.get(url)
    return {...res.data, claimed: new Set(res.data.claimed)}
  }, [])
  
  const fetchBnbPrice = React.useCallback(async (): Promise<number> => {
    const url = Urls.bnbPrice[chain]
    const res = await axios.get(url)
    return res.data.price
  }, [])
  
  const fetchArchivedRounds = React.useCallback(async (latest: boolean): Promise<Round[]> => {
    const url = latest ? Urls.latestRounds[chain] : Urls.allRounds[chain]
    const res = await axios.get(url)
    const roundResponse = csvToJson(res.data) as RoundResponse[]
    return roundResponse.map(toRound)
  }, [])

  const fetchBlockNumber = React.useCallback(() => {
    const web3 = web3Provider()
    return web3.eth.getBlockNumber()
  }, [])
  

  return <BlockchainContext.Provider value={{
    makeBet,
    claim,
    fetchBalance,
    fetchCurrentEpoch,
    fetchGamePaused,
    fetchRounds,
    fetchLatestRounds,
    fetchLatestOracleRound,
    fetchBets,
    fetchBnbPrice,
    fetchArchivedRounds,
    fetchBlockNumber,
  }}>{children}</BlockchainContext.Provider>
}
  
export { BlockchainContext, BlockchainContextProvider }
