import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppShell, LoadingState } from "@/components/app-shell";
import {
  BreakdownCard,
  EntryBreakdownCard,
  SummaryCard,
} from "@/components/cards";
import { useAppData } from "@/hooks/use-app-data";
import { formatCurrency } from "@/utils/currency";
import { getPersonBalance } from "@/utils/khata";

export function HomeScreen() {
  const { data, isLoading } = useAppData();

  if (isLoading) {
    return <LoadingState />;
  }

  const people = data.persons.filter((person) => !person.isExpenseCategory);
  const expenseCategories = data.persons.filter(
    (person) => person.isExpenseCategory,
  );

  const willReceive = people.reduce((total, person) => {
    const balance = getPersonBalance(person.id, data.transactions);
    return balance > 0 ? total + balance : total;
  }, 0);

  const haveAdvance = people.reduce((total, person) => {
    const balance = getPersonBalance(person.id, data.transactions);
    return balance < 0 ? total + Math.abs(balance) : total;
  }, 0);

  const totalExpense = expenseCategories.reduce((total, person) => {
    const balance = getPersonBalance(person.id, data.transactions);
    return total + Math.abs(balance);
  }, 0);

  const activePeopleCount = people.reduce((count, person) => {
    return getPersonBalance(person.id, data.transactions) !== 0
      ? count + 1
      : count;
  }, 0);

  const activeExpenseCount = expenseCategories.reduce((count, person) => {
    return getPersonBalance(person.id, data.transactions) !== 0
      ? count + 1
      : count;
  }, 0);

  const peopleEntryCount = data.transactions.reduce((count, transaction) => {
    return people.some((person) => person.id === transaction.personId)
      ? count + 1
      : count;
  }, 0);

  const expenseEntryCount = data.transactions.reduce((count, transaction) => {
    return expenseCategories.some(
      (person) => person.id === transaction.personId,
    )
      ? count + 1
      : count;
  }, 0);

  const settledPeopleCount = people.length - activePeopleCount;
  const settledExpenseCount = expenseCategories.length - activeExpenseCount;

  return (
    <AppShell
      title="My Khata"
      subtitle="Offline khata ledger with local backup and restore."
      rightAction={
        <Pressable
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="settings" size={20} color="#23423b" />
        </Pressable>
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <SummaryCard
            label="Given Amount to people"
            value={formatCurrency(willReceive)}
            tone="negative"
          />
          <SummaryCard
            label="I have Advance from people"
            value={formatCurrency(haveAdvance)}
            tone="positive"
          />
          <SummaryCard
            label="Total expense"
            value={formatCurrency(totalExpense)}
            tone="negative"
          />
        </View>

        <View style={styles.grid}>
          <BreakdownCard
            title="People"
            total={people.length}
            active={activePeopleCount}
            settled={settledPeopleCount}
          />
          <BreakdownCard
            title="Expenses"
            total={expenseCategories.length}
            active={activeExpenseCount}
            settled={settledExpenseCount}
          />
        </View>

        <View style={styles.grid}>
          <EntryBreakdownCard
            total={data.transactions.length}
            people={peopleEntryCount}
            expenses={expenseEntryCount}
          />
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    gap: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e9f1ed",
  },
  pressed: {
    opacity: 0.84,
  },
});
