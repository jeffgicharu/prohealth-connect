"use server";

import axios from 'axios';

const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

// Cache for storing the access token and its expiration
let tokenCache: {
  token: string | null;
  expiresAt: number;
} = {
  token: null,
  expiresAt: 0
};

export async function getMpesaAccessToken(): Promise<string | null> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    console.error("M-Pesa consumer key or secret is missing.");
    return null;
  }

  // Check if we have a valid cached token
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(MPESA_AUTH_URL, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    // Cache the token with expiration (1 hour from now)
    tokenCache = {
      token: response.data.access_token,
      expiresAt: now + (60 * 60 * 1000) // 1 hour in milliseconds
    };

    return response.data.access_token;
  } catch (error: any) {
    console.error("Error fetching M-Pesa access token:", error.response?.data || error.message);
    return null;
  }
} 