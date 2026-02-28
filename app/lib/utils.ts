import { Connection, PublicKey, ParsedAccountData } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { TOKEN_METADATA_PROGRAM_ID } from "./constants";

/**
 * Token metadata interface
 */
export interface TokenMetadata {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  uri?: string;
  image?: string;
}

/**
 * Simple cache for token metadata
 */
const tokenMetadataCache = new Map<string, TokenMetadata>();

/**
 * Format a wallet address for display
 * @param address The wallet address
 * @param startLength Number of characters to show at the start
 * @param endLength Number of characters to show at the end
 * @returns Formatted address (e.g., "7xKX...F3zA")
 */
export function formatWalletAddress(
  address: string,
  startLength: number = 4,
  endLength: number = 4
): string {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Format a token amount with proper decimals
 * @param amount The amount in smallest units
 * @param decimals The number of decimals
 * @returns Formatted string
 */
export function formatTokenAmount(
  amount: number,
  decimals: number = 6
): string {
  return (amount / 10 ** decimals).toFixed(decimals);
}

/**
 * Format a number as currency
 * @param amount The amount
 * @param symbol The currency symbol (e.g., "$", "€")
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, symbol: string = ""): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
  return symbol ? `${symbol}${formatted}` : formatted;
}

/**
 * Format a timestamp to a relative time string
 * @param timestamp The timestamp in milliseconds
 * @returns Relative time string (e.g., "5 minutes ago", "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
}

/**
 * Format seconds to a human-readable duration
 * @param seconds The number of seconds
 * @returns Formatted duration string (e.g., "5m 30s", "2h 15m")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(" ");
}

/**
 * Calculate the exchange rate between two amounts
 * @param fromAmount The amount being traded
 * @param toAmount The amount being received
 * @returns Exchange rate (toAmount / fromAmount)
 */
export function calculateExchangeRate(
  fromAmount: number,
  toAmount: number
): number {
  if (fromAmount === 0) return 0;
  return toAmount / fromAmount;
}

/**
 * Validate a wallet address
 * @param address The address to validate
 * @returns True if valid
 */
export function isValidWalletAddress(address: string): boolean {
  // Basic validation for Solana addresses (base58 encoded, typically 44-44 characters)
  if (!address || address.length < 32 || address.length > 44) {
    return false;
  }
  // Base58 character set
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

/**
 * Validate a token amount
 * @param amount The amount to validate
 * @param decimals The number of decimals
 * @returns True if valid
 */
export function isValidTokenAmount(
  amount: string,
  decimals: number = 6
): boolean {
  if (!amount) return false;
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return false;
  // Check decimal places
  const decimalPlaces = amount.split(".")[1]?.length || 0;
  if (decimalPlaces > decimals) return false;
  return true;
}

/**
 * Truncate a string to a maximum length
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @param suffix The suffix to add if truncated
 * @returns Truncated string
 */
export function truncateString(
  str: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert a timestamp to a formatted date string
 * @param timestamp The timestamp in milliseconds
 * @param includeTime Whether to include the time
 * @returns Formatted date string
 */
export function formatDateString(
  timestamp: number,
  includeTime: boolean = false
): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.second = "2-digit";
  }
  return date.toLocaleDateString("en-US", options);
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param value The value to check
 * @returns True if empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Debounce a function
 * @param func The function to debounce
 * @param wait The wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep for a specified amount of time
 * @param ms The time to sleep in milliseconds
 * @returns Promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 * @param length The length of the ID
 * @returns Random ID string
 */
export function generateId(length: number = 16): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Convert a value to a number safely
 * @param value The value to convert
 * @param defaultValue The default value if conversion fails
 * @returns Number or default value
 */
export function toNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Copy text to clipboard
 * @param text The text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Format a percentage
 * @param value The value to format
 * @param decimals The number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Clamp a value between min and max
 * @param value The value to clamp
 * @param min The minimum value
 * @param max The maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Derive the metadata PDA for a mint address
 * @param mintAddress The token mint address
 * @returns The metadata PDA
 */
export function deriveMetadataPDA(mintAddress: PublicKey): PublicKey {
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintAddress.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return metadataPDA;
}

/**
 * Fetch token metadata from the blockchain
 * This function tries to fetch from the Token Metadata Program first,
 * then falls back to basic mint info if metadata doesn't exist
 * @param connection The Solana connection
 * @param mintAddress The token mint address
 * @param forceRefresh Force refresh even if cached
 * @returns Token metadata or null if fetch fails
 */
export async function fetchTokenMetadata(
  connection: Connection,
  mintAddress: PublicKey,
  forceRefresh: boolean = false
): Promise<TokenMetadata | null> {
  const addressString = mintAddress.toString();

  // Check cache first
  if (!forceRefresh && tokenMetadataCache.has(addressString)) {
    return tokenMetadataCache.get(addressString)!;
  }

  try {
    // Get basic mint info (always available)
    const mintInfo = await getMint(connection, mintAddress);

    // Try to fetch from Token Metadata Program
    let name = mintAddress.toString().slice(0, 8) + "...";
    let symbol = addressString.slice(0, 4);
    let uri: string | undefined;
    let image: string | undefined;

    try {
      const metadataPDA = deriveMetadataPDA(mintAddress);
      const accountInfo = await connection.getAccountInfo(metadataPDA);

      if (accountInfo && accountInfo.data) {
        // Decode the metadata structure
        const metadata = decodeTokenMetadata(accountInfo.data);
        if (metadata) {
          name = metadata.name;
          symbol = metadata.symbol;
          uri = metadata.uri;

          // Try to fetch image from URI
          if (uri) {
            try {
              const response = await fetch(uri);
              if (response.ok) {
                const json = await response.json();
                image = json.image;
              }
            } catch (err) {
              // URI fetch failed, continue without image
              console.log("Failed to fetch token image from URI:", err);
            }
          }
        }
      }
    } catch (err) {
      // Metadata account doesn't exist or couldn't be fetched
      // Use basic mint info as fallback
      console.log("Token metadata not found, using basic info");
    }

    const metadata: TokenMetadata = {
      address: addressString,
      decimals: mintInfo.decimals,
      name,
      symbol,
      uri,
      image,
    };

    // Cache the result
    tokenMetadataCache.set(addressString, metadata);

    return metadata;
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return null;
  }
}

/**
 * Decode Token Metadata Program data
 * The metadata structure is Borsh-serialized
 * @param data The account data buffer
 * @returns Decoded metadata or null if decode fails
 */
function decodeTokenMetadata(data: Buffer): {
  name: string;
  symbol: string;
  uri?: string;
} | null {
  try {
    // The metadata structure is:
    // - key (1 byte): 0x01 for uninitialized, 0x02 for initialized
    // - update_authority (32 bytes)
    // - mint (32 bytes)
    // - name (4 bytes length + variable data)
    // - symbol (4 bytes length + variable data)
    // - uri (4 bytes length + variable data)
    // - seller_fee_basis_points (2 bytes)
    // - and more fields we don't need...

    let offset = 1; // Skip key byte
    offset += 32; // Skip update_authority
    offset += 32; // Skip mint

    // Read name length (4 bytes)
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    // Read name data
    const nameData = data.subarray(offset, offset + nameLength);
    const name = nameData.toString("utf8").replace(/\0/g, "").trim();
    offset += nameLength;

    // Read symbol length (4 bytes)
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    // Read symbol data
    const symbolData = data.subarray(offset, offset + symbolLength);
    const symbol = symbolData.toString("utf8").replace(/\0/g, "").trim();
    offset += symbolLength;

    // Read URI length (4 bytes)
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    // Read URI data
    const uriData = data.subarray(offset, offset + uriLength);
    const uri = uriData.toString("utf8").replace(/\0/g, "").trim();

    return {
      name: name || "Unknown Token",
      symbol: symbol || "UNK",
      uri: uri || undefined,
    };
  } catch (error) {
    console.error("Error decoding token metadata:", error);
    return null;
  }
}

/**
 * Clear the token metadata cache
 * Useful for testing or when you want to force refresh
 */
export function clearTokenMetadataCache(): void {
  tokenMetadataCache.clear();
}

/**
 * Clear a specific token from the cache
 * @param mintAddress The token mint address
 */
export function clearTokenFromCache(mintAddress: PublicKey): void {
  tokenMetadataCache.delete(mintAddress.toString());
}
