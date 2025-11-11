import fetch from 'node-fetch'

async function testAPI() {
  try {
    console.log('Testing Quick Air Chat API...\n')
    
    // Test 1: Simple greeting
    console.log('Test 1: Simple greeting')
    const res1 = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'مرحبا', lang: 'ar' })
    })
    const data1 = await res1.json()
    console.log('Response:', JSON.stringify(data1, null, 2))
    console.log('\n---\n')
    
    // Test 2: Ask about destination
    console.log('Test 2: Ask about Bali')
    const res2 = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'أريد معلومات عن بالي', lang: 'ar' })
    })
    const data2 = await res2.json()
    console.log('Response:', JSON.stringify(data2, null, 2))
    console.log('\n---\n')
    
    // Test 3: Ask about hotels
    console.log('Test 3: Ask about hotels')
    const res3 = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ask_hotels', lang: 'ar', userId: 'test-user' })
    })
    const data3 = await res3.json()
    console.log('Response:', JSON.stringify(data3, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testAPI()
