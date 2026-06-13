'use client';

import { useMemo, useState } from 'react';
import type { SplitBillInput } from '@/types/splitbill';
import { calculateSplitBill } from '@/lib/split-calculator';
import { sampleBill } from '@/data/sample-bill';

export function useSplitBill(initialData: SplitBillInput = sampleBill) {
  const [bill, setBill] = useState<SplitBillInput>(initialData);
  const result = useMemo(() => calculateSplitBill(bill), [bill]);

  return {
    bill,
    setBill,
    result,
  };
}
