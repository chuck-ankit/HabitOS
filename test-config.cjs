require('dotenv').config();
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;

console.log('\n========================================');
console.log('🔍 HabitOS Google API Test Script');
console.log('========================================\n');

if (!CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID' || CLIENT_ID === '') {
  console.log('❌ ERROR: VITE_GOOGLE_CLIENT_ID is not configured!');
  console.log('\n📝 To fix:');
  console.log('   1. Create a .env file in the project root:');
  console.log('      echo VITE_GOOGLE_CLIENT_ID=your_client_id > .env');
  console.log('   2. Or set the environment variable:');
  console.log('      Windows: set VITE_GOOGLE_CLIENT_ID=your_id');
  console.log('      Mac/Linux: export VITE_GOOGLE_CLIENT_ID=your_id');
  console.log('   3. Get your Client ID from:');
  console.log('      https://console.cloud.google.com/apis/credentials\n');
  
  // Check if .env.example exists
  const examplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(examplePath)) {
    console.log('   📄 .env.example found. Copy it to .env and add your Client ID.\n');
  }
  
  process.exit(1);
}

console.log(`✅ Client ID found: ${CLIENT_ID.substring(0, 40)}...`);
console.log('\n⚠️  NOTE: Full OAuth testing requires a browser.');
console.log('   This script validates the configuration only.\n');

console.log('📋 Checking Google Client ID format...');

// Basic validation
const validClientIdPattern = /^\d+\-[a-z0-9]+\.apps\.googleusercontent\.com$/;

if (validClientIdPattern.test(CLIENT_ID)) {
  console.log('✅ Client ID format appears valid\n');
} else {
  console.log('⚠️  Client ID format may be incorrect.');
  console.log('   Expected format: XXXXXX-xxxxx.apps.googleusercontent.com\n');
}

console.log('📋 Checking required API endpoints...');

const https = require('https');

function checkEndpoint(url, name) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`   ✅ ${name} is accessible`);
        resolve(true);
      } else {
        console.log(`   ⚠️  ${name} returned status ${res.statusCode}`);
        resolve(false);
      }
    });
    req.on('error', () => {
      console.log(`   ❌ ${name} is not accessible`);
      resolve(false);
    });
    req.setTimeout(5000, () => {
      console.log(`   ❌ ${name} timed out`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runNetworkChecks() {
  await checkEndpoint('https://accounts.google.com', 'Google OAuth');
  await checkEndpoint('https://www.googleapis.com', 'Google Drive API');
  
  console.log('\n========================================');
  console.log('📋 Configuration Summary');
  console.log('========================================');
  console.log(`   Client ID: ${CLIENT_ID}`);
  console.log(`   Status: Ready for testing`);
  console.log('========================================\n');
  
  console.log('📝 Next Steps:');
  console.log('   1. Start the dev server: npm run dev');
  console.log('   2. Open http://localhost:5173/test-google-auth.html');
  console.log('   3. Complete the OAuth flow in the browser');
  console.log('   4. Check Settings page for cloud sync options\n');
  
  console.log('✅ Configuration validation complete!\n');
}

runNetworkChecks();
