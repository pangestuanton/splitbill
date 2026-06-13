export type DiscountType = 'fixed' | 'percent';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  tax_rate: number;
  service_rate: number;
  discount_type: DiscountType;
  discount_value: number;
  extra_fee: number;
  created_at: string;
}

export interface Member {
  id: string;
  group_id: string;
  name: string;
  created_at: string;
}

export interface Expense {
  id: string;
  group_id: string;
  paid_by_member_id: string;
  title: string;
  amount: number;
  created_at: string;
}

export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  member_id: string;
  share_amount: number | null;
  created_at: string;
}

export interface ReceiptScan {
  id: string;
  group_id: string;
  merchant: string | null;
  raw_text: string | null;
  parsed_result: {
    merchant?: string;
    date?: string;
    items?: Array<{ name: string; amount: number }>;
    subtotal?: number;
    tax?: number;
    service?: number;
    discount?: number;
    total?: number;
    confidence?: string;
  } | null;
  image_url: string | null;
  created_at: string;
}

// Existing calculation types (compatible with split-calculator.ts)
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
