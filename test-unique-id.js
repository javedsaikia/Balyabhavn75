// Test script to verify unique ID generation
const { registerWithSupabase } = require('./lib/auth');

async function testUniqueIdGeneration() {
  console.log('Testing unique ID generation...');
  
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    phone: '+91 9876543210',
    address: 'Test Address',
    batch: '2020-2024',
    department: 'Computer Science',
    yearOfPassing: '2024'
  };
  
  try {
    const result = await registerWithSupabase(testUser);
    
    if (result.success) {
      console.log('✅ User registration successful!');
      console.log('User ID:', result.user.id);
      console.log('Unique ID:', result.user.unique_id);
      console.log('Email:', result.user.email);
      console.log('Name:', result.user.name);
    } else {
      console.log('❌ Registration failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testUniqueIdGeneration();