const AuthenticationManager = require('../services/priceAnalysis/auth/AuthenticationManager');
const dotenv = require('dotenv');

dotenv.config();

async function testAuthentication() {
  console.log('Starting authentication test...');
  
  try {
    const authManager = new AuthenticationManager();
    
    // Test Mercari authentication
    console.log('\nTesting Mercari authentication...');
    const mercariUsername = process.env.MERCARI_USERNAME;
    const mercariPassword = process.env.MERCARI_PASSWORD;
    
    if (!mercariUsername || !mercariPassword) {
      console.log('Skipping Mercari login test - credentials not found in .env');
    } else {
      try {
        const mercariSession = await authManager.loginToMercari(mercariUsername, mercariPassword);
        console.log('Mercari login successful');
        console.log('Session expires at:', new Date(mercariSession.expiresAt));
        
        // Validate session
        const isMercariValid = await authManager.validateSession('mercari');
        console.log('Mercari session valid:', isMercariValid);
      } catch (error) {
        console.error('Mercari login failed:', error.message);
      }
    }
    
    // Test Poshmark authentication
    console.log('\nTesting Poshmark authentication...');
    const poshmarkEmail = process.env.POSHMARK_EMAIL;
    const poshmarkPassword = process.env.POSHMARK_PASSWORD;
    
    if (!poshmarkEmail || !poshmarkPassword) {
      console.log('Skipping Poshmark login test - credentials not found in .env');
    } else {
      try {
        const poshmarkSession = await authManager.loginToPoshmark(poshmarkEmail, poshmarkPassword);
        console.log('Poshmark login successful');
        console.log('Session expires at:', new Date(poshmarkSession.expiresAt));
        
        // Validate session
        const isPoshmarkValid = await authManager.validateSession('poshmark');
        console.log('Poshmark session valid:', isPoshmarkValid);
      } catch (error) {
        console.error('Poshmark login failed:', error.message);
      }
    }
    
    console.log('\nAuthentication test completed!');
  } catch (error) {
    console.error('Error during authentication test:', error);
    throw error;
  }
}

// Run the test
testAuthentication().catch(console.error);
