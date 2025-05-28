import axios, { AxiosError } from 'axios';

interface MpesaTokenResponse {
  access_token: string;
  expires_in: string;
}

interface STKPushPayload {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: string;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

interface STKPushResponse {
  CheckoutRequestID?: string;
  MerchantRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
}

interface MpesaErrorResponse {
  errorMessage?: string;
  errorCode?: string;
}

export class MpesaService {
  private static instance: MpesaService;
  private tokenCache: {
    token: string | null;
    expiresAt: number;
  } = {
    token: null,
    expiresAt: 0
  };

  private readonly MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  private readonly MPESA_STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  private constructor() {}

  static getInstance(): MpesaService {
    if (!this.instance) {
      this.instance = new MpesaService();
    }
    return this.instance;
  }

  private getTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  async getAccessToken(): Promise<string | null> {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      console.error("M-Pesa consumer key or secret is missing.");
      return null;
    }

    // Check if we have a valid cached token
    const now = Date.now();
    if (this.tokenCache.token && this.tokenCache.expiresAt > now) {
      return this.tokenCache.token;
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
      const response = await axios.get<MpesaTokenResponse>(this.MPESA_AUTH_URL, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      // Cache the token with expiration (1 hour from now)
      this.tokenCache = {
        token: response.data.access_token,
        expiresAt: now + (60 * 60 * 1000) // 1 hour in milliseconds
      };

      return response.data.access_token;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error fetching M-Pesa access token:", axiosError.response?.data || axiosError.message);
      return null;
    }
  }

  async initiateSTKPush(bookingId: string, phoneNumber: string, amount: number): Promise<STKPushResponse> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('Failed to get M-Pesa access token');
    }

    const shortCode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // Use MPESA_PUBLIC_BASE_URL for local development, NEXTAUTH_URL for production
    const publicBaseUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXTAUTH_URL
      : process.env.MPESA_PUBLIC_BASE_URL;
    
    const callBackURL = `${publicBaseUrl}/api/mpesa/stk-callback`;

    const payload: STKPushPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: process.env.MPESA_TRANSACTION_TYPE!,
      Amount: amount.toString(),
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callBackURL,
      AccountReference: bookingId.substring(0, 12),
      TransactionDesc: `Payment for Booking ${bookingId.substring(0,10)}`,
    };

    try {
      const response = await axios.post<STKPushResponse>(this.MPESA_STK_PUSH_URL, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<MpesaErrorResponse>;
      const errorMessage = axiosError.response?.data?.errorMessage || axiosError.message || 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  }
} 