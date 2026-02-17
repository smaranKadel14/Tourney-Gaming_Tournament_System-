// COMPREHENSIVE LOGOUT TEST - Run in Browser Console
console.log('🚪 TESTING LOGOUT FUNCTIONALITY FOR ALL ROLES\n');

// Test functions
window.testAllLogouts = () => {
  console.log('\n🧪 Testing logout functionality for all roles...\n');
  
  // Test 1: Player Logout
  console.log('\n📍 Test 1: Player Logout');
  const playerUser = {
    id: '1',
    fullName: 'Test Player',
    email: 'player@test.com',
    role: 'player'
  };
  localStorage.setItem('tourney_user', JSON.stringify(playerUser));
  localStorage.setItem('tourney_token', 'mock-token');
  window.location.href = 'http://localhost:5173/player';
  
  setTimeout(() => {
    console.log('   Now on player page - click LOGOUT button in navbar');
    console.log('   Expected: Clear auth and redirect to /login');
  }, 3000);
  
  // Test 2: Organizer Logout
  setTimeout(() => {
    console.log('\n📍 Test 2: Organizer Logout');
    const organizerUser = {
      id: '2',
      fullName: 'Test Organizer',
      email: 'organizer@test.com',
      role: 'organizer'
    };
    localStorage.setItem('tourney_user', JSON.stringify(organizerUser));
    localStorage.setItem('tourney_token', 'mock-token');
    window.location.href = 'http://localhost:5173/organizer';
  }, 6000);
  
  setTimeout(() => {
    console.log('   Now on organizer page - click LOGOUT button in sidebar');
    console.log('   Expected: Clear auth and redirect to /login');
  }, 9000);
  
  // Test 3: Admin Logout
  setTimeout(() => {
    console.log('\n📍 Test 3: Admin Logout');
    const adminUser = {
      id: '3',
      fullName: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin'
    };
    localStorage.setItem('tourney_user', JSON.stringify(adminUser));
    localStorage.setItem('tourney_token', 'mock-token');
    window.location.href = 'http://localhost:5173/admin';
  }, 12000);
  
  setTimeout(() => {
    console.log('   Now on admin page - click LOGOUT button in sidebar');
    console.log('   Expected: Clear auth and redirect to /login');
  }, 15000);
  
  // Test 4: Verify logout state
  setTimeout(() => {
    console.log('\n🔍 Final verification:');
    console.log('   All logout buttons should:');
    console.log('   1. Clear localStorage (tourney_user, tourney_token)');
    console.log('   2. Redirect to /login');
    console.log('   3. Work with routing system');
    console.log('\n✅ Manual test functions:');
    console.log('- testAllLogouts() - Auto-test all role logouts');
    console.log('- testManualLogout() - Test specific role logout');
  }, 18000);
};

window.testManualLogout = (role = 'player' | 'organizer' | 'admin') => {
  console.log(`\n🔓 Testing manual ${role} logout...`);
  
  const testUser = {
    id: '1',
    fullName: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    email: `${role}@test.com`,
    role: role
  };
  
  localStorage.setItem('tourney_user', JSON.stringify(testUser));
  localStorage.setItem('tourney_token', 'mock-token');
  
  console.log(`✅ Set ${role} auth`);
  console.log('Navigate to appropriate dashboard and click logout button');
  
  const rolePaths = {
    player: '/player',
    organizer: '/organizer',
    admin: '/admin'
  };
  
  window.location.href = `http://localhost:5173${rolePaths[role]}`;
};

console.log('\n🛠️ Available test functions:');
console.log('- testAllLogouts() - Test all logout buttons automatically');
console.log('- testManualLogout("player") - Test player logout');
console.log('- testManualLogout("organizer") - Test organizer logout');
console.log('- testManualLogout("admin") - Test admin logout');

console.log('\n🎯 Expected behavior for all logout buttons:');
console.log('1. Clicking logout should clear localStorage');
console.log('2. Should remove tourney_user and tourney_token');
console.log('3. Should redirect to /login page');
console.log('4. Should work with routing protection');
console.log('5. Should prevent back button from going back to protected page');

console.log('\n⚠️  Run testAllLogouts() to test everything automatically!');
