// Contract Configuration Test
// Run this in browser console to verify contract setup

console.log('🔧 Monad Blockchain Contract Configuration Test');
console.log('===============================================');

// Check environment variables
const portfolioAddress = import.meta.env.VITE_PORTFOLIO_CONTRACT_ADDRESS;
const usdcAddress = import.meta.env.VITE_USDC_CONTRACT_ADDRESS;
const coreRpc = import.meta.env.VITE_CORE_RPC_URL;
const chainId = import.meta.env.VITE_CORE_CHAIN_ID;

console.log('📋 Environment Variables:');
console.log('Portfolio Contract:', portfolioAddress);
console.log('USDC Contract:', usdcAddress);
console.log('Core RPC URL:', coreRpc);
console.log('Chain ID:', chainId);

// Validate addresses
const isValidAddress = (addr) => addr && addr !== '0x0000000000000000000000000000000000000000' && addr.length === 42;

console.log('✅ Validation Results:');
console.log('Portfolio Address Valid:', isValidAddress(portfolioAddress));
console.log('USDC Address Valid:', isValidAddress(usdcAddress));
console.log('RPC URL Valid:', !!coreRpc);
console.log('Chain ID Valid:', !!chainId);

// Test network connectivity
if (coreRpc) {
  fetch(coreRpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 1
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('🌐 Network Test Result:', data);
    const returnedChainId = parseInt(data.result, 16);
    console.log('Returned Chain ID:', returnedChainId);
    console.log('Expected Chain ID:', parseInt(chainId));
    console.log('Chain ID Match:', returnedChainId === parseInt(chainId));
  })
  .catch(err => console.log('❌ Network Test Failed:', err));
}
