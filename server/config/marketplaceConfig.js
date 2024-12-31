require('dotenv').config();

module.exports = {
  mercari: {
    apiUrl: process.env.MERCARI_API_URL,
    apiKey: process.env.MERCARI_API_KEY,
  },
  poshmark: {
    apiUrl: process.env.POSHMARK_API_URL,
    apiKey: process.env.POSHMARK_API_KEY,
  },
  ebay: {
    apiUrl: process.env.EBAY_API_URL,
    clientId: process.env.EBAY_CLIENT_ID,
    clientSecret: process.env.EBAY_CLIENT_SECRET,
    redirectUri: process.env.EBAY_REDIRECT_URI,
    fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID,
    paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID,
    returnPolicyId: process.env.EBAY_RETURN_POLICY_ID,
  },
};
