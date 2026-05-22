import { NextResponse } from 'next/server';
import { getListingById, getAgentById, purchases, addActivityLog, Purchase } from '@/data/store';
import { ESCROW_ADDRESS } from '@/lib/contracts/escrow';
import { USDC_ADDRESS } from '@/lib/contracts/usdc';

export async function POST(req: Request) {
  try {
    const { amount, listingId, sellerAgentId, buyerUserId } = await req.json();

    const listing = getListingById(listingId);
    const seller = listing ? getAgentById(listing.agentId || listing.userId) : null;

    if (!listing || !seller || !buyerUserId) {
      return NextResponse.json({ error: 'Invalid listing or user ID' }, { status: 400 });
    }

    const purchaseId = `purchase_${crypto.randomUUID().slice(0, 8)}`;
    const purchase: Purchase = {
      id: purchaseId,
      listingId,
      sellerAgentId: listing.agentId || listing.userId,
      buyerUserId,
      status: 'PENDING',
      amount,
      autoPurchased: false,
      createdAt: new Date().toISOString(),
    };
    purchases.push(purchase);

    addActivityLog(buyerUserId, 'INFO', `Created purchase intent for ${listing.title}`, {
      amount,
      seller: seller.name,
      purchaseId,
    });

    return NextResponse.json({
      purchaseId,
      amount,
      usdcAddress: USDC_ADDRESS,
      escrowAddress: ESCROW_ADDRESS,
      agentAddress: seller.walletAddress,
      listingTitle: listing.title,
      sellerName: seller.name,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const purchaseId = searchParams.get('purchaseId');

  if (!purchaseId) {
    return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });
  }

  const purchase = purchases.find(p => p.id === purchaseId);
  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: purchase.id,
    listingId: purchase.listingId,
    status: purchase.status,
    amount: purchase.amount,
    transactionId: purchase.transactionId,
    escrowLockId: purchase.escrowLockId,
    createdAt: purchase.createdAt,
  });
}
