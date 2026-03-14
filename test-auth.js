// Use native fetch

async function runTests() {
  console.log("1. Testing Registration...");
  const regRes = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      name: 'Test Student',
      role: 'STUDENT'
    })
  });
  const regData = await regRes.json();
  console.log('Register Response:', regRes.status, regData);
  
  if (regRes.status !== 201) {
    console.error("Registration failed!");
    return;
  }
  
  // Find the cookie
  const setCookie = regRes.headers.get('set-cookie');
  console.log('Set-Cookie:', setCookie);
  
  console.log("\n2. Testing /api/auth/me...");
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: { 'Cookie': setCookie }
  });
  const meData = await meRes.json();
  console.log('Me Response:', meRes.status, meData);
  
  console.log("\n3. Testing API favorites (protected)...");
  const favRes = await fetch('http://localhost:3000/api/favorites', {
    headers: { 'Cookie': setCookie }
  });
  const favData = await favRes.json();
  console.log('Favorites (should be empty array):', favRes.status, favData);
}

runTests().catch(console.error);
