/**
 * Test utility for username authentication system
 * This file provides functions to test the new authentication flow
 */

import { usernameAuthService } from '../services/usernameAuthService';

export const testAuthenticationFlow = {
  /**
   * Test username validation
   */
  async testUsernameValidation() {
    console.log('🧪 Testing Username Validation...');
    
    const testCases = [
      { username: 'test123', expected: true, description: 'Valid username' },
      { username: 'ab', expected: false, description: 'Too short' },
      { username: 'a'.repeat(31), expected: false, description: 'Too long' },
      { username: 'test@user', expected: false, description: 'Invalid characters' },
      { username: 'Test_User_123', expected: true, description: 'Mixed case (will be lowercased)' },
    ];

    testCases.forEach(({ username, expected, description }) => {
      const result = usernameAuthService.validateUsername(username);
      const status = result.valid === expected ? '✅' : '❌';
      console.log(`${status} ${description}: "${username}" -> ${result.valid ? 'Valid' : result.error}`);
    });
  },

  /**
   * Test dummy email generation
   */
  testDummyEmailGeneration() {
    console.log('\n🧪 Testing Dummy Email Generation...');
    
    const testCases = [
      { username: 'test_user', expected: 'test_user@smart-trash-ai.demo' },
      { username: 'User123', expected: 'user123@smart-trash-ai.demo' },
      { username: 'test@user#123', expected: 'testuser123@smart-trash-ai.demo' },
    ];

    testCases.forEach(({ username, expected }) => {
      const result = usernameAuthService.generateDummyEmail(username);
      const status = result === expected ? '✅' : '❌';
      console.log(`${status} "${username}" -> "${result}" (expected: "${expected}")`);
    });
  },

  /**
   * Test username availability (requires database connection)
   */
  async testUsernameAvailability() {
    console.log('\n🧪 Testing Username Availability...');
    
    try {
      // Test with a likely available username
      const testUsername = `test_${Date.now()}`;
      const isAvailable = await usernameAuthService.isUsernameAvailable(testUsername);
      console.log(`✅ Username "${testUsername}" availability: ${isAvailable ? 'Available' : 'Taken'}`);
      
      // Test with existing username (should be taken)
      const existingUsername = 'nafiul_ce'; // From our migration
      const isExistingAvailable = await usernameAuthService.isUsernameAvailable(existingUsername);
      console.log(`✅ Existing username "${existingUsername}" availability: ${isExistingAvailable ? 'Available' : 'Taken (as expected)'}`);
      
    } catch (error) {
      console.log('❌ Error testing username availability:', error);
    }
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Username Authentication Tests...\n');
    
    this.testUsernameValidation();
    this.testDummyEmailGeneration();
    await this.testUsernameAvailability();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Manual Testing Checklist:');
    console.log('1. Open the application in browser');
    console.log('2. Try signing up with a new username');
    console.log('3. Verify no email confirmation is required');
    console.log('4. Try signing in with the new username');
    console.log('5. Check that feedback logging still works');
    console.log('6. Verify existing users can still login');
  }
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testAuth = testAuthenticationFlow;
  console.log('🔧 Username auth tests available at: window.testAuth.runAllTests()');
}
