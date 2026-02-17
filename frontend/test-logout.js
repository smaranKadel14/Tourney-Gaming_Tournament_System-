// LOGOUT FUNCTIONALITY TEST - Run in Browser Console
console.log('🚪 TESTING LOGOUT FUNCTIONALITY\n');

// Step 1: Set up authentication first
console.log('🔐 Setting up test authentication...');
const testUser = {
  id: '1',
  fullName: 'Test Player',
  email: 'player@test.com',
  role: 'player'
};

localStorage.setItem('tourney_user', JSON.stringify(testUser));
localStorage.setItem('tourney_token', 'mock-token');

console.log('✅ Test auth set:', testUser);

// Step 2: Navigate to player page
setTimeout(() => {
  console.log('\n📍 Navigating to player page...');
  window.location.href = 'http://localhost:5173/player';
}, 2000);

// Step 3: Test logout after 4 seconds
setTimeout(() => {
  console.log('\n🧪 Now testing logout...');
  console.log('Click the LOGOUT button in the navbar or run testLogout()');
  
  window.testLogout = () => {
    console.log('🔓 Logging out...');
    
    // Clear auth data
    localStorage.removeItem('tourney_user');
    localStorage.removeItem('tourney_token');
    
    console.log('✅ Auth cleared');
    console.log('Current localStorage:');
    console.log('- tourney_user:', localStorage.getItem('tourney_user'));
    console.log('- tourney_token:', localStorage.getItem('tourney_token'));
    
    // Redirect to login
    window.location.href = 'http://localhost:5173/login';
  };
  
  console.log('\n🛠️ Available functions:');
  console.log('- testLogout() - Simulate logout');
  console.log('- Check localStorage manually');
}, 4000);

// Step 4: Verify logout state
setTimeout(() => {
  console.log('\n🔍 Final verification - check if auth is cleared');
  console.log('Should be redirected to login page automatically');
}, 6000);
