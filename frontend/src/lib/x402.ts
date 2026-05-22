export interface X402PaymentRequest {
  intentId: `0x${string}`;
  payee: `0x${string}`;
  amount: string;
  usdcContract: `0x${string}`;
  facilitatorContract: `0x${string}`;
  chainId: number;
}

export interface X402PaymentResult {
  success: boolean;
  txHash?: string;
  intentId?: string;
  error?: string;
}

export function createX402Request(
  payee: string,
  amount: string,
  facilitatorAddress: string,
  usdcAddress: string,
  chainId: number,
): X402PaymentRequest {
  return {
    intentId: "0x" as `0x${string}`,
    payee: payee as `0x${string}`,
    amount,
    usdcContract: usdcAddress as `0x${string}`,
    facilitatorContract: facilitatorAddress as `0x${string}`,
    chainId,
  };
}

export function getX402Header(request: X402PaymentRequest): Record<string, string> {
  return {
    "X-Payment-Intent": request.intentId,
    "X-Payment-Amount": request.amount,
    "X-Payment-Payee": request.payee,
    "X-Payment-Chain": String(request.chainId),
  };
}

export function parseX402Response(response: Response): X402PaymentResult {
  const paymentRequired = response.status === 402;
  return {
    success: paymentRequired,
    txHash: response.headers.get("X-Transaction-Hash") || undefined,
    intentId: response.headers.get("X-Payment-Intent") || undefined,
    error: paymentRequired ? undefined : "Unexpected response",
  };
}

export const X402_STATUS_CODES = {
  PAYMENT_REQUIRED: 402,
  PAYMENT_PENDING: 202,
  PAYMENT_CONFIRMED: 200,
} as const;
