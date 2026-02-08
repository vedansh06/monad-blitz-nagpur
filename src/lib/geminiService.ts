// src/lib/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "@/components/ui/use-toast";
import { WhaleTransaction } from "./explorerService";

// Initialize the Gemini API with your API key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Check if Gemini API is available
 */
export const isGeminiAvailable = (): boolean => {
  return !!apiKey && apiKey !== "your_gemini_api_key_here";
};

/**
 * Generate token insights using Gemini API
 */
export async function generateTokenInsights(
  symbol: string,
  context?: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create the prompt with the token symbol and any additional context
    const prompt = `
      Provide a brief market analysis for the cryptocurrency ${symbol}.
      
      ${context || ""}
      
      Focus on:
      - Recent price action and key technical indicators
      - On-chain metrics if relevant
      - Market sentiment and recent news
      - Potential catalysts for price movement
      
      Keep your response concise (max 150 words) and focus only on data-driven insights.
      Format the response in a way that's easy to read with bullet points.
      
      Note: This is for a portfolio management application focused on Monad Blockchain ecosystem tokens.
    `;

    // Make the API request with the new SDK
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating token insights with Gemini:", error);

    // Check for specific API key errors
    if (
      error instanceof Error &&
      (error.message.includes("API key expired") ||
        error.message.includes("API_KEY_INVALID") ||
        error.message.includes("401") ||
        error.message.includes("403"))
    ) {
      // Return a structured fallback analysis when API key is invalid
      return `# ${symbol} Token Analysis

## Market Overview
The ${symbol} token is part of the Monad Blockchain ecosystem, which focuses on Bitcoin-secured smart contracts and decentralized finance.

## Key Characteristics
• **Ecosystem Role**: Monad blockchain native or ecosystem token
• **Use Case**: Likely involved in staking, governance, or DeFi protocols
• **Network**: Built on or connected to Monad Blockchain infrastructure

## Technical Analysis
• **Blockchain**: Monad Blockchain (Bitcoin-secured)
• **Type**: ${symbol.length <= 4 ? "Likely native or major ecosystem token" : "Protocol or application token"}
• **Liquidity**: Monitor trading volume and market depth

## Trading Considerations
• **Volatility**: Cryptocurrency markets are highly volatile
• **Research**: Always conduct thorough research before trading
• **Risk Management**: Use appropriate position sizing and stop losses

## Monad Ecosystem Context
${context ? `• Market Context: ${context}` : "• Current market data temporarily unavailable"}
• **Bitcoin Security**: Benefits from Bitcoin's hash power security
• **DeFi Integration**: Part of growing Monad DeFi ecosystem

*Note: This is a general analysis. For real-time AI insights, please ensure your Gemini API key is valid and up to date.*`;
    }

    // For other errors, return a simpler fallback
    if (error instanceof Error) {
      return `Unable to retrieve detailed token insights for ${symbol}. Error: ${error.message}. Please try again later or check your API configuration.`;
    }
    return `Unable to retrieve token insights for ${symbol} at this time. Please try again later.`;
  }
}

/**
 * Generate AI chat response using Gemini
 */
export async function generateChatResponse(
  userMessage: string,
  chatHistory: Array<{ sender: string; content: string }>,
): Promise<{ content: string; action: any }> {
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Format chat history for context
    const formattedHistory = chatHistory
      .map(
        (msg) =>
          `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.content}`,
      )
      .join("\n\n");

    // Create the prompt with context about the application
    const prompt = `
      You are MonoFi-AI, an AI assistant specializing in cryptocurrency portfolio management and market analysis on Monad Blockchain.
      
      Focus on these tokens available in the portfolio: MON, USDC, USDT, WBTC, WETH, WSOL, PINGU, sMON, aprMON, DAK, YAKI, CHOG, shMON.
      
      Note: USDC is the primary currency for portfolio management and transactions.
      
      Token categories include:
      - Layer 1 (l1): MON, WSOL 
      - Stablecoins: USDC, USDT
      - Big Cap: WBTC, WETH
      - DeFi: sMON, aprMON, DAK, shMON
      - Meme: PINGU, YAKI, CHOG
      
      When suggesting portfolio changes, provide specific allocation percentages and reasoning.
      
      Previous conversation:
      ${formattedHistory}
      
      User's latest message: ${userMessage}
      
      Respond in a helpful, concise manner. If suggesting portfolio changes, include specific allocation adjustments.
    `;

    // Make the API request with the new SDK
    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    // Parse for potential actions (portfolio adjustments)
    const action = parseActionFromResponse(content);

    return {
      content,
      action,
    };
  } catch (error) {
    console.error("Error generating chat response with Gemini:", error);
    throw error;
  }
}

/**
 * Helper function to parse potential actions from AI responses
 */
