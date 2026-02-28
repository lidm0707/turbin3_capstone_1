"use client";

import "@solana/wallet-adapter-react-ui/styles.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

// Network types
export type Network = "mainnet" | "devnet" | "localnet";

// Network configuration
const NETWORK_CONFIG: Record<
  Network,
  { name: string; endpoint: string; color: string }
> = {
  mainnet: {
    name: "Mainnet",
    endpoint: "https://api.mainnet-beta.solana.com",
    color: "text-green-400",
  },
  devnet: {
    name: "Devnet",
    endpoint: "https://api.devnet.solana.com",
    color: "text-blue-400",
  },
  localnet: {
    name: "Localnet",
    endpoint: "http://127.0.0.1:8899",
    color: "text-yellow-400",
  },
};

// Network context
interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  endpoint: string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// Custom hook to use network context
export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return context;
}

// Network Selector Component
export function NetworkSelector() {
  const { network, setNetwork } = useNetwork();

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:border-purple-500 transition-colors">
        <div
          className={`w-2 h-2 rounded-full ${NETWORK_CONFIG[network].color}`}
        />
        <span className="text-white font-medium">
          {NETWORK_CONFIG[network].name}
        </span>
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          {Object.entries(NETWORK_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setNetwork(key as Network)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
                network === key ? "bg-gray-800" : ""
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${config.color}`} />
              <span className="text-white">{config.name}</span>
              {network === key && (
                <svg
                  className="w-4 h-4 text-purple-400 ml-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Network Change Warning Banner Component
function NetworkChangeBanner({
  fromNetwork,
  toNetwork,
  onReload,
}: {
  fromNetwork: Network;
  toNetwork: Network;
  onReload: () => void;
}) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 border-b border-yellow-500 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <p className="text-white font-semibold">Network Changed</p>
            <p className="text-yellow-100 text-sm">
              Switched from {NETWORK_CONFIG[fromNetwork].name} to{" "}
              {NETWORK_CONFIG[toNetwork].name}
            </p>
          </div>
        </div>
        <button
          onClick={onReload}
          className="bg-white text-yellow-700 font-semibold px-6 py-2 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

// Main WalletProviders Component
export default function WalletProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [network, setNetworkState] = useState<Network>("devnet");
  const [networkChange, setNetworkChange] = useState<{
    fromNetwork: Network | null;
    toNetwork: Network;
    show: boolean;
  }>({
    fromNetwork: null,
    toNetwork: "devnet",
    show: false,
  });

  // Load network from localStorage on mount
  useEffect(() => {
    const savedNetwork = localStorage.getItem("solana-network") as Network;
    if (
      savedNetwork &&
      (savedNetwork === "mainnet" ||
        savedNetwork === "devnet" ||
        savedNetwork === "localnet")
    ) {
      setNetworkState(savedNetwork);
    }
    setMounted(true);
  }, []);

  // Save network to localStorage when it changes
  const setNetwork = (newNetwork: Network) => {
    if (newNetwork !== network) {
      // Show network change warning
      setNetworkChange({
        fromNetwork: network,
        toNetwork: newNetwork,
        show: true,
      });
    }
    setNetworkState(newNetwork);
    localStorage.setItem("solana-network", newNetwork);
  };

  // Reload page to apply network change
  const handleReload = () => {
    window.location.reload();
  };

  // Memoize endpoint based on network
  const endpoint = useMemo(() => NETWORK_CONFIG[network].endpoint, [network]);

  // Memoize wallets
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  return (
    <NetworkContext.Provider value={{ network, setNetwork, endpoint }}>
      {networkChange.show && (
        <NetworkChangeBanner
          fromNetwork={networkChange.fromNetwork || "devnet"}
          toNetwork={networkChange.toNetwork}
          onReload={handleReload}
        />
      )}
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </NetworkContext.Provider>
  );
}
