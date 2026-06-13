import { calculateSplitBill } from './split-calculator';
import type { Group, Member, Expense, ExpenseParticipant, SplitBillResult } from '@/types';

/**
 * Calculates the split bill details for a group, adapting Supabase models to the core calculator logic.
 */
export function calculateGroupSplit(
  group: Group,
  members: Member[],
  expenses: Expense[],
  expenseParticipants: ExpenseParticipant[],
): SplitBillResult {
  // Map members to core Participant shape
  const participants = members.map((m) => ({
    id: m.id,
    name: m.name,
  }));

  // Map expenses to core BillItem shape
  const items = expenses.map((e) => {
    // Find all participant IDs for this expense
    const splitParticipantIds = expenseParticipants
      .filter((p) => p.expense_id === e.id)
      .map((p) => p.member_id);

    return {
      id: e.id,
      name: e.title,
      price: Number(e.amount) || 0,
      quantity: 1, // treats amount as total item cost
      paidByParticipantId: e.paid_by_member_id,
      splitParticipantIds,
    };
  });

  // Call the core calculator logic
  return calculateSplitBill({
    participants,
    items,
    taxRate: Number(group.tax_rate) || 0,
    serviceRate: Number(group.service_rate) || 0,
    discountType: group.discount_type || 'fixed',
    discountValue: Number(group.discount_value) || 0,
    extraFee: Number(group.extra_fee) || 0,
  });
}
