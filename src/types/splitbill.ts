export type DiscountType = 'fixed' | 'percent';

export interface Participant {
  id: string;
  name: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  paidByParticipantId: string;
  splitParticipantIds: string[];
}

export interface SplitBillInput {
  participants: Participant[];
  items: BillItem[];
  taxRate: number;
  serviceRate: number;
  discountType: DiscountType;
  discountValue: number;
  extraFee: number;
}

export interface ParticipantSummary {
  participantId: string;
  name: string;
  subtotal: number;
  tax: number;
  service: number;
  discount: number;
  extraFee: number;
  totalOwed: number;
  paid: number;
  balance: number;
}

export interface Settlement {
  fromParticipantId: string;
  fromName: string;
  toParticipantId: string;
  toName: string;
  amount: number;
}

export interface SplitBillResult {
  subtotal: number;
  tax: number;
  service: number;
  discount: number;
  extraFee: number;
  total: number;
  participants: ParticipantSummary[];
  settlements: Settlement[];
}
