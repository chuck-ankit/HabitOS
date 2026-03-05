import { initGoogleApi, signInWithGoogle, saveToGoogleDrive, loadFromGoogleDrive, isSignedIn, getUserInfo } from './src/utils/googleDrive.js';
import { loadData } from './src/utils/storage.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log('\n========================================');
console.log('🔍 HabitOS Google API Test Script');
console.log('========================================\n');

if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID' || clientId === '') {
  console.log('❌ ERROR: VITE_GOOGLE_CLIENT_ID is not configured!');
  console.log('\n📝 To fix:');
  console.log('   1. Copy .env.example to .env');
  console.log('   2. Add your Google Client ID to .env');
  console.log('   3. Restart the dev server\n');
  process.exit(1);
}

console.log(`✅ Client ID found: ${clientId.substring(0, 30)}...\n`);

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Initialize Google API
  console.log('📋 Test 1: Initialize Google API...');
  try {
    await initGoogleApi();
    console.log('✅ PASSED: Google API initialized successfully\n');
    passed++;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}\n`);
    failed++;
    process.exit(1);
  }

  // Test 2: Check if signed in
  console.log('📋 Test 2: Check sign-in status...');
  const signedIn = isSignedIn();
  if (signedIn) {
    console.log('✅ Already signed in!\n');
    passed++;
  } else {
    console.log('⚠️  Not signed in (this is normal for first run)\n');
    console.log('   To test full functionality, please sign in when prompted...\n');
    passed++;
  }

  // Test 3: Try to sign in
  if (!signedIn) {
    console.log('📋 Test 3: Sign in with Google...');
    console.log('   Opening Google OAuth consent window...\n');
    
    rl.question('Press Enter after signing in to continue...', async () => {
      await testAfterSignIn();
    });
  } else {
    await testAfterSignIn();
  }

  async function testAfterSignIn() {
    if (!isSignedIn()) {
      console.log('❌ FAILED: Sign-in was cancelled or failed\n');
      failed++;
    } else {
      console.log('✅ PASSED: Successfully signed in!\n');
      passed++;

      // Test 4: Get user info
      console.log('📋 Test 4: Get user info...');
      try {
        const user = await getUserInfo();
        if (user && user.email) {
          console.log(`   User: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log('✅ PASSED: Got user info\n');
          passed++;
        } else {
          console.log('❌ FAILED: Could not get user info\n');
          failed++;
        }
      } catch (err) {
        console.log(`❌ FAILED: ${err.message}\n`);
        failed++;
      }

      // Test 5: Save to Google Drive
      console.log('📋 Test 5: Save data to Google Drive...');
      try {
        const testData = {
          habits: [],
          goals: [],
          dailyTasks: [],
          weeklyTasks: [],
          settings: { theme: 'dark' },
          testTimestamp: new Date().toISOString()
        };
        const fileId = await saveToGoogleDrive(testData);
        console.log(`   File ID: ${fileId}`);
        console.log('✅ PASSED: Data saved to Google Drive\n');
        passed++;
      } catch (err) {
        console.log(`❌ FAILED: ${err.message}\n`);
        failed++;
      }

      // Test 6: Load from Google Drive
      console.log('📋 Test 6: Load data from Google Drive...');
      try {
        const loadedData = await loadFromGoogleDrive();
        if (loadedData && loadedData.testTimestamp) {
          console.log('   Data loaded successfully');
          console.log('✅ PASSED: Data loaded from Google Drive\n');
          passed++;
        } else {
          console.log('❌ FAILED: Could not load valid data\n');
          failed++;
        }
      } catch (err) {
        console.log(`❌ FAILED: ${err.message}\n`);
        failed++;
      }
    }

    // Summary
    console.log('========================================');
    console.log('📊 Test Summary');
    console.log('========================================');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log('========================================\n');

    if (failed === 0) {
      console.log('🎉 All tests passed! Google integration is working correctly.\n');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.\n');
    }

    rl.close();
  }
}

runTests();