function parseActionFromResponse(text: string) {
  // Check if the response contains allocation suggestions
  if (
    text.includes("allocation") ||
    text.includes("portfolio") ||
    text.includes("rebalance")
  ) {
    // Define category mappings
    const categoryMap: Record<string, { id: string; name: string }> = {
      ai: { id: "ai", name: "AI & DeFi" },
      "artificial intelligence": { id: "ai", name: "AI & DeFi" },
      meme: { id: "meme", name: "Meme & NFT" },
      "meme coin": { id: "meme", name: "Meme & NFT" },
      "meme coins": { id: "meme", name: "Meme & NFT" },
      nft: { id: "meme", name: "Meme & NFT" },
      rwa: { id: "rwa", name: "Real World Assets" },
      "real world assets": { id: "rwa", name: "Real World Assets" },
      "big cap": { id: "bigcap", name: "Big Cap" },
      bigcap: { id: "bigcap", name: "Big Cap" },
      "large cap": { id: "bigcap", name: "Big Cap" },
      defi: { id: "defi", name: "DeFi" },
      "decentralized finance": { id: "defi", name: "DeFi" },
      "layer 1": { id: "l1", name: "Layer 1" },
      l1: { id: "l1", name: "Layer 1" },
      stablecoin: { id: "stablecoin", name: "Stablecoins" },
      stablecoins: { id: "stablecoin", name: "Stablecoins" },
      stable: { id: "stablecoin", name: "Stablecoins" },
    };

    // Try to extract changes from the text
    const changes: Array<{
      category: string;
      name: string;
      from: number;
      to: number;
    }> = [];

    // Look for patterns like "increase X from Y% to Z%" or "increase X by Y%"
    const increaseFromToPattern =
      /increase\s+(\w+(?:\s+\w+)*)\s+from\s+(\d+)%\s+to\s+(\d+)%/gi;
    const increaseByPattern = /increase\s+(\w+(?:\s+\w+)*)\s+by\s+(\d+)%/gi;
    const decreaseFromToPattern =
      /decrease\s+(\w+(?:\s+\w+)*)\s+from\s+(\d+)%\s+to\s+(\d+)%/gi;
    const decreaseByPattern = /decrease\s+(\w+(?:\s+\w+)*)\s+by\s+(\d+)%/gi;
    const allocatePattern = /allocate\s+(\d+)%\s+to\s+(\w+(?:\s+\w+)*)/gi;

    // Extract increase from X% to Y%
    let match;
    while ((match = increaseFromToPattern.exec(text)) !== null) {
      const category = match[1].toLowerCase();
      const from = parseInt(match[2]);
      const to = parseInt(match[3]);

      if (categoryMap[category]) {
        changes.push({
          category: categoryMap[category].id,
          name: categoryMap[category].name,
          from,
          to,
        });
      }
    }

    // Extract decrease from X% to Y%
    while ((match = decreaseFromToPattern.exec(text)) !== null) {
      const category = match[1].toLowerCase();
      const from = parseInt(match[2]);
      const to = parseInt(match[3]);

      if (categoryMap[category]) {
        changes.push({
          category: categoryMap[category].id,
          name: categoryMap[category].name,
          from,
          to,
        });
      }
    }

    // If we don't have any changes yet, try other patterns
    if (changes.length === 0) {
      // Extract increase by X%
      while ((match = increaseByPattern.exec(text)) !== null) {
        const category = match[1].toLowerCase();
        const changeAmount = parseInt(match[2]);

        if (categoryMap[category]) {
          // We don't know the current allocation, so we'll use placeholders
          // These will be replaced with actual values in the AdjustmentModal
          changes.push({
            category: categoryMap[category].id,
            name: categoryMap[category].name,
            from: 15, // placeholder
            to: 15 + changeAmount, // placeholder + change
          });
        }
      }

      // Extract decrease by X%
      while ((match = decreaseByPattern.exec(text)) !== null) {
        const category = match[1].toLowerCase();
        const changeAmount = parseInt(match[2]);

        if (categoryMap[category]) {
          changes.push({
            category: categoryMap[category].id,
            name: categoryMap[category].name,
            from: 15, // placeholder
            to: Math.max(0, 15 - changeAmount), // placeholder - change, min 0
          });
        }
      }

      // Extract allocate X% to Y
      while ((match = allocatePattern.exec(text)) !== null) {
        const allocation = parseInt(match[1]);
        const category = match[2].toLowerCase();

        if (categoryMap[category]) {
          changes.push({
            category: categoryMap[category].id,
            name: categoryMap[category].name,
            from: 15, // placeholder
            to: allocation,
          });
        }
      }
    }

    // If we found any changes, return an action
    if (changes.length > 0) {
      return {
        type: "rebalance",
        description: "Apply AI-suggested portfolio changes",
        changes,
      };
    }
  }

  return null;
}

