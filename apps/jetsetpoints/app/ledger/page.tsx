export default function LedgerPage() {
  const mock = [
    { id: '1', type: 'credit', amount: 10000, description: 'USDT top-up', createdAt: '2025-09-30' },
    { id: '2', type: 'debit', amount: 5000, description: 'Redeem at Coffee House', createdAt: '2025-10-01' },
  ];
  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Points Ledger</h1>
      <ul className="space-y-3">
        {mock.map((tx) => (
          <li key={tx.id} className="rounded border p-3 flex items-center justify-between">
            <div>
              <div className="text-sm">{tx.description}</div>
              <div className="text-xs text-neutral-500">{tx.createdAt}</div>
            </div>
            <div className={tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}>
              {tx.type === 'credit' ? '+' : '-'}{tx.amount} JP
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 