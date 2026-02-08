import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  BarChart2,
  ArrowRight,
  TrendingUp,
  Search,
  Shield,
  Mic,
  MicOff,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import AdjustmentModal from "./AdjustmentModal";
import GfVx5PnDyJLottie from "./GfVx5PnDyJLottie";
import { fetchTokenInsights } from "@/lib/tokenService";
import { generateChatResponse, isGeminiAvailable } from "@/lib/geminiService";
import { useAccount } from "wagmi";
import { useBlockchain } from "@/contexts/BlockchainContext";

// Web Speech API TypeScript interfaces
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onnomatch:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
  sentiment?: "positive" | "negative" | "neutral" | "excited" | "concerned";
  intent?: string;
  context?: {
    topicContinuation?: boolean;
    questionType?: "informational" | "actionable" | "exploratory";
    userMood?: string;
  };
  action?: {
    type: string;
    description: string;
    priority?: "low" | "medium" | "high" | "urgent";
    confidence?: number;
    changes?: {
      category: string;
      name: string;
      from: number;
      to: number;
    }[];
  };
}

interface UserProfile {
  riskTolerance: "conservative" | "moderate" | "aggressive";
  tradingExperience: "beginner" | "intermediate" | "expert";
  preferredCategories: string[];
  communicationStyle: "formal" | "friendly" | "technical";
  investmentGoals: string[];
  lastActiveSession: Date;
  totalInteractions: number;
  favoriteTopics: string[];
}

interface ConversationContext {
  currentTopic: string;
  topicHistory: string[];
  unansweredQuestions: string[];
  userEmotionalState: string;
  lastActionTaken: string | null;
  conversationDepth: number;
}

// Storage keys for localStorage
const CHAT_STORAGE_KEY = "MonoFi-AI_chat_messages";
const USER_PROFILE_KEY = "MonoFi-AI_user_profile";
const CONVERSATION_CONTEXT_KEY = "MonoFi-AI_conversation_context";

// Enhanced market intelligence data for AI suggestions with realistic allocation changes
const marketInsights = [
  {
    type: "trending",
    content:
      "Based on on-chain data analysis, MON (Layer 1) is showing a significant increase in whale accumulation. Three addresses have accumulated over $2.7M in the last 48 hours. Consider increasing your Layer 1 allocation by 5%.",
    action: {
      type: "rebalance",
      description:
        "Increase Layer 1 allocation based on whale accumulation data",
      changes: [
        { category: "l1", name: "Layer 1", from: 15, to: 20 },
        { category: "meme", name: "Meme & NFT", from: 10, to: 5 },
      ],
    },
  },
  {
    type: "volume",
    content:
      "PINGU is experiencing abnormal trading volume, up 320% in the last 24 hours. Social sentiment analysis shows this meme coin trending across major platforms. Consider a small speculative position of 2%.",
    action: {
      type: "trade",
      description: "Add PINGU position based on volume and sentiment analysis",
      changes: [
        { category: "meme", name: "Meme & NFT", from: 10, to: 12 },
        { category: "stablecoin", name: "Stablecoins", from: 5, to: 3 },
      ],
    },
  },
  {
    type: "news",
    content:
      "Breaking: Crystal Exchange volume has increased 78% following the MON price rally. According to our technical analysis, the sMON token is currently undervalued based on TVL metrics. Consider increasing your DeFi exposure.",
    action: {
      type: "rebalance",
      description: "Increase DeFi exposure based on Crystal Exchange metrics",
      changes: [
        { category: "defi", name: "DeFi", from: 15, to: 18 },
        { category: "stablecoin", name: "Stablecoins", from: 5, to: 2 },
      ],
    },
  },
  {
    type: "technical",
    content:
      "Technical analysis suggests WBTC is forming a bullish consolidation pattern with decreasing sell pressure. With traditional markets showing uncertainty, increasing your Bitcoin exposure may provide a hedge. Recommend 3% allocation shift from stablecoins to WBTC.",
    action: {
      type: "rebalance",
      description:
        "Shift allocation from stablecoins to Bitcoin based on technical analysis",
      changes: [
        { category: "bigcap", name: "Big Cap", from: 25, to: 28 },
        { category: "stablecoin", name: "Stablecoins", from: 5, to: 2 },
      ],
    },
  },
  {
    type: "risk",
    content:
      "Risk assessment alert: Your portfolio exposure to meme tokens (22%) exceeds recommended thresholds. Consider rebalancing to reduce volatility, particularly with CHOG token showing signs of distribution by early investors.",
    action: {
      type: "protection",
      description: "Reduce meme token exposure to mitigate volatility risk",
      changes: [
        { category: "meme", name: "Meme & NFT", from: 22, to: 15 },
        { category: "bigcap", name: "Big Cap", from: 25, to: 28 },
        { category: "stablecoin", name: "Stablecoins", from: 5, to: 9 },
      ],
    },
  },
  {
    type: "defi",
    content:
      "DeFi yield opportunities analysis: aprMON protocol has increased lending yields to 8.2% APY for stablecoins. Consider shifting 3% from your Layer 1 allocation to DeFi to capitalize on this yield opportunity.",
    action: {
      type: "rebalance",
      description: "Increase DeFi allocation to capture higher yields",
      changes: [
        { category: "defi", name: "DeFi", from: 15, to: 18 },
        { category: "l1", name: "Layer 1", from: 15, to: 12 },
      ],
    },
  },
  {
    type: "layer1",
    content:
      "On-chain metrics for MON are showing strong growth with daily active addresses up 34% this month. The upcoming protocol upgrade could drive further adoption. Consider increasing your Layer 1 exposure.",
    action: {
      type: "rebalance",
      description: "Increase Layer 1 allocation based on MON metrics",
      changes: [
        { category: "l1", name: "Layer 1", from: 15, to: 18 },
        { category: "rwa", name: "RWA", from: 15, to: 12 },
      ],
    },
  },
  {
    type: "rwa",
    content:
      "Real World Assets (RWA) tokens are showing increased institutional adoption. Traditional asset tokenization platforms have onboarded three new institutional investors. Consider increasing your stablecoin allocation for portfolio stability.",
    action: {
      type: "rebalance",
      description: "Increase RWA allocation for portfolio stability",
      changes: [
        { category: "rwa", name: "RWA", from: 15, to: 18 },
        { category: "meme", name: "Meme & NFT", from: 10, to: 7 },
      ],
    },
  },
  {
    type: "bigcap",
    content:
      "Bitcoin's correlation with traditional markets has decreased to a 6-month low (0.32), suggesting improved diversification benefits. Consider increasing your Big Cap allocation as a hedge against market uncertainty.",
    action: {
      type: "rebalance",
      description: "Increase Bitcoin allocation as market hedge",
      changes: [
        { category: "bigcap", name: "Big Cap", from: 25, to: 30 },
        { category: "meme", name: "Meme & NFT", from: 10, to: 5 },
      ],
    },
  },
  {
    type: "stablecoin",
    content:
      "Market volatility indicators are flashing warning signals with the Crypto Fear & Greed Index at 82 (Extreme Greed). Consider increasing your stablecoin reserves to prepare for potential market corrections.",
    action: {
      type: "protection",
      description: "Increase stablecoin reserves as volatility hedge",
      changes: [
        { category: "stablecoin", name: "Stablecoins", from: 5, to: 10 },
        { category: "meme", name: "Meme & NFT", from: 10, to: 5 },
      ],
    },
  },
  {
    type: "balanced",
    content:
      "Portfolio analysis indicates your current allocation is suboptimal based on risk-adjusted return metrics. A more balanced approach across sectors could improve your Sharpe ratio by an estimated 0.4 points.",
    action: {
      type: "rebalance",
      description: "Optimize portfolio for better risk-adjusted returns",
      changes: [
        { category: "defi", name: "DeFi", from: 15, to: 18 },
        { category: "bigcap", name: "Big Cap", from: 25, to: 28 },
        { category: "meme", name: "Meme & NFT", from: 10, to: 5 },
        { category: "l1", name: "Layer 1", from: 15, to: 17 },
        { category: "stablecoin", name: "Stablecoins", from: 5, to: 12 },
      ],
    },
  },
  {
    type: "security",
    content:
      "Security analysis of your portfolio indicates high exposure to newer, less audited protocols. Consider shifting 5% from meme tokens to more established projects with stronger security track records.",
    action: {
      type: "protection",
      description: "Reduce exposure to less secure protocols",
      changes: [
        { category: "meme", name: "Meme & NFT", from: 10, to: 5 },
        { category: "bigcap", name: "Big Cap", from: 25, to: 30 },
      ],
    },
  },
  {
    type: "regulatory",
    content:
      "Regulatory developments in the EU suggest increased scrutiny of meme tokens. To mitigate regulatory risk, consider reducing your meme token exposure and increasing allocation to compliant assets.",
    action: {
      type: "protection",
      description: "Reduce regulatory risk exposure",
      changes: [
        { category: "meme", name: "Meme & NFT", from: 10, to: 5 },
        { category: "rwa", name: "RWA", from: 15, to: 20 },
      ],
    },
  },
  {
    type: "yield",
    content:
      "Yield analysis shows MON staking returns have increased to 9.3% APY following the latest protocol upgrade. Consider increasing your Layer 1 allocation to capture these enhanced staking rewards.",
    action: {
      type: "rebalance",
      description: "Increase Layer 1 allocation for higher staking yields",
      changes: [
        { category: "l1", name: "Layer 1", from: 15, to: 20 },
        { category: "stablecoin", name: "Stablecoins", from: 5, to: 0 },
      ],
    },
  },
  {
    type: "innovation",
    content:
      "The DeFi token sector is experiencing accelerated innovation with shMON launching new shared staking mechanisms. Early adopters could benefit from significant growth. Consider increasing your DeFi allocation.",
    action: {
      type: "rebalance",
      description: "Increase DeFi allocation to capture innovation growth",
      changes: [
        { category: "defi", name: "DeFi", from: 15, to: 20 },
        { category: "stablecoin", name: "Stablecoins", from: 5, to: 0 },
      ],
    },
  },
];

