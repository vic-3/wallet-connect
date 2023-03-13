import '@/styles/globals.css'
import { QueryClient, QueryClientProvider } from 'react-query';
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'


const chains = [arbitrum, mainnet, polygon]
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT
const queryClient = new QueryClient()
const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

export default function App({ Component, pageProps }) {
  return (
    <>
    <WagmiConfig client={wagmiClient}>
          <QueryClientProvider client={queryClient}>
    
     <Component {...pageProps} />
     </QueryClientProvider>
     </WagmiConfig>
    </>
 
  )
}
