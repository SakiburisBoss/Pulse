"use server";

import Ably from "ably";

export async function generateAblyToken(userId?: string) {
  try {
    if (!process.env.ABLY_API_KEY) {
      throw new Error("Ably API key not configured");
    }

    const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });
    
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: userId || 'anonymous-user',
      capability: {
        '*': ['publish', 'subscribe', 'presence']
      }
    });

    return {
      success: true,
      tokenRequest
    };
  } catch (error) {
    console.error('Failed to generate Ably token:', error);
    return {
      success: false,
      error: 'Failed to generate authentication token',
      errorInfo: error instanceof Error ? {
        code: 50000,
        statusCode: 500,
        message: error.message
      } : undefined
    };
  }
}
