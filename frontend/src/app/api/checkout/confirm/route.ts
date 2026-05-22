import { NextResponse } from 'next/server';
import { purchases, getListingById, createServiceAccess, addActivityLog, getAgentById } from '@/data/store';

export async function POST(req: Request) {
  try {
    const { purchaseId, transactionId, escrowLockId } = await req.json();

    if (!purchaseId) {
      return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });
    }

    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.status !== 'PENDING') {
      return NextResponse.json({ error: 'Purchase already processed' }, { status: 400 });
    }

    purchase.status = 'CONFIRMED';
    purchase.transactionId = transactionId || `tx_${crypto.randomUUID().slice(0, 8)}`;
    purchase.escrowLockId = escrowLockId;

    const listing = getListingById(purchase.listingId);
    const seller = listing ? getAgentById(listing.agentId || listing.userId) : null;

    const serviceAccess = createServiceAccess({
      purchaseId: purchase.id,
      listingId: purchase.listingId,
      buyerUserId: purchase.buyerUserId,
      sellerAgentId: purchase.sellerAgentId,
      status: 'ACTIVE',
    });

    addActivityLog(purchase.buyerUserId, 'PURCHASE', `Purchased ${listing?.title || 'service'} from ${seller?.name || 'agent'} for $${purchase.amount}`, {
      amount: purchase.amount,
      seller: seller?.name || '',
      transactionId: purchase.transactionId || '',
      accessToken: serviceAccess?.accessToken || '',
    });

    if (seller) {
      addActivityLog(purchase.sellerAgentId, 'SALE', `Sold ${listing?.title || 'service'} for $${purchase.amount}`, {
        amount: purchase.amount,
        buyer: purchase.buyerUserId,
      });
    }

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      status: 'CONFIRMED',
      accessToken: serviceAccess?.accessToken,
      transactionId: purchase.transactionId,
    });
  } catch (error) {
    console.error('Confirm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
