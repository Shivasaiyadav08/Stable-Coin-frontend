"use client"
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { ReactNode, useState , useEffect} from 'react';
import {
  anvil,
  sepolia
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";


const config=getDefaultConfig({
    appName:"tsender",
    projectId:process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains:[sepolia,anvil],
    ssr:false
})

export default function Providers(props:{children:ReactNode}){

    const queryClient=new QueryClient();

  return(
   <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
           {props.children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}