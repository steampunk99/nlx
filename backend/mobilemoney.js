const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function generateAPIUser(subscriptionKey) {
  const referenceId = uuidv4(); // Generate a unique UUID
  
  try {
    const response = await axios.post(
      'https://sandbox.momodeveloper.mtn.com/v1_0/apiuser', 
      {
        providerCallbackHost: "https://github.com/steampunk99" // Your callback URL
      },
      {
        headers: {
          'X-Reference-Id': referenceId,
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('API User Created');
    console.log('Reference ID (API User ID):', referenceId);
    return referenceId;
  } catch (error) {
    console.error('Error generating API User:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// API User Password Generation
async function generateAPIKey(subscriptionKey, apiUserId) {
  try {
    const response = await axios.post(
      `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${apiUserId}/apikey`,
      {},
      {
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('API Key Generated:', response.data.apiKey);
    return response.data.apiKey;
  } catch (error) {
    console.error('Error generating API Key:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Usage
async function main() {
  const subscriptionKey = process.env.MTN_COLLECTION_PRIMARY_KEY;
  
  try {
    // Step 1: Generate API User
    const apiUserId = await generateAPIUser(subscriptionKey);
    
    // Step 2: Generate API Key
    const apiKey = await generateAPIKey(subscriptionKey, apiUserId);
    
    console.log('Credentials:');
    console.log('Subscription Key:', subscriptionKey);
    console.log('API User ID:', apiUserId);
    console.log('API Key:', apiKey);
  } catch (error) {
    console.error('Credential Generation Failed:', error);
  }
}

main();