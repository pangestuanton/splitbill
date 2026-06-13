import type { SplitBillInput } from '@/types/splitbill';

export const sampleBill: SplitBillInput = {
  participants: [
    { id: 'anton', name: 'Anton' },
    { id: 'diki', name: 'Diki' },
    { id: 'rani', name: 'Rani' },
  ],
  items: [
    {
      id: 'item-1',
      name: 'Makanan',
      price: 120000,
      quantity: 1,
      paidByParticipantId: 'anton',
      splitParticipantIds: ['anton', 'diki', 'rani'],
    },
    {
      id: 'item-2',
      name: 'Minuman',
      price: 30000,
      quantity: 1,
      paidByParticipantId: 'diki',
      splitParticipantIds: ['diki', 'rani'],
    },
  ],
  taxRate: 10,
  serviceRate: 5,
  discountType: 'fixed',
  discountValue: 0,
  extraFee: 0,
};
