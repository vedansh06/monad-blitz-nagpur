# Monad Indexing API Documentation

## Overview

The Monad Indexing API is provided by BlockVision and offers comprehensive blockchain data access for the Monad Testnet. The API provides 16 different endpoints for accessing account data, DeFi activities, NFTs, transactions, and trading information.

### Base URL
```
https://api.blockvision.org/v2/monad
```

### Authentication
All API calls require authentication via API key in the header:
```
Header: X-API-KEY: your_api_key_here
```

### Pricing & Limits
- **Paid Members**: Full access to all endpoints
- **Free Tier**: 30 free trial calls available
- **Registration**: [BlockVision Dashboard](https://dashboard.blockvision.org/overview)
- **Note**: API Key can also be used for RPC endpoints

## Available Endpoints

### 1. Account Tokens
**GET** `/account/tokens`

Retrieve all tokens held by a specific account address.

**Parameters:**
- `address` (string, required): 42-character address with '0x' prefix
- `cursor` (string, optional): Next page cursor for pagination
- `limit` (integer, optional): Maximum results per page (default: 20, max: 50)

**Response:**
- `code` (number): Status code (0 for success)
- `reason` (string): Error reason if applicable
- `message` (string): Response message
- `result` (object):
  - `data` (array): Token information objects
    - `token` (string): Token contract address
    - `name` (string): Token name
    - `symbol` (string): Token symbol
    - `decimal` (integer): Token decimals
    - `amount` (string): Token amount held
    - `usdValue` (string): USD value of holdings
    - `image` (string): Token logo URL
    - `verified` (boolean): Token verification status
  - `nextPageCursor` (string): Pagination cursor

### 2. Account Transactions
**GET** `/account/transactions`

Retrieve transaction history for a specific account.

**Parameters:**
- `address` (string, required): 42-character address with '0x' prefix
- `cursor` (string, optional): Next page cursor for pagination
- `limit` (integer, optional): Maximum results per page (default: 20, max: 50)
- `ascendingOrder` (boolean, optional): Sort order for results

**Response:**
- `code` (number): Status code
- `reason` (string): Error reason if applicable
- `message` (string): Response message
- `result` (object):
  - `data` (array): Transaction objects
    - `hash` (string): Transaction hash
    - `blockHash` (string): Block hash containing transaction
    - `blockNumber` (integer): Block number
    - `timestamp` (integer): Unix timestamp
    - `from` (string): Sender address
    - `to` (string): Recipient address
    - `value` (string): Transaction value in Wei
    - `transactionFee` (string): Gas fee paid
    - `gasUsed` (string): Gas consumed
    - `status` (string): Transaction status
    - `methodID` (string): Method identifier
    - `methodName` (string): Human-readable method name
  - `nextPageCursor` (string): Pagination cursor

### 3. Token Trades
**GET** `/token/trades`

Retrieve token trading data from decentralized exchanges.

**Parameters:**
- `contractAddress` (string, optional): Token contract address
- `sender` (string, optional): Trade sender address
- `type` (string, optional): Trade type ("buy", "sell")
- `cursor` (string, optional): Next page cursor
- `limit` (integer, optional): Maximum results per page (default: 20, max: 50)

**Response:**
- `data` (array): Trading transaction records
  - `txHash` (string): Transaction hash
  - `sender` (string): Transaction initiator address
  - `type` (string): Transaction type ("buy" or "sell")
  - `dex` (string): Exchange name (e.g., "Octo", "UniswapV3", "Bean Exchange")
  - `timestamp` (integer): Unix timestamp
  - `poolAddress` (string): Liquidity pool contract address
  - `price` (string): Effective trade price
  - `token0Info` (object): First token details
    - `token` (string): Contract address
    - `amount` (string): Token amount (human-readable)
    - `amountUSD` (string): USD value
    - `decimal` (integer): Token decimals
    - `name` (string): Token name
    - `symbol` (string): Token symbol
    - `image` (string): Token logo URL
    - `verified` (boolean): Verification status
  - `token1Info` (object): Second token details (same structure as token0Info)
- `nextPageCursor` (integer): Pagination cursor

### 4. Token Holders
**GET** `/token/holders`

Retrieve token holder distribution for a specific token contract.

**Parameters:**
- `contractAddress` (string, required): Token contract address with '0x' prefix
- `cursor` (string, optional): Next page cursor
- `limit` (integer, optional): Maximum results per page (default: 20, max: 50)

**Response:**
- `code` (number): Status code
- `reason` (string): Error reason if applicable
- `message` (string): Response message
- `result` (object):
  - `data` (array): Token holder objects
    - `holder` (string): Wallet address of holder
    - `percentage` (string): Percentage of total supply held
    - `usdValue` (string): USD value of holdings
    - `amount` (string): Token amount held
    - `isContract` (boolean): Whether holder is a contract
  - `nextPageCursor` (string): Pagination cursor

## Additional Endpoints (Available but not detailed)

The following endpoints are available in the Monad Indexing API but require further documentation:

5. **DeFi Activities** - DeFi protocol interactions
6. **NFT Data** - Non-fungible token information
7. **Account Activity** - General account activity tracking
8. **Internal Transactions** - Internal contract calls
9. **Token Activities** - Detailed token transfer activities
10. **NFT Activities** - NFT transfer and trading activities
11. **Monad Holders** - Native MON token holders
12. **Collection Holders** - NFT collection holder data
13. **Contract Source Code** - Smart contract source verification
14. **Token Gating** - Token-based access control data
15. **Token Detail** - Comprehensive token metadata
16. **Token Pools** - Liquidity pool information

## Whale Tracking Implementation Notes

For implementing whale tracking functionality, the most relevant endpoints are:

1. **Account Transactions** - Track large value transactions
2. **Token Trades** - Monitor significant trading activity
3. **Token Holders** - Identify large token holders
4. **Account Tokens** - Analyze whale portfolio composition

### Whale Detection Criteria
- Large transaction values (configurable threshold)
- High percentage token holdings
- Frequent large trading activity
- Portfolio diversity analysis

### Rate Limiting Considerations
- Free tier: 30 trial calls total
- Paid tier: Standard rate limits apply
- Implement efficient caching and pagination
- Batch similar requests when possible

## Error Handling

All endpoints return standardized error responses:
- `code`: Numeric error code
- `reason`: Error description
- `message`: User-friendly error message

Common error codes and handling strategies should be implemented for robust whale tracking functionality.