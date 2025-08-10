const axios = require("axios");

const API_KEY = "ef5c9fde3f9b9a79700d6168"; // Get API key from exchangerate-api.com

// Function to fetch the exchange rate from the base currency to the target currency
async function getExchangeRate(baseCurrency, toCurrency) {
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`
    );
    
    const rates = response.data.conversion_rates;
    return rates[toCurrency] || 1; // Return exchange rate or default to 1 if not found
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return 1; // Fallback in case of API failure
  }
}

module.exports = { getExchangeRate };
