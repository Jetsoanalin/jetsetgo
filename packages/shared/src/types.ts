export type PointsTransaction = {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  createdAt: string;
};

export type WalletTransaction = {
  id: string;
  userId: string;
  amount: number;
  currency: 'USD' | 'INR' | 'IDR' | 'THB';
  createdAt: string;
};
