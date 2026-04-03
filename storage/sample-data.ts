import type { AppData } from '@/types/app';

export const sampleAppData: AppData = {
  persons: [
    {
      id: 'person_amit',
      name: 'Amit Sharma',
      phoneNumber: '+91 9876543210',
      createdAt: '2026-04-01T09:00:00.000Z',
    },
    {
      id: 'person_priya',
      name: 'Priya Verma',
      phoneNumber: '+91 9988776655',
      createdAt: '2026-04-01T10:00:00.000Z',
    },
  ],
  transactions: [
    {
      id: 'txn_1',
      personId: 'person_amit',
      type: 'given',
      amount: 1200,
      note: 'Groceries advance',
      date: '2026-04-01',
      createdAt: '2026-04-01T09:15:00.000Z',
    },
    {
      id: 'txn_2',
      personId: 'person_amit',
      type: 'received',
      amount: 400,
      note: 'Partial payment',
      date: '2026-04-02',
      createdAt: '2026-04-02T11:00:00.000Z',
    },
    {
      id: 'txn_3',
      personId: 'person_priya',
      type: 'given',
      amount: 750,
      note: 'Auto fare',
      date: '2026-04-02',
      createdAt: '2026-04-02T13:30:00.000Z',
    },
  ],
  settings: {
    reportOwnerName: 'My Khata',
  },
};
