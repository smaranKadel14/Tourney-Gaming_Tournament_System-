// FINAL ROUTING TEST - Run in Browser Console
console.log('🚀 TESTING FIXED ROUTING SYSTEM\n');

// Step 1: Clear everything
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cleared all storage');

// Step 2: Test basic routing
console.log('\n🧪 Testing routing behavior...');

const testRoutes = [
  { path: '/', expected: 'redirect to /login', description: 'Default route' },
  { path: '/login', expected: 'show login page', description: 'Public route' },
  { path: '/signup', expected: 'show signup page', description: 'Public route' },
  { path: '/player', expected: 'redirect to /login', description: 'Protected route (no auth)' },
  { path: '/organizer', expected: 'redirect to /login', description: 'Protected route (no auth)' },
  { path: '/admin', expected: 'redirect to /login', description: 'Protected route (no auth)' },
  { path: '/unknown', expected: 'redirect to /login', description: '404 route' }
];

// Test each route
testRoutes.forEach((test, index) => {
  setTimeout(() => {
    console.log(`\n📍 Test ${index + 1}: ${test.path}`);
    console.log(`   Expected: ${test.expected}`);
    console.log(`   Description: ${test.description}`);
    window.location.href = `http://localhost:5173${test.path}`;
  }, (index + 1) * 2000);
});

// Test functions for manual testing
window.testAuth = {
  clear: () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Auth cleared');
  },
  
  setAuth: (role) => {
    const user = { id: '1', fullName: 'Test User', email: 'test@test.com', role };
    localStorage.setItem('tourney_user', JSON.stringify(user));
    localStorage.setItem('tourney_token', 'mock-token');
    console.log(`🔐 Set auth for: ${role}`);
  },
  
  testLogin: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
      });
      const data = await res.json();
      console.log('Login result:', data);
      if (data.token) {
        localStorage.setItem('tourney_user', JSON.stringify(data.user));
        localStorage.setItem('tourney_token', data.token);
        console.log('✅ Login successful, auth saved');
      }
    } catch (err) {
      console.log('Login error:', err);
    }
  }
};

console.log('\n🛠️ Available functions:');
console.log('- testAuth.clear() - Clear all auth');
console.log('- testAuth.setAuth("player") - Set player auth');
console.log('- testAuth.setAuth("organizer") - Set organizer auth');
console.log('- testAuth.setAuth("admin") - Set admin auth');
console.log('- testAuth.testLogin() - Test actual login API');

console.log('\n🎯 Expected behavior:');
console.log('1. All routes should redirect to /login when not logged in');
console.log('2. /login and /signup should show their pages when not logged in');
console.log('3. When logged in, should only access role-specific pages');
console.log('4. Wrong role access should redirect to correct role dashboard');

console.log('\n⚠️  Watch console for:');
console.log('- PublicOnlyRoute logs');
console.log('- ProtectedRoute logs');
console.log('- Navigation redirects');
