// Test script for Monad DAO API
console.log('Testing Monad DAO API...');

import { getRecentWhaleTransactions, getCorePrice } from './src/lib/monadDAOService.js';

(async () => {
  try {
    console.log('Fetching Monad price...');
    const price = await getCorePrice();
    console.log('Monad price:', price);
    
    console.log('Fetching whale transactions...');
    const transactions = await getRecentWhaleTransactions(50000, 5, price);
    console.log('Whale transactions:', transactions);
    
    if (transactions.length > 0) {
      console.log('✅ Successfully fetched real whale transactions!');
    } else {
      console.log('⚠️ No whale transactions found');
    }
  } catch (error) {
    console.error('❌ Error testing Monad DAO API:', error);
  }
})();
