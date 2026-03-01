import { NextRequest, NextResponse } from 'next/server';
import { MOCK_USER, updateMockUser } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    const { packId, price } = await req.json();

    if (MOCK_USER.balance < price) {
        return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    const newInventory = [...MOCK_USER.inventory];
    const itemIndex = newInventory.findIndex(i => i.packId === packId);

    if (itemIndex > -1) {
        newInventory[itemIndex].count += 1;
    } else {
        newInventory.push({ packId, count: 1 });
    }

    updateMockUser({
        ...MOCK_USER,
        balance: MOCK_USER.balance - price,
        inventory: newInventory
    });

    return NextResponse.json({ success: true, balance: MOCK_USER.balance });
}
