import Ably from "ably";
import { generateAblyToken } from "@/actions/ably";

let client: Ably.Realtime | null = null;

export function getAblyClient() {
  if (!client) {
    client = new Ably.Realtime({
      authCallback: async (tokenParams, callback) => {
        try {
          const result = await generateAblyToken();
          
          if (result.success && result.tokenRequest) {
            callback(null, result.tokenRequest);
          } else {
            callback(result.error || 'Authentication failed', null);
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          // Type assertion as quick fix
          callback(error as Ably.ErrorInfo, null);
        }
      }
    });
  }
  return client;
}