/**
 * Generate whale analysis using Gemini API
 */
export async function generateWhaleAnalysis(
  transaction: WhaleTransaction,
): Promise<string> {
  if (!isGeminiAvailable()) {
    throw new Error("Gemini API is not available");
  }

  const prompt = `
You are a blockchain analyst specializing in whale transaction analysis for the Monad Blockchain ecosystem. 
Analyze this whale transaction and provide insights:

Transaction Details:
- Type: ${transaction.type} (buy/sell/transfer)
- Token: ${transaction.tokenSymbol} (${transaction.tokenName})
- Amount: ${transaction.valueFormatted} tokens
- USD Value: ${transaction.usdValue}
- From: ${transaction.from}
- To: ${transaction.to}
- Time: ${transaction.age}
- Hash: ${transaction.hash}

Please provide a comprehensive analysis including:
1. Transaction overview and significance
2. Analysis of the sender and recipient wallets
3. Potential market impact of this transaction
4. Related on-chain activity and patterns
5. Recommendations for traders/investors

Format your response in Markdown with appropriate headings and bullet points.
Keep your analysis factual and evidence-based. Mention if certain conclusions are speculative.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating whale analysis:", error);

    // Fallback to a template response if the API fails
    return `
# Whale Transaction Analysis

## Transaction Overview
A significant **${transaction.type}** of **${transaction.valueFormatted} ${transaction.tokenSymbol}** (worth approximately ${transaction.usdValue}) occurred ${transaction.age}.

## Wallet Analysis
- **Sender**: ${transaction.from.substring(0, 8)}...${transaction.from.substring(36)} appears to be a ${transaction.type === "sell" ? "long-term holder" : "exchange wallet"} based on transaction history.
- **Recipient**: ${transaction.to.substring(0, 8)}...${transaction.to.substring(36)} is ${transaction.type === "buy" ? "accumulating this token" : "likely a custodial wallet"}.

## Market Impact
This transaction represents a significant movement for ${transaction.tokenSymbol}. Transactions of this size can ${transaction.type === "sell" ? "create selling pressure" : transaction.type === "buy" ? "signal strong buying interest" : "indicate OTC trading activity"}.

## Related On-Chain Activity
There have been several other similar-sized transactions recently, suggesting ${transaction.type === "buy" ? "accumulation by large investors" : transaction.type === "sell" ? "distribution phase" : "possible token redistribution"}.

## Recommendation
Monitor ${transaction.tokenSymbol} price action over the next 24-48 hours for potential ${transaction.type === "buy" ? "upward movement" : transaction.type === "sell" ? "downward pressure" : "increased volatility"}.

*Note: This is a fallback analysis generated due to AI service unavailability. For more accurate insights, please try again later.*
`;
  }
}

/**
 * Generate Monad staking analysis using Gemini API
 */
export async function generateStakingAnalysis(stakingData: {
  latestRound: number;
  activeValidatorCount: number;
  monStakerCount: number;
  stakedMonAmount: string;
  totalTransactions: number;
  networkHashRate: string;
}): Promise<string> {
  if (!isGeminiAvailable()) {
    throw new Error("Gemini API is not available");
  }

  // Calculate formatted values for analysis
  const monStaked = parseFloat(stakingData.stakedMonAmount) / 1e18;
  const totalStakersCount = stakingData.monStakerCount;

  const prompt = `
You are a DeFi and blockchain staking analyst specializing in the Monad Blockchain ecosystem.
Analyze the current Monad staking data and provide comprehensive trading insights:

Current Staking Metrics:
- Latest Round: #${stakingData.latestRound}
- Active Validators: ${stakingData.activeValidatorCount}
- Total MON Staked: ${(monStaked / 1e6).toFixed(2)}M MON tokens
- MON Stakers: ${stakingData.monStakerCount.toLocaleString()} participants
- Total Transactions: ${stakingData.totalTransactions.toLocaleString()}
- Network Hash Rate: ${stakingData.networkHashRate}
- Total Participants: ${totalStakersCount.toLocaleString()} stakers

Please provide a comprehensive analysis including:

## Market Analysis
1. **Staking Health Assessment**: Overall network security and decentralization level
2. **MON Staking Significance**: Impact of ${(monStaked / 1e6).toFixed(2)}M MON being staked on Monad
3. **Validator Economics**: Analysis of ${stakingData.activeValidatorCount} active validators
4. **Participation Trends**: Insights on staker distribution and engagement

## Trading Implications
1. **MON Token Demand**: How staking metrics affect MON token price pressure
2. **Yield Opportunities**: Staking rewards vs trading opportunities assessment
3. **Market Sentiment**: What these numbers suggest about Monad ecosystem adoption
4. **Liquidity Impact**: How staked assets affect circulating supply

## Strategic Recommendations
1. **For MON Holders**: Optimal staking vs trading strategies
2. **Risk Assessment**: Validator concentration and slashing risks
3. **Timing Considerations**: Best entry/exit points based on staking cycles
4. **DeFi Integration**: How staking affects DeFi protocols on Monad

## Future Outlook
1. **Growth Projections**: Expected staking participation trends
2. **Ecosystem Development**: Impact on Monad blockchain adoption
3. **Competitive Position**: How Monad staking compares to other chains
4. **Potential Catalysts**: Events that could drive staking growth

Format your response in Markdown with clear headings and actionable insights.
Focus on providing practical trading and investment guidance based on the staking data.
Be specific about risks and opportunities while remaining objective.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    console.log("🚀 Requesting Gemini 2.0 Flash analysis...");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("✅ Gemini 2.0 Flash analysis completed successfully");
    return text;
  } catch (error) {
    console.error("Error generating staking analysis:", error);

    // Provide more helpful error messages based on error type
    if (error instanceof Error && error.message.includes("429")) {
      return `
# Rate Limit Reached 🚦

The AI analysis service is currently experiencing high demand. Please wait a few minutes before trying again.

## Current Staking Overview (Live Data)

**MON Staking**: ${(monStaked / 1e6).toFixed(2)}M MON from ${stakingData.monStakerCount.toLocaleString()} stakers

**Network Status**: ${stakingData.activeValidatorCount} active validators in round #${stakingData.latestRound}

**Network Hash Rate**: ${stakingData.networkHashRate}

## Quick Analysis

With ${(monStaked / 1e6).toFixed(2)}M MON staked on Monad, this represents significant commitment to the ecosystem. The ${stakingData.monStakerCount > 1000 ? "strong" : "growing"} participation from ${stakingData.monStakerCount.toLocaleString()} MON stakers indicates ${stakingData.monStakerCount > 1000 ? "excellent" : "positive"} adoption.

**Trading Implications**: High staking participation typically indicates bullish sentiment and reduced circulating supply pressure.

*Please try the full AI analysis again in a few minutes.*
        `;
    } else {
      // Fallback to a template response if the API fails
      return `
# Monad Blockchain Staking Analysis

## Market Overview
The Monad blockchain currently shows **strong staking participation** with ${(monStaked / 1e6).toFixed(2)}M MON tokens staked across the network.

## Key Metrics Analysis

### Network Security
- **${stakingData.activeValidatorCount} Active Validators**: ${stakingData.activeValidatorCount < 20 ? "Moderate centralization risk" : stakingData.activeValidatorCount < 50 ? "Good decentralization" : "Excellent decentralization"}
- **Round #${stakingData.latestRound}**: Network operating consistently
- **Total Stakers**: ${totalStakersCount.toLocaleString()} MON stakers
- **Network Hash Rate**: ${stakingData.networkHashRate}

### MON Staking Significance
- **${(monStaked / 1e6).toFixed(2)}M MON Staked**: Represents significant commitment to Monad ecosystem
- **${stakingData.monStakerCount} MON Stakers**: ${stakingData.monStakerCount > 1000 ? "Strong" : "Growing"} adoption of MON staking
- **Average Stake**: ~${(monStaked / stakingData.monStakerCount).toFixed(3)} MON per staker

## Trading Implications

### MON Token Dynamics
- **Staking Demand**: ${(monStaked / 1e6).toFixed(2)}M MON locked reduces circulating supply
- **Yield Competition**: Staking rewards compete with trading opportunities
- **Long-term Bias**: High staking suggests holder confidence

### Market Sentiment
- **Ecosystem Growth**: ${stakingData.monStakerCount > 10000 ? "Excellent" : "Good"} participation rate
- **Network Adoption**: Strong validator participation indicates healthy network
- **Validator Health**: ${stakingData.activeValidatorCount > 30 ? "Robust" : "Developing"} validator network

## Strategic Recommendations

### For MON Holders
- **Consider Staking**: Current participation suggests attractive yields
- **Monitor Unlock Cycles**: Plan around staking/unstaking periods
- **Diversification**: Balance between staking rewards and trading flexibility

### Risk Factors
- **Validator Concentration**: Monitor for centralization trends
- **Slashing Risk**: Understand penalty mechanisms
- **Liquidity**: Account for staking lock-up periods

## Future Outlook
- **Growing Adoption**: Increasing staker counts suggest positive trend
- **Ecosystem Expansion**: MON staking drives Monad ecosystem growth
- **Yield Sustainability**: Monitor rewards vs inflation dynamics

*Note: This is a fallback analysis. For more detailed insights, please ensure AI service availability.*
`;
    }
  }
}
