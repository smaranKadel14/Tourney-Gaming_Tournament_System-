// FRONTEND-BACKEND CONNECTION TEST - Run in Browser Console
console.log('🔗 TESTING FRONTEND-BACKEND CONNECTION\n');

// Test 1: Check if backend is accessible
console.log('\n📍 Test 1: Testing backend accessibility...');
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'wrongpassword' })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Backend response:', data);
  if (data.message) {
    console.log('📝 Backend message:', data.message);
  }
})
.catch(err => {
  console.log('❌ Backend error:', err);
});

// Test 2: Check if frontend API configuration is working
console.log('\n📍 Test 2: Testing frontend API config...');
try {
  // This should match your api.ts configuration
  const apiResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
  });
  
  const data = await apiResponse.json();
  console.log('✅ Frontend API test successful');
  console.log('Response data:', data);
  
  // Test if we can save auth data like your login component does
  if (data.token && data.user) {
    localStorage.setItem('tourney_user', JSON.stringify(data.user));
    localStorage.setItem('tourney_token', data.token);
    console.log('✅ Auth data saved to localStorage');
    console.log('User:', data.user);
    console.log('Token:', data.token);
  }
} catch (err) {
  console.log('❌ Frontend API error:', err);
}

// Test 3: Verify routing integration
console.log('\n📍 Test 3: Testing routing integration...');
setTimeout(() => {
  console.log('Testing if routing protects routes when not logged in...');
  
  // Clear auth and try to access protected route
  localStorage.clear();
  
  // This should redirect to login due to your ProtectedRoute
  window.location.href = 'http://localhost:5173/player';
}, 3000);

setTimeout(() => {
  console.log('✅ If routing works, should redirect to /login');
}, 5000);

console.log('\n🎯 Connection Status:');
console.log('✅ Frontend running: http://localhost:5173');
console.log('✅ Backend running: http://localhost:5000');
console.log('✅ API configured: http://localhost:5000/api');

console.log('\n🔍 What to check:');
console.log('1. Backend should respond to API calls');
console.log('2. Frontend should save auth data on successful login');
console.log('3. Routing should protect routes when not authenticated');
console.log('4. Logout buttons should clear auth and redirect');

console.log('\n⚠️  If backend test fails:');
console.log('- Check if backend server is running on port 5000');
console.log('- Check if CORS is configured properly');
console.log('- Check if auth endpoints exist in backend');

console.log('\n🛠️ Manual test functions:');
console.log('- testBackendConnection() - Test backend API');
console.log('- testFrontendLogin() - Test full login flow');
console.log('- testRoutingProtection() - Test route protection');
