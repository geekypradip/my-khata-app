import type { KhataTransaction, Person } from '@/types/app';

export function getPersonBalance(personId: string, transactions: KhataTransaction[]) {
  return transactions
    .filter((transaction) => transaction.personId === personId)
    .reduce((total, transaction) => {
      return total + (transaction.type === 'given' ? transaction.amount : -transaction.amount);
    }, 0);
}

export function getKhataSummary(persons: Person[], transactions: KhataTransaction[]) {
  return persons.reduce(
    (summary, person) => {
      const balance = getPersonBalance(person.id, transactions);

      if (balance > 0) {
        summary.totalReceivable += balance;
      }

      if (balance < 0) {
        summary.totalPayable += Math.abs(balance);
      }

      if (balance !== 0) {
        summary.activePersons += 1;
      }

      return summary;
    },
    {
      totalReceivable: 0,
      totalPayable: 0,
      activePersons: 0,
    }
  );
}
