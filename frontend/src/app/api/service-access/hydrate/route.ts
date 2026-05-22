import { NextResponse } from 'next/server';
import { hydrateServiceAccesses } from '@/data/store';

export async function POST(req: Request) {
  try {
    const { accesses } = await req.json();
    if (!Array.isArray(accesses) || accesses.length === 0) {
      return NextResponse.json({ error: 'No accesses provided' }, { status: 400 });
    }
    hydrateServiceAccesses(accesses);
    return NextResponse.json({ hydrated: accesses.length });
  } catch {
    return NextResponse.json({ error: 'Failed to hydrate' }, { status: 500 });
  }
}
