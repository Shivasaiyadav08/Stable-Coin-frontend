// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import UserDetails from "@/components/UserDetails";
import Liquidate from "@/components/Liquidate";
import DSCActions from "@/components/DscActions";
import AccountDetails from "@/components/AccountDetails";

export default function HomePage() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("0xE9543340546545d8f3ab470d00c809D37f364B7A");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 bg-gray-900">
      {isConnected ? (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              DSC Protocol
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
              Advanced decentralized stable coin ecosystem with robust liquidation mechanisms
            </p>

            {/* Contract Address Section - Mobile Optimized */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6 max-w-3xl mx-auto mb-4 sm:mb-6">
              <p className="text-gray-300 text-sm sm:text-base mb-3">
                Import DSC in your wallet:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex-1 bg-gray-900 rounded-lg p-3 border border-gray-600 overflow-x-auto">
                  <code className="text-fuchsia-400 font-mono text-xs sm:text-sm break-all">
                    0xE9543340546545d8f3ab470d00c809D37f364B7A
                  </code>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${copied
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Note Section */}
            <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
              <p className="text-red-500 text-sm sm:text-base mb-2">
                Note: It&apos;s just a prototype deployed in sepolia testnet.
              </p>
              <p className="text-gray-400 text-sm sm:text-base">
                Recommended to use{` `}
                <a
                  href="https://sepolia.etherscan.io/address/0xdd13E55209Fd76AfE204dBda4007C227904f0a81"
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WETH test tokens
                </a>
                {` `}with sepolia testnet
              </p>
            </div>

            {/* About Section Toggle */}
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium mb-4"
            >
              {showAbout ? 'Hide About' : 'Learn More About DSC Protocol'}
            </button>

            {/* About Section */}
            {showAbout && (
              <div className="mt-4 p-4 sm:p-6 bg-gray-800/50 border border-gray-700 rounded-xl text-left max-w-4xl mx-auto">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">About StableCoin DApp</h3>
                <div className="text-gray-300 space-y-2 sm:space-y-3 text-sm sm:text-base">
                  <p>
                    The StableCoin DApp allows users to mint decentralized stablecoins by depositing collateral assets like wETH or wBTC.
                    Once deposited, the collateral is locked within the protocol. Users can mint stablecoins up to a safe collateralization ratio (e.g., 150%).
                  </p>
                  <p>
                    These stablecoins circulate freely — users can spend, lend, or provide liquidity. The protocol constantly monitors the collateral ratio
                    using Chainlink price feeds. If the ratio drops below the liquidation threshold (e.g., 120%), liquidators can repay the user&apos;s debt in
                    exchange for collateral at a discounted rate (the liquidation bonus).
                  </p>
                  <p>
                    Stablecoins used for liquidation are burned, and the collateral is transferred to the liquidator. If users repay their full debt plus fees,
                    they can call the burn & withdraw function to burn their stablecoins and release their locked collateral.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Dashboard Grid - Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Full width on mobile, 2/3 on desktop */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              <UserDetails />
              <DSCActions />
            </div>

            {/* Right Column - Full width on mobile, 1/3 on desktop */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <AccountDetails />
              <Liquidate />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-gray-800 border border-gray-700 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl text-center max-w-md w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Wallet Not Connected
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
              Connect your wallet to access the decentralized stable coin dashboard
            </p>

            {/* About Section for disconnected state */}
            <div className="mt-4 p-3 sm:p-4 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-left">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">About DSC Protocol</h3>
              <p className="text-gray-300 text-xs sm:text-sm">
                Mint decentralized stablecoins by depositing collateral. Monitor your health factor and avoid liquidation.
                Advanced DeFi protocol with robust risk management.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}