// Function to format portfolio adjustment suggestions in a readable format
const formatPortfolioSuggestion = (action: any, content: string): string => {
  if (!action?.changes || action.changes.length === 0) {
    return content;
  }

  // Token examples based on actual TokenTable data
  const getTokenExamples = (categoryId: string): string => {
    const tokenMap: { [key: string]: string } = {
      ai: "AI-based tokens (not currently available)",
      meme: "PINGU, YAKI, CHOG",
      rwa: "Real World Asset tokens (not currently available)",
      bigcap: "WBTC, WETH",
      defi: "sMON, aprMON, DAK, shMON",
      l1: "MON, WSOL",
      stablecoin: "USDC, USDT",
    };
    return tokenMap[categoryId] || "Various tokens";
  };

  const formatChange = (change: any) => {
    const direction = change.to > change.from ? "📈" : "📉";
    const changeAmount = Math.abs(change.to - change.from);
    const arrow = change.to > change.from ? "↗️" : "↘️";
    const tokenExamples = getTokenExamples(change.category);

    return `${direction} **${change.name}**: ${change.from}% ${arrow} ${change.to}% (${change.to > change.from ? "+" : ""}${changeAmount}%) - (${tokenExamples})`;
  };

  let formattedContent = content + "\n\n";

  // Add visual separator
  formattedContent += "📊 **Suggested Portfolio Adjustments:**\n";
  formattedContent += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

  // Group changes by increase/decrease
  const increases = action.changes.filter((c: any) => c.to > c.from);
  const decreases = action.changes.filter((c: any) => c.to < c.from);

  if (increases.length > 0) {
    formattedContent += "🟢 **เพิ่มการจัดสรร:**\n";
    increases.forEach((change: any) => {
      const description = getDescriptionForChange(change, "increase");
      formattedContent += `   ${formatChange(change)}${description ? ` - ${description}` : ""}\n`;
    });
    formattedContent += "\n";
  }

  if (decreases.length > 0) {
    formattedContent += "🔴 **ลดการจัดสรร:**\n";
    decreases.forEach((change: any) => {
      const description = getDescriptionForChange(change, "decrease");
      formattedContent += `   ${formatChange(change)}${description ? ` - ${description}` : ""}\n`;
    });
    formattedContent += "\n";
  }

  // Add summary
  const totalIncrease = increases.reduce(
    (sum: number, c: any) => sum + (c.to - c.from),
    0,
  );
  const totalDecrease = decreases.reduce(
    (sum: number, c: any) => sum + (c.from - c.to),
    0,
  );

  formattedContent += "📋 **Summary:**\n";
  formattedContent += `   💰 Total Reallocation: ${Math.max(totalIncrease, totalDecrease)}%\n`;
  formattedContent += `   🎯 Strategy: ${
    action.type === "rebalance"
      ? "Portfolio Rebalancing"
      : action.type === "protection"
        ? "Risk Mitigation"
        : action.type === "trade"
          ? "Trading Opportunity"
          : "Portfolio Optimization"
  }\n`;

  if (action.confidence) {
    formattedContent += `   🎯 Confidence Level: ${Math.round(action.confidence * 100)}%\n`;
  }

  formattedContent +=
    '\n💡 **Click "Adjust Portfolio" below to apply these changes with pre-filled values.**';

  return formattedContent;
};

// Helper function to get contextual descriptions for changes
const getDescriptionForChange = (
  change: any,
  type: "increase" | "decrease",
): string => {
  const descriptions: {
    [key: string]: { increase: string; decrease: string };
  } = {
    stablecoin: {
      increase: "เพิ่มความมั่นคงของพอร์ตด้วยการถือครอง Stablecoins มากขึ้น",
      decrease: "ลดการถือครอง Stablecoins เพื่อเพิ่มผลตอบแทน",
    },
    bigcap: {
      increase:
        "เพิ่มการลงทุนในสินทรัพย์ที่มีมูลค่าตลาดสูงซึ่งมีความผันผวนน้อยกว่า",
      decrease: "ลดการถือครอง Big Cap เพื่อเพิ่มความเสี่ยงและผลตอบแทน",
    },
    meme: {
      increase: "เพิ่มการลงทุนใน Meme tokens เพื่อโอกาสในการเติบโตสูง",
      decrease: "ลดความเสี่ยงจาก Meme tokens ที่มีความผันผวนสูง",
    },
    defi: {
      increase: "เพิ่มการลงทุนใน DeFi protocols เพื่อผลตอบแทนที่สูงขึ้น",
      decrease: "ลดการลงทุนใน DeFi เพื่อลดความเสี่ยงจากความผันผวน",
    },
    l1: {
      increase:
        "เพิ่มการลงทุนใน Layer 1 protocols เพื่อรองรับการเติบโตของ ecosystem",
      decrease: "ลดการถือครอง Layer 1 เพื่อปรับสมดุลพอร์ต",
    },
    ai: {
      increase:
        "เพิ่มการลงทุนใน AI tokens เพื่อโอกาสในการเติบโตจากเทคโนโลยี AI",
      decrease: "ลดการลงทุนใน AI tokens เพื่อลดความเสี่ยงจากความผันผวน",
    },
    rwa: {
      increase:
        "เพิ่มการลงทุนใน Real World Assets เพื่อความมั่นคงและการกระจายความเสี่ยง",
      decrease:
        "ลดการถือครอง RWA เพื่อเพิ่มการลงทุนในสินทรัพย์ที่เติบโตเร็วกว่า",
    },
  };

  return descriptions[change.category]?.[type] || "";
};

const AIChat = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<any>(null);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [conversationContext, setConversationContext] =
    useState<ConversationContext>({
      currentTopic: "",
      topicHistory: [],
      unansweredQuestions: [],
      userEmotionalState: "neutral",
      lastActionTaken: null,
      conversationDepth: 0,
    });

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<"th-TH" | "en-US">(
    "en-US",
  );
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const [interimTranscript, setInterimTranscript] = useState("");
  const [useWhisperFallback, setUseWhisperFallback] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [speechSupported, setSpeechSupported] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const { allocations, pendingAllocations } = useBlockchain();

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = speechLanguage;

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.results.length - 1; i >= 0; i--) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript = transcript;
            } else {
              interimTranscript = transcript;
            }
          }

          setInterimTranscript(interimTranscript);

          if (finalTranscript) {
            setMessage(finalTranscript);
            setInterimTranscript("");
            setIsListening(false);

            toast({
              title: "🎤 Speech Recognized",
              description: `Captured: "${finalTranscript.substring(0, 50)}${finalTranscript.length > 50 ? "..." : ""}"`,
            });
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Web Speech API error:", event.error);

          // If Web Speech API fails and we have Whisper configured, use it as fallback
          if (import.meta.env.VITE_OPENAI_API_KEY && !useWhisperFallback) {
            toast({
              title: "Switching to Enhanced Recognition",
              description:
                "Using OpenAI Whisper for better Thai language support",
            });
            setIsListening(false);
            setTimeout(() => {
              setUseWhisperFallback(true);
              startWhisperRecording();
            }, 500);
          } else {
            setIsListening(false);
            toast({
              title: "Speech Recognition Error",
              description:
                event.error === "no-speech"
                  ? "No speech detected. Please try again."
                  : "Unable to process speech. Please try typing instead.",
              variant: "destructive",
            });
          }
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
        setSpeechSupported(true);
      } else {
        // If Web Speech API is not supported, default to Whisper if available
        if (import.meta.env.VITE_OPENAI_API_KEY) {
          setUseWhisperFallback(true);
          setSpeechSupported(true);
        } else {
          setSpeechSupported(false);
        }
      }
    }
  }, [speechLanguage]);

  // Enhanced NLP functions
  const analyzeSentiment = (
    text: string,
  ): "positive" | "negative" | "neutral" | "excited" | "concerned" => {
    const positiveWords = [
      "great",
      "excellent",
      "amazing",
      "love",
      "perfect",
      "fantastic",
      "awesome",
      "brilliant",
      "good",
      "nice",
      "happy",
      "excited",
      "bullish",
      "moon",
      "pump",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "hate",
      "horrible",
      "worst",
      "disgusting",
      "sad",
      "worried",
      "concerned",
      "bearish",
      "dump",
      "crash",
      "loss",
      "risk",
    ];
    const excitedWords = [
      "wow",
      "amazing",
      "incredible",
      "to the moon",
      "🚀",
      "pump",
      "moon",
      "lambo",
      "diamond hands",
    ];
    const concernedWords = [
      "worried",
      "concerned",
      "scared",
      "risk",
      "loss",
      "crash",
      "dump",
      "bear market",
      "recession",
    ];

    const lowerText = text.toLowerCase();

    if (excitedWords.some((word) => lowerText.includes(word))) return "excited";
    if (concernedWords.some((word) => lowerText.includes(word)))
      return "concerned";

    const positiveCount = positiveWords.filter((word) =>
      lowerText.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowerText.includes(word),
    ).length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  };

  const detectIntent = (text: string): string => {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("what") ||
      lowerText.includes("how") ||
      lowerText.includes("why") ||
      lowerText.includes("explain") ||
      lowerText.includes("อะไร") ||
      lowerText.includes("ยังไง") ||
      lowerText.includes("ทำไม") ||
      lowerText.includes("อธิบาย")
    ) {
      return "informational";
    }
    if (
      lowerText.includes("should i") ||
      lowerText.includes("recommend") ||
      lowerText.includes("suggest") ||
      lowerText.includes("advice") ||
      lowerText.includes("ควร") ||
      lowerText.includes("แนะนำ") ||
      lowerText.includes("คำแนะนำ") ||
      lowerText.includes("ช่วย")
    ) {
      return "actionable";
    }
    if (
      lowerText.includes("price") ||
      lowerText.includes("market") ||
      lowerText.includes("analysis") ||
      lowerText.includes("ราคา") ||
      lowerText.includes("ตลาด") ||
      lowerText.includes("วิเคราะห์")
    ) {
      return "market_analysis";
    }
    if (
      lowerText.includes("portfolio") ||
      lowerText.includes("allocation") ||
      lowerText.includes("rebalance") ||
      lowerText.includes("ปรับ") ||
      lowerText.includes("จัดสรร") ||
      lowerText.includes("เปลี่ยน") ||
      lowerText.includes("แก้") ||
      lowerText.includes("optimize") ||
      lowerText.includes("โปรฟ") ||
      lowerText.includes("ลงทุน") ||
      lowerText.includes("ปอร์ต")
    ) {
      return "portfolio_management";
    }
    if (
      lowerText.includes("hi") ||
      lowerText.includes("hello") ||
      lowerText.includes("hey") ||
      lowerText.includes("สวัสดี") ||
      lowerText.includes("หวัดดี") ||
      lowerText.includes("ฮาย")
    ) {
      return "greeting";
    }

    return "general";
  };

  // Enhanced function to detect portfolio adjustment requests in Thai/English
  const detectPortfolioAdjustmentRequest = (text: string): boolean => {
    const lowerText = text.toLowerCase();

    const englishKeywords = [
      "adjust portfolio",
      "rebalance",
      "change allocation",
      "optimize portfolio",
      "portfolio suggestion",
      "investment advice",
      "adjust allocation",
      "modify portfolio",
      "portfolio recommendation",
      "investment recommendation",
      "should i change",
      "how to adjust",
      "optimize investment",
      "portfolio strategy",
    ];

    const thaiKeywords = [
      "ปรับพอร์ต",
      "ปรับโปรตโฟลิโอ",
      "เปลี่ยนการลงทุน",
      "จัดสรรใหม่",
      "แนะนำการลงทุน",
      "คำแนะนำพอร์ต",
      "ปรับการจัดสรร",
      "แก้ไขพอร์ต",
      "แนะนำโปรตโฟลิโอ",
      "ควรปรับ",
      "ช่วยปรับ",
      "ให้คำแนะนำ",
      "วิธีปรับ",
      "กลยุทธ์การลงทุน",
      "ปรับสัดส่วน",
      "เปลี่ยนสัดส่วน",
    ];

    return (
      englishKeywords.some((keyword) => lowerText.includes(keyword)) ||
      thaiKeywords.some((keyword) => lowerText.includes(keyword))
    );
  };

  const generatePersonalizedResponse = (
    userMessage: string,
    sentiment: string,
    intent: string,
    profile: UserProfile | null,
  ): string => {
    const communicationStyle = profile?.communicationStyle || "friendly";
    const riskTolerance = profile?.riskTolerance || "moderate";

    let responsePrefix = "";
    let tonalAdjustment = "";

    // Adjust response based on communication style
    switch (communicationStyle) {
      case "formal":
        responsePrefix = "Based on my analysis, ";
        break;
      case "technical":
        responsePrefix =
          "According to technical indicators and on-chain metrics, ";
        break;
      default:
        responsePrefix =
          sentiment === "excited"
            ? "🚀 I can see you're excited! "
            : sentiment === "concerned"
              ? "😌 I understand your concerns. "
              : "";
    }

    // Adjust based on risk tolerance
    switch (riskTolerance) {
      case "conservative":
        tonalAdjustment =
          " I recommend focusing on stable, well-established assets with lower volatility.";
        break;
      case "aggressive":
        tonalAdjustment =
          " Given your risk appetite, you might consider more growth-oriented opportunities.";
        break;
      default:
        tonalAdjustment =
          " Let's find a balanced approach that matches your investment strategy.";
    }

    return responsePrefix + tonalAdjustment;
  };

  const updateConversationContext = (userMessage: string, intent: string) => {
    setConversationContext((prev) => {
      const newContext = { ...prev };

      // Update current topic based on intent
      if (intent === "market_analysis") newContext.currentTopic = "market";
      else if (intent === "portfolio_management")
        newContext.currentTopic = "portfolio";
      else if (intent === "informational") newContext.currentTopic = "learning";

      // Add to topic history if it's a new topic
      if (
        newContext.currentTopic !== prev.currentTopic &&
        newContext.currentTopic
      ) {
        newContext.topicHistory = [
          ...prev.topicHistory.slice(-4),
          newContext.currentTopic,
        ];
      }

      // Increment conversation depth
      newContext.conversationDepth = prev.conversationDepth + 1;

      return newContext;
    });
  };

  // Load all data from localStorage on component mount
  useEffect(() => {
    // Load chat messages
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);

    // Load user profile
    const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile, (key, value) => {
          if (key === "lastActiveSession") return new Date(value);
          return value;
        });
        setUserProfile(profile);
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }

    // Load conversation context
    const savedContext = localStorage.getItem(CONVERSATION_CONTEXT_KEY);
    if (savedContext) {
      try {
        setConversationContext(JSON.parse(savedContext));
      } catch (error) {
        console.error("Error loading conversation context:", error);
      }
    }

    if (savedMessages) {
      try {
        // Parse the saved messages and convert timestamp strings back to Date objects
        const parsedMessages = JSON.parse(savedMessages, (key, value) => {
          if (key === "timestamp") return new Date(value);
          return value;
        });

        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error loading chat messages from localStorage:", error);
        // If there's an error, initialize with the default welcome message
        initializeDefaultMessage();
      }
    } else {
      // If no saved messages, initialize with the default welcome message
      initializeDefaultMessage();
    }
  }, []);

  // Initialize with default welcome message
  const initializeDefaultMessage = () => {
    setMessages([
      {
        id: "1",
        sender: "ai",
        content:
          "Hello! I'm your MonoFi-AI assistant. I can help you manage your portfolio, provide market insights, and suggest optimal allocations. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
  };

  // Save messages and conversation context to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(
      CONVERSATION_CONTEXT_KEY,
      JSON.stringify(conversationContext),
    );
  }, [conversationContext]);

  // Auto-send an AI insight after component mount if there are no messages
  useEffect(() => {
    if (messages.length <= 1) {
      const timer = setTimeout(() => {
        const randomInsight =
          marketInsights[Math.floor(Math.random() * marketInsights.length)];
        triggerAIInsight(randomInsight);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if Gemini API is available
  useEffect(() => {
    const checkGeminiAvailability = async () => {
      try {
        const available = await isGeminiAvailable();
        setIsGeminiEnabled(available);
      } catch (error) {
        console.error("Error checking Gemini availability:", error);
        setIsGeminiEnabled(false);
      }
    };

    checkGeminiAvailability();
  }, []);

  // Helper function to adapt AI suggestions to current portfolio allocations
  const adaptSuggestionToCurrentAllocations = useCallback(
    (suggestion: any) => {
      if (!suggestion.action?.changes || !allocations.length) return suggestion;

      const currentAllocationMap = Object.fromEntries(
        allocations.map((a) => [a.id, a.allocation]),
      );

      // Create a deep copy of the suggestion
      const adaptedSuggestion = JSON.parse(JSON.stringify(suggestion));

      // Adapt the changes to current allocations
      adaptedSuggestion.action.changes = adaptedSuggestion.action.changes.map(
        (change: any) => {
          const currentValue =
            currentAllocationMap[change.category] || change.from;
          const difference = change.to - change.from; // Original intended change

          return {
            ...change,
            from: currentValue,
            to: Math.max(0, Math.min(100, currentValue + difference)), // Ensure values are between 0-100
          };
        },
      );

      return adaptedSuggestion;
    },
    [allocations],
  );

  const triggerAIInsight = (insight: any) => {
    setIsTyping(true);

    // Adapt the insight to current allocations
    const adaptedInsight = adaptSuggestionToCurrentAllocations(insight);

    // Generate personalized insight based on user profile
    const personalizedInsight = userProfile
      ? getPersonalizedInsight(adaptedInsight, userProfile)
      : adaptedInsight;

    // Simulate AI working on analysis
    setTimeout(() => {
      // Format the content with enhanced readability for portfolio suggestions
      const formattedContent = personalizedInsight.action?.changes
        ? formatPortfolioSuggestion(
            personalizedInsight.action,
            personalizedInsight.content,
          )
        : personalizedInsight.content;

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "ai",
        content: formattedContent,
        timestamp: new Date(),
        sentiment: "positive",
        intent: "proactive_insight",
        context: {
          topicContinuation: false,
          questionType: "informational",
        },
        action: personalizedInsight.action
          ? {
              ...personalizedInsight.action,
              confidence: 0.8,
              priority: personalizedInsight.urgency || "medium",
            }
          : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);

      // Add follow-up question to encourage engagement
      setTimeout(() => {
        const followUpQuestion = generateFollowUpQuestion(
          personalizedInsight,
          userProfile,
        );
        if (followUpQuestion) {
          const followUpMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            content: followUpQuestion,
            timestamp: new Date(),
            sentiment: "positive",
            intent: "engagement",
            context: {
              topicContinuation: true,
              questionType: "exploratory",
            },
          };
          setMessages((prev) => [...prev, followUpMessage]);
        }
      }, 2000);

      // Show toast notification
      toast({
        title: "New AI Market Intelligence",
        description: "Portfolio analysis has discovered a new opportunity",
      });
    }, 1000);
  };

  const getPersonalizedInsight = (insight: any, profile: UserProfile) => {
    const { riskTolerance, tradingExperience, communicationStyle } = profile;

    let personalizedContent = insight.content;
    let urgency = "medium";

    // Adjust for risk tolerance
    if (riskTolerance === "conservative" && insight.type === "meme") {
      personalizedContent = `⚠️ **Conservative Portfolio Alert**\n\nWhile ${personalizedContent.split(".")[0]}, I understand your preference for stability. Consider a smaller position (1-2%) if you're interested, or focus on more established assets.`;
      urgency = "low";
    } else if (riskTolerance === "aggressive" && insight.type === "bigcap") {
      personalizedContent = `🚀 **Growth Opportunity**\n\n${personalizedContent} Given your aggressive investment strategy, this could be an excellent opportunity to increase exposure.`;
      urgency = "high";
    }

    // Adjust for experience level
    if (tradingExperience === "beginner") {
      personalizedContent += `\n\n💡 **Beginner Tip**: Remember to never invest more than you can afford to lose, and consider dollar-cost averaging for reduced volatility.`;
    } else if (tradingExperience === "expert") {
      personalizedContent += `\n\n📈 **Advanced Analysis**: Consider technical indicators, on-chain metrics, and correlation with traditional markets before making allocation changes.`;
    }

    return {
      ...insight,
      content: personalizedContent,
      urgency,
    };
  };

  // OpenAI Whisper transcription function
  const transcribeWithWhisper = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model", "whisper-1");
      formData.append("language", speechLanguage === "th-TH" ? "th" : "en");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error("Whisper transcription error:", error);
      throw error;
    }
  };

  // Start recording with MediaRecorder for Whisper
  const startWhisperRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });

        try {
          setInterimTranscript("🤖 Transcribing with AI...");
          const transcript = await transcribeWithWhisper(audioBlob);
          setMessage(transcript);
          setInterimTranscript("");
          setIsListening(false);

          toast({
            title: "AI Transcription Complete",
            description: "Successfully transcribed using OpenAI Whisper",
          });
        } catch (error) {
          setInterimTranscript("");
          setIsListening(false);
          toast({
            title: "Transcription Failed",
            description: "Please try typing your message instead",
            variant: "destructive",
          });
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      setAudioRecorder(mediaRecorder);
      mediaRecorder.start();
      setIsListening(true);

      toast({
        title: "🎤 Enhanced Recognition Active",
        description: `Listening in ${speechLanguage === "th-TH" ? "Thai" : "English"} using AI`,
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice input",
        variant: "destructive",
      });
    }
  };

  const generateFollowUpQuestion = (
    insight: any,
    profile: UserProfile | null,
  ): string | null => {
    const questions = [
      "What are your thoughts on this market opportunity?",
      "Would you like me to analyze any specific aspects of this suggestion?",
      "How does this align with your current investment strategy?",
      "Are there any concerns you'd like me to address about this recommendation?",
      "Would you like to see how this change would affect your overall portfolio risk?",
      "Should I monitor this situation and provide updates as it develops?",
      "Would you like me to explain the technical analysis behind this recommendation?",
      "How comfortable are you with this level of portfolio adjustment?",
      "Would you like to see alternative strategies with different risk profiles?",
      "Are there any other market sectors you're particularly interested in right now?",
    ];

    // Select question based on user profile and insight type
    if (profile?.tradingExperience === "beginner") {
      return questions[Math.floor(Math.random() * 3)]; // Simpler questions
    } else if (profile?.tradingExperience === "expert") {
      return questions[6 + Math.floor(Math.random() * 4)]; // More technical questions
    }

    return questions[Math.floor(Math.random() * questions.length)];
  };

  // Speech control functions
  const startListening = () => {
    if (useWhisperFallback || !recognition) {
      startWhisperRecording();
    } else {
      try {
        recognition.lang = speechLanguage;
        recognition.start();
        setIsListening(true);
        setInterimTranscript("");

        toast({
          title: `🎤 Listening in ${speechLanguage === "th-TH" ? "Thai" : "English"}`,
          description: "Speak clearly into your microphone",
        });
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast({
          title: "Speech Recognition Error",
          description: "Unable to start listening. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopListening = () => {
    if (audioRecorder && audioRecorder.state === "recording") {
      audioRecorder.stop();
    } else if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    setInterimTranscript("");
  };

  const toggleLanguage = () => {
    if (isListening) {
      stopListening();
    }

    const newLang = speechLanguage === "en-US" ? "th-TH" : "en-US";
    setSpeechLanguage(newLang);

    toast({
      title: "Language Changed",
      description: `Speech recognition set to ${newLang === "en-US" ? "English" : "Thai"}`,
    });
  };

  const resetToWebSpeech = () => {
    setUseWhisperFallback(false);
    toast({
      title: "Recognition Mode Reset",
      description: "Switched back to browser speech recognition",
    });
  };

  // Function to get a random rule-based response when Gemini fails
  const getRandomRuleBasedResponse = (userMessage: string) => {
    // Analyze the user message for keywords to provide more relevant responses
    const lowerCaseMsg = userMessage.toLowerCase();

    // Check for specific topics in the user message
    if (lowerCaseMsg.includes("bitcoin") || lowerCaseMsg.includes("btc")) {
      return (
        marketInsights.find((insight) => insight.type === "bigcap") ||
        marketInsights[8]
      );
    } else if (
      lowerCaseMsg.includes("ai") ||
      lowerCaseMsg.includes("artificial intelligence")
    ) {
      return (
        marketInsights.find((insight) => insight.type === "innovation") ||
        marketInsights[14]
      );
    } else if (
      lowerCaseMsg.includes("defi") ||
      lowerCaseMsg.includes("yield")
    ) {
      return (
        marketInsights.find((insight) => insight.type === "yield") ||
        marketInsights[5]
      );
    } else if (lowerCaseMsg.includes("risk") || lowerCaseMsg.includes("safe")) {
      return (
        marketInsights.find((insight) => insight.type === "security") ||
        marketInsights[11]
      );
    } else if (lowerCaseMsg.includes("meme") || lowerCaseMsg.includes("nft")) {
      return (
        marketInsights.find((insight) => insight.type === "risk") ||
        marketInsights[4]
      );
    } else if (
      lowerCaseMsg.includes("layer 1") ||
      lowerCaseMsg.includes("l1") ||
      lowerCaseMsg.includes("blockchain")
    ) {
      return (
        marketInsights.find((insight) => insight.type === "layer1") ||
        marketInsights[6]
      );
    } else if (
      lowerCaseMsg.includes("stable") ||
      lowerCaseMsg.includes("usdt") ||
      lowerCaseMsg.includes("usdc")
    ) {
      return (
        marketInsights.find((insight) => insight.type === "stablecoin") ||
        marketInsights[9]
      );
    } else if (
      lowerCaseMsg.includes("rwa") ||
      lowerCaseMsg.includes("real world")
    ) {
      return (
        marketInsights.find((insight) => insight.type === "rwa") ||
        marketInsights[7]
      );
    } else if (
      lowerCaseMsg.includes("rebalance") ||
      lowerCaseMsg.includes("portfolio")
    ) {
      return (
        marketInsights.find((insight) => insight.type === "balanced") ||
        marketInsights[10]
      );
    } else if (
      lowerCaseMsg.includes("regulation") ||
      lowerCaseMsg.includes("compliance")
    ) {
      return (
        marketInsights.find((insight) => insight.type === "regulatory") ||
        marketInsights[12]
      );
    }

    // If no specific topic is detected, return a random insight
    return marketInsights[Math.floor(Math.random() * marketInsights.length)];
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Analyze user message
    const sentiment = analyzeSentiment(message);
    const intent = detectIntent(message);

    // Update conversation context
    updateConversationContext(message, intent);

    // Update user profile based on interaction
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        totalInteractions: userProfile.totalInteractions + 1,
        lastActiveSession: new Date(),
        favoriteTopics: [
          ...new Set([...userProfile.favoriteTopics, intent]),
        ].slice(-10), // Keep last 10 topics
      };
      setUserProfile(updatedProfile);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
    } else {
      // Create initial user profile
      const initialProfile: UserProfile = {
        riskTolerance: "moderate",
        tradingExperience: "intermediate",
        preferredCategories: [],
        communicationStyle: "friendly",
        investmentGoals: [],
        lastActiveSession: new Date(),
        totalInteractions: 1,
        favoriteTopics: [intent],
      };
      setUserProfile(initialProfile);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(initialProfile));
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: message,
      timestamp: new Date(),
      sentiment,
      intent,
      context: {
        topicContinuation: conversationContext.currentTopic === intent,
        questionType:
          intent === "informational"
            ? "informational"
            : intent === "actionable"
              ? "actionable"
              : "exploratory",
        userMood: sentiment,
      },
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Check if the message is asking about a specific token price
    const tokenPriceMatch = message
      .toLowerCase()
      .match(
        /price\s+of\s+([a-z0-9]+)|([a-z0-9]+)\s+price|about\s+([a-z0-9]+)/i,
      );
    const tokenSymbol = tokenPriceMatch
      ? (
          tokenPriceMatch[1] ||
          tokenPriceMatch[2] ||
          tokenPriceMatch[3]
        ).toUpperCase()
      : null;

    // If asking about a specific token and Gemini is enabled
    if (tokenSymbol && isGeminiEnabled) {
      try {
        // Fetch token insights
        const insights = await fetchTokenInsights(tokenSymbol);

        // Check if the response is an error message
        const isErrorResponse = insights.startsWith(
          "Unable to retrieve token insights",
        );

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: insights,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);

        // If we got an error response, also show a toast
        if (isErrorResponse) {
          toast({
            title: "Gemini API Issue",
            description:
              "There was a problem with the Gemini API. Using fallback responses.",
          });
        }

        return;
      } catch (error) {
        console.error("Error fetching token insights:", error);
        // Fall back to pattern matching if API call fails
      }
    }

    // Try using Gemini for general chat responses
    if (isGeminiEnabled) {
      try {
        // Get last 5 messages for context with enhanced metadata
        const recentMessages = messages.slice(-5).map((msg) => ({
          sender: msg.sender,
          content: msg.content,
          sentiment: msg.sentiment,
          intent: msg.intent,
        }));

        // Generate personalized response prefix
        const personalizedPrefix = generatePersonalizedResponse(
          userMessage.content,
          sentiment,
          intent,
          userProfile,
        );

        // Generate response using Gemini
        const { content, action } = await generateChatResponse(
          userMessage.content,
          recentMessages,
        );

        // Enhance the response with personalization
        let enhancedContent = personalizedPrefix + content;

        // Check if user is asking for portfolio adjustments in Thai/English
        const isPortfolioRequest = detectPortfolioAdjustmentRequest(
          userMessage.content,
        );

        // If action contains changes, adapt them to current allocations
        let adaptedAction = action;
        if (action?.changes) {
          adaptedAction = {
            ...action,
            changes: action.changes.map((change: any) => {
              const currentAllocation = allocations.find(
                (a) => a.id === change.category,
              );
              const currentValue = currentAllocation
                ? currentAllocation.allocation
                : change.from;
              const difference = change.to - change.from; // Original intended change

              return {
                ...change,
                from: currentValue,
                to: Math.max(0, Math.min(100, currentValue + difference)), // Ensure values are between 0-100
              };
            }),
          };
        }

        // If no action was provided but user requested portfolio adjustment, create a generic one
        if (isPortfolioRequest && !adaptedAction) {
          adaptedAction = {
            type: "rebalance",
            reason:
              speechLanguage === "th-TH"
                ? "ปรับสัดส่วนการลงทุนตามคำแนะนำของ AI"
                : "AI-recommended portfolio rebalancing",
            changes: [], // Will show adjustment modal for user to explore
            confidence: 0.7,
            priority: "medium",
          };
        }

        // Format the content with enhanced readability for portfolio suggestions
        const finalContent = adaptedAction?.changes
          ? formatPortfolioSuggestion(adaptedAction, enhancedContent)
          : enhancedContent;

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: finalContent,
          timestamp: new Date(),
          sentiment: "positive", // AI responses are generally positive
          intent: "assistance",
          context: {
            topicContinuation: true,
            questionType: userMessage.context?.questionType || "informational",
          },
          action: adaptedAction
            ? {
                ...adaptedAction,
                confidence: 0.85, // High confidence for Gemini responses
                priority: sentiment === "concerned" ? "high" : "medium",
              }
            : undefined,
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
        return;
      } catch (error) {
        console.error("Error generating chat response with Gemini:", error);

        // Show a toast notification about the API issue
        toast({
          title: "Gemini API Issue",
          description:
            error instanceof Error
              ? error.message
              : "There was a problem with the Gemini API. Using fallback responses.",
          variant: "destructive",
        });

        // Fall back to rule-based responses
        const ruleBasedResponse = getRandomRuleBasedResponse(message);
        const adaptedResponse =
          adaptSuggestionToCurrentAllocations(ruleBasedResponse);

        setTimeout(() => {
          // Format the content with enhanced readability for portfolio suggestions
          const baseContent = `Based on your query, I've analyzed the current market conditions:\n\n${adaptedResponse.content}`;
          const formattedContent = adaptedResponse.action?.changes
            ? formatPortfolioSuggestion(adaptedResponse.action, baseContent)
            : baseContent;

          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            content: formattedContent,
            timestamp: new Date(),
            action: adaptedResponse.action,
          };

          setMessages((prev) => [...prev, aiResponse]);
          setIsTyping(false);
        }, 1500);

        return;
      }
    }

    // Fallback to rule-based responses if Gemini is not enabled
    setTimeout(() => {
      const isPortfolioRequest = detectPortfolioAdjustmentRequest(message);
      let ruleBasedResponse = getRandomRuleBasedResponse(message);

      // If it's a portfolio adjustment request, enhance the response
      if (isPortfolioRequest) {
        const adjustmentText =
          speechLanguage === "th-TH"
            ? '\n\n💡 **คำแนะนำ**: คลิกปุ่ม "ปรับพอร์ตโฟลิโอ" ด้านล่างเพื่อดูตัวเลือกการปรับสัดส่วนการลงทุน'
            : '\n\n💡 **Suggestion**: Click the "Adjust Portfolio" button below to explore adjustment options';

        ruleBasedResponse = {
          ...ruleBasedResponse,
          content: ruleBasedResponse.content + adjustmentText,
          action: {
            type: "rebalance",
            description:
              speechLanguage === "th-TH"
                ? "ปรับพอร์ตโฟลิโอ"
                : "Adjust Portfolio",
            changes: [],
          },
        };
      }

      const adaptedResponse =
        adaptSuggestionToCurrentAllocations(ruleBasedResponse);

      // Format the content with enhanced readability for portfolio suggestions
      const baseContent = `Based on your query, I've analyzed the current market conditions:\n\n${adaptedResponse.content}`;
      const formattedContent = adaptedResponse.action?.changes
        ? formatPortfolioSuggestion(adaptedResponse.action, baseContent)
        : baseContent;

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: formattedContent,
        timestamp: new Date(),
        action: adaptedResponse.action,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleActionClick = async (action: any) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to apply portfolio changes.",
      });
      return;
    }

    if (action.changes) {
      // If the action has changes, we need to prepare them for the modal
      // First, get the current allocations from the blockchain context
      const currentAllocations = pendingAllocations || allocations;

      // Create a deep copy to avoid reference issues
      const currentAllocationsCopy = JSON.parse(
        JSON.stringify(currentAllocations),
      );

      // For each change in the action, update the 'from' value to match current allocation
      const updatedChanges = action.changes.map((change: any) => {
        const currentAllocation = currentAllocationsCopy.find(
          (a: any) => a.id === change.category,
        );
        return {
          ...change,
          from: currentAllocation ? currentAllocation.allocation : change.from,
        };
      });

      // Create an updated action with the correct 'from' values
      const updatedAction = {
        ...action,
        changes: updatedChanges,
      };

      console.log("Setting current action for modal:", updatedAction);

      // Set the current action and open the modal
      setCurrentAction(updatedAction);
      setAdjustmentOpen(true);
    } else if (action.type === "analysis") {
      toast({
        title: "Analysis in Progress",
        description: "Generating detailed market analysis...",
      });

      // If it's a market analysis action, send another insight after a delay
      setTimeout(() => {
        const randomInsight =
          marketInsights[Math.floor(Math.random() * marketInsights.length)];
        const adaptedInsight =
          adaptSuggestionToCurrentAllocations(randomInsight);
        triggerAIInsight(adaptedInsight);
      }, 4000);
    } else {
      toast({
        title: "Action Triggered",
        description: action.description,
      });
    }
  };

  return (
    <>
      <Card className="card-glass overflow-hidden">
        <CardHeader>
          <div className="flex items-center">
            <CardTitle className="text-2xl flex items-center">
              <GfVx5PnDyJLottie width={32} height={32} className="mr-2" />
              MonoFi-AI Assistant
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] ${msg.sender === "user" ? "bg-nebula-800" : "bg-cosmic-700"} rounded-2xl p-4 border border-yellow-500/30`}>
                    <div className="flex items-center mb-2">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          msg.sender === "user"
                            ? "bg-nebula-600"
                            : "bg-gradient-nebula"
                        }`}>
                        {msg.sender === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className="ml-2 flex flex-col">
                        <span className="font-medium">
                          {msg.sender === "user"
                            ? "You"
                            : "MonoFi-AI Assistant"}
                        </span>
                        {msg.sender === "ai" && msg.sentiment && (
                          <span className="text-xs text-muted-foreground">
                            {msg.sentiment === "positive"
                              ? "😊 Optimistic"
                              : msg.sentiment === "concerned"
                                ? "🤔 Analytical"
                                : msg.sentiment === "excited"
                                  ? "🚀 Excited"
                                  : "🤖 Neutral"}
                          </span>
                        )}
                      </div>
                      <div className="ml-auto flex flex-col items-end">
                        <span className="text-xs text-muted-foreground font-roboto-mono">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.action?.confidence && (
                          <span className="text-xs text-yellow-400">
                            {Math.round(msg.action.confidence * 100)}%
                            confidence
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 hover:from-yellow-400/20 hover:to-amber-500/20 border-yellow-400/30 hover:border-yellow-400/50 text-yellow-100 hover:text-yellow-50 transition-all duration-200 text-xs"
                        onClick={() => handleActionClick(msg.action)}>
                        {msg.action.type === "rebalance" ? (
                          <BarChart2 className="mr-1 h-3 w-3" />
                        ) : msg.action.type === "analysis" ? (
                          <Search className="mr-1 h-3 w-3" />
                        ) : msg.action.type === "trade" ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : msg.action.type === "protection" ? (
                          <Shield className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowRight className="mr-1 h-3 w-3" />
                        )}
                        {msg.action.description ||
                          (msg.action.type === "rebalance" &&
                          speechLanguage === "th-TH"
                            ? "ปรับพอร์ตโฟลิโอ"
                            : "Adjust Portfolio") ||
                          (msg.action.type === "analysis" &&
                          speechLanguage === "th-TH"
                            ? "วิเคราะห์ตลาด"
                            : "Market Analysis") ||
                          (msg.action.type === "trade" &&
                          speechLanguage === "th-TH"
                            ? "ข้อเสนอการเทรด"
                            : "Trading Suggestion") ||
                          (msg.action.type === "protection" &&
                          speechLanguage === "th-TH"
                            ? "ป้องกันความเสี่ยง"
                            : "Risk Protection") ||
                          (speechLanguage === "th-TH"
                            ? "ดำเนินการ"
                            : "Take Action")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-cosmic-700 rounded-2xl p-4 max-w-[80%] border border-yellow-500/30">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-nebula flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <span className="ml-2 font-medium">
                        MonoFi-AI Assistant
                      </span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <div
                        className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}></div>
                      <div
                        className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t border-[#ffffff1a]">
          {/* Conversation Context Display */}
          {conversationContext.currentTopic && (
            <div className="mb-2 text-xs text-muted-foreground">
              💬 Currently discussing:{" "}
              <span className="text-yellow-400">
                {conversationContext.currentTopic}
              </span>
              {userProfile && (
                <span className="ml-4">
                  👤 {userProfile.communicationStyle} mode | 📊{" "}
                  {userProfile.riskTolerance} risk
                </span>
              )}
            </div>
          )}

          {/* Speech Recognition Status */}
          {isListening && (
            <div className="mb-2 flex items-center space-x-2 text-sm">
              <div className="flex items-center text-yellow-400">
                <div className="animate-pulse mr-2">🎤</div>
                <span>
                  {useWhisperFallback ? "AI Enhanced" : "Browser"} Recognition -{" "}
                  {speechLanguage === "en-US" ? "English" : "Thai"}
                </span>
              </div>
              {interimTranscript && (
                <span className="text-muted-foreground italic">
                  "
                  {interimTranscript.length > 50
                    ? interimTranscript.substring(0, 50) + "..."
                    : interimTranscript}
                  "
                </span>
              )}
            </div>
          )}

          {/* Speech Controls Bar */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Language Toggle */}
              {speechSupported && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  disabled={isListening}
                  className="text-xs text-muted-foreground hover:text-yellow-400 flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span>{speechLanguage === "en-US" ? "EN" : "TH"}</span>
                </Button>
              )}

              {/* Recognition Mode Indicator */}
              {speechSupported && (
                <div className="text-xs text-green-400 flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span>
                    {useWhisperFallback ? "AI Enhanced" : "Browser"} Speech
                  </span>
                </div>
              )}

              {/* Reset to Web Speech Button */}
              {useWhisperFallback && recognition && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToWebSpeech}
                  disabled={isListening}
                  className="text-xs text-blue-400 hover:text-blue-300">
                  Reset to Browser
                </Button>
              )}
            </div>

            {!speechSupported && (
              <div className="text-xs text-red-400">
                🚫 Speech not supported
              </div>
            )}
          </div>

          {/* Input Area with Speech Controls */}
          <div className="flex w-full space-x-2">
            <Input
              placeholder={
                isListening
                  ? `🎤 Listening in ${speechLanguage === "th-TH" ? "Thai" : "English"}...`
                  : conversationContext.currentTopic
                    ? `Continue discussing ${conversationContext.currentTopic}...`
                    : speechLanguage === "th-TH"
                      ? "พูดหรือพิมพ์คำถามเกี่ยวกับการลงทุน / Speak or type investment questions..."
                      : "Ask MonoFi-AI assistant about market trends, tokens, or portfolio advice..."
              }
              value={
                message +
                (interimTranscript && !isListening
                  ? ` ${interimTranscript}`
                  : "")
              }
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isListening && handleSendMessage()
              }
              className="input-dark"
              disabled={isListening}
            />

            {/* Speech Button */}
            {speechSupported && (
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={isListening ? stopListening : startListening}
                disabled={isTyping}
                className={`${isListening ? "animate-pulse" : ""} transition-all`}
                title={
                  isListening
                    ? "Stop listening"
                    : `Start listening in ${speechLanguage === "th-TH" ? "Thai" : "English"}`
                }>
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Send Button */}
            <Button
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              size="icon"
              onClick={handleSendMessage}
              disabled={isTyping || (!message.trim() && !isListening)}
              title="Send message">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AdjustmentModal
        open={adjustmentOpen}
        onOpenChange={setAdjustmentOpen}
        action={currentAction}
      />
    </>
  );
};

export default AIChat;
