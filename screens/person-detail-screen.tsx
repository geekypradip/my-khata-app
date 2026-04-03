import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppShell, LoadingState } from "@/components/app-shell";
import { EmptyState, SummaryCard } from "@/components/cards";
import { FormField, PillButton, SegmentedControl } from "@/components/forms";
import { useAppData } from "@/hooks/use-app-data";
import type {
  KhataTransaction,
  PersonTransactionImportMode,
  TransactionType,
} from "@/types/app";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate, getTodayIsoDate } from "@/utils/date";
import { getPersonBalance } from "@/utils/khata";

const emptyForm = {
  type: "given" as TransactionType,
  amount: "",
  note: "",
  date: getTodayIsoDate(),
};

export function PersonDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ personId: string }>();
  const {
    data,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updatePerson,
    deletePerson,
    importTransactionsForPerson,
    importTransactionsForPersonFromJson,
    sharePersonReport,
    downloadTransactionImportExample,
  } = useAppData();
  const [personName, setPersonName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingTransaction, setEditingTransaction] =
    useState<KhataTransaction | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isPersonMenuOpen, setIsPersonMenuOpen] = useState(false);
  const [isPersonEditModalOpen, setIsPersonEditModalOpen] = useState(false);
  const [activeTransactionMenuId, setActiveTransactionMenuId] = useState<
    string | null
  >(null);
  const [isImportTransactionsModalOpen, setIsImportTransactionsModalOpen] =
    useState(false);
  const [importMode, setImportMode] =
    useState<PersonTransactionImportMode>("merge");
  const [importJsonText, setImportJsonText] = useState("");

  const person = data.persons.find((entry) => entry.id === params.personId);

  const transactions = useMemo(() => {
    return data.transactions
      .filter((transaction) => transaction.personId === params.personId)
      .sort(
        (first, second) =>
          new Date(second.date).getTime() - new Date(first.date).getTime(),
      );
  }, [data.transactions, params.personId]);

  const groupedTransactions = useMemo(() => {
    return transactions.reduce<
      Array<{ date: string; items: KhataTransaction[] }>
    >((groups, transaction) => {
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.date === transaction.date) {
        lastGroup.items.push(transaction);
        return groups;
      }

      groups.push({
        date: transaction.date,
        items: [transaction],
      });

      return groups;
    }, []);
  }, [transactions]);

  useEffect(() => {
    if (!person) {
      return;
    }

    setPersonName(person.name);
    setPhoneNumber(person.phoneNumber ?? "");
  }, [person]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!person) {
    return (
      <AppShell title="Person not found">
        <EmptyState
          title="Missing record"
          description="This person no longer exists in local storage."
        />
      </AppShell>
    );
  }

  const balance = getPersonBalance(person.id, data.transactions);
  const balanceLabel =
    person.isExpenseCategory && balance > 0
      ? "Total expense"
      : balance < 0
        ? "I have advance"
        : balance > 0
          ? "I will get"
          : "Settled";
  const balanceTone =
    balance < 0 ? "positive" : balance > 0 ? "negative" : "default";

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTransaction(null);
    setIsTransactionModalOpen(false);
  };

  const openTransactionModal = (type: TransactionType) => {
    setEditingTransaction(null);
    setForm({
      type,
      amount: "",
      note: "",
      date: getTodayIsoDate(),
    });
    setIsTransactionModalOpen(true);
  };

  const savePersonDetails = async () => {
    if (!personName.trim()) {
      Alert.alert("Name required", "Enter a person name before saving.");
      return;
    }

    await updatePerson(person.id, {
      name: personName,
      phoneNumber,
      isExpenseCategory: person.isExpenseCategory,
    });
    setIsPersonEditModalOpen(false);
    Alert.alert("Details updated", "Person details were updated locally.");
  };

  const confirmDeletePerson = () => {
    setIsPersonMenuOpen(false);
    Alert.alert(
      person.isExpenseCategory ? "Delete expense" : "Delete person",
      "This will remove the person and all related transactions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deletePerson(person.id).then(() => router.back());
          },
        },
      ],
    );
  };

  const toggleCategoryType = async () => {
    setIsPersonMenuOpen(false);

    const nextIsExpenseCategory = !person.isExpenseCategory;
    await updatePerson(person.id, {
      name: personName,
      phoneNumber: nextIsExpenseCategory ? undefined : phoneNumber,
      isExpenseCategory: nextIsExpenseCategory,
    });

    Alert.alert(
      nextIsExpenseCategory ? "Converted to expense" : "Converted to person",
      nextIsExpenseCategory
        ? "This khata now appears in the Expenses tab."
        : "This khata now appears in the People tab.",
    );
  };

  const submitTransaction = async () => {
    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Invalid amount", "Enter an amount greater than zero.");
      return;
    }

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, {
        type: form.type,
        amount,
        note: form.note,
        date: form.date,
      });
      Alert.alert(
        "Transaction updated",
        "The khata entry was updated locally.",
      );
    } else {
      await addTransaction({
        personId: person.id,
        type: form.type,
        amount,
        note: form.note,
        date: form.date,
      });
      Alert.alert(
        "Transaction added",
        "The balance was recalculated from this new entry.",
      );
    }

    resetForm();
  };

  const openEditTransaction = (transaction: KhataTransaction) => {
    setActiveTransactionMenuId(null);
    setEditingTransaction(transaction);
    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      note: transaction.note ?? "",
      date: transaction.date,
    });
    setIsTransactionModalOpen(true);
  };

  const confirmDeleteTransaction = (transactionId: string) => {
    setActiveTransactionMenuId(null);
    Alert.alert(
      "Delete transaction",
      "This khata entry will be removed from local storage.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteTransaction(transactionId);
          },
        },
      ],
    );
  };

  const handleImportTransactions = async () => {
    const result = await importTransactionsForPerson(person.id, importMode);
    Alert.alert(
      result.success ? "Import complete" : "Import status",
      result.message,
    );

    if (result.success) {
      setIsImportTransactionsModalOpen(false);
    }
  };

  const handleImportTransactionsFromText = async () => {
    if (!importJsonText.trim()) {
      Alert.alert("JSON required", "Paste or write JSON before importing.");
      return;
    }

    const result = await importTransactionsForPersonFromJson(
      person.id,
      importJsonText,
      importMode,
    );
    Alert.alert(
      result.success ? "Import complete" : "Import status",
      result.message,
    );

    if (result.success) {
      setImportJsonText("");
      setIsImportTransactionsModalOpen(false);
    }
  };

  const handleDownloadImportExample = async () => {
    const result = await downloadTransactionImportExample(person.name);
    Alert.alert(
      result.success ? "Example ready" : "Example status",
      result.message,
    );
  };

  const handleShareReport = async () => {
    setIsPersonMenuOpen(false);
    const result = await sharePersonReport(person.id);
    Alert.alert(
      result.success ? "Report ready" : "Report status",
      result.message,
    );
  };

  return (
    <AppShell
      title={person.name}
      subtitle={
        person.isExpenseCategory
          ? "Expense category"
          : phoneNumber || "No phone number saved"
      }
      rightAction={
        <Pressable
          onPress={() => setIsPersonMenuOpen(true)}
          style={({ pressed }) => [
            styles.headerActionButton,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons name="more-vert" size={22} color="#23423b" />
        </Pressable>
      }
    >
      <>
        <ScrollView contentContainerStyle={styles.content}>
          <SummaryCard
            label={balanceLabel}
            value={formatCurrency(Math.abs(balance))}
            tone={balanceTone}
            compact
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction history</Text>
            {transactions.length === 0 ? (
              <EmptyState
                title="No entries yet"
                description="Use the buttons below to add given or received money."
              />
            ) : (
              groupedTransactions.map((group) => (
                <View key={group.date} style={styles.dateGroup}>
                  <Text style={styles.dateHeader}>
                    {formatDisplayDate(group.date)}
                  </Text>
                  {group.items.map((transaction) => (
                    <View
                      key={transaction.id}
                      style={[
                        styles.itemCard,
                        transaction.type === "given"
                          ? styles.itemCardLeft
                          : styles.itemCardRight,
                      ]}
                    >
                      <Pressable
                        onPress={() =>
                          setActiveTransactionMenuId((current) =>
                            current === transaction.id ? null : transaction.id,
                          )
                        }
                        style={({ pressed }) => [
                          styles.itemTop,
                          transaction.type === "given"
                            ? styles.itemTopGiven
                            : styles.itemTopReceived,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.itemText}>
                          <View style={styles.amountRow}>
                            <MaterialIcons
                              name={
                                transaction.type === "given"
                                  ? "arrow-upward"
                                  : "arrow-downward"
                              }
                              size={16}
                              color={
                                transaction.type === "given"
                                  ? "#c43d3d"
                                  : "#0f8a43"
                              }
                            />
                            <Text
                              style={[
                                styles.amountText,
                                transaction.type === "given"
                                  ? styles.positiveText
                                  : styles.negativeText,
                              ]}
                            >
                              {formatCurrency(transaction.amount)}
                            </Text>
                          </View>
                          {transaction.note ? (
                            <Text style={styles.metaText}>
                              {transaction.note}
                            </Text>
                          ) : null}
                        </View>
                      </Pressable>
                      {activeTransactionMenuId === transaction.id ? (
                        <View
                          style={[
                            styles.transactionMenu,
                            transaction.type === "given"
                              ? styles.transactionMenuLeft
                              : styles.transactionMenuRight,
                          ]}
                        >
                          <Pressable
                            onPress={() => openEditTransaction(transaction)}
                            style={({ pressed }) => [
                              styles.transactionMenuItem,
                              pressed && styles.pressed,
                            ]}
                          >
                            <MaterialIcons
                              name="edit"
                              size={16}
                              color="#23423b"
                            />
                            <Text style={styles.menuText}>Edit</Text>
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              confirmDeleteTransaction(transaction.id)
                            }
                            style={({ pressed }) => [
                              styles.transactionMenuItem,
                              pressed && styles.pressed,
                            ]}
                          >
                            <MaterialIcons
                              name="delete-outline"
                              size={16}
                              color="#ba3a3a"
                            />
                            <Text style={styles.deleteMenuText}>Delete</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            onPress={() => openTransactionModal("given")}
            style={({ pressed }) => [
              styles.bottomButton,
              styles.givenButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="arrow-upward" size={18} color="#c43d3d" />
            <Text style={[styles.bottomButtonText, styles.givenButtonText]}>
              Given
            </Text>
          </Pressable>
          <Pressable
            onPress={() => openTransactionModal("received")}
            style={({ pressed }) => [
              styles.bottomButton,
              styles.receivedButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="arrow-downward" size={18} color="#0f8a43" />
            <Text style={[styles.bottomButtonText, styles.receivedButtonText]}>
              Received
            </Text>
          </Pressable>
        </View>

        <Modal
          visible={isPersonMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPersonMenuOpen(false)}
        >
          <View style={styles.menuOverlay}>
            <Pressable
              style={styles.menuBackdrop}
              onPress={() => setIsPersonMenuOpen(false)}
            />
            <View style={styles.menuCard}>
              <Pressable
                onPress={() => {
                  setIsPersonMenuOpen(false);
                  setIsPersonEditModalOpen(true);
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons name="edit" size={18} color="#23423b" />
                <Text style={styles.menuText}>
                  {person.isExpenseCategory ? "Edit expense" : "Edit person"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsPersonMenuOpen(false);
                  setIsImportTransactionsModalOpen(true);
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons name="file-upload" size={18} color="#23423b" />
                <Text style={styles.menuText}>Import transactions</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleShareReport()}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name="picture-as-pdf"
                  size={18}
                  color="#23423b"
                />
                <Text style={styles.menuText}>Share report PDF</Text>
              </Pressable>
              <Pressable
                onPress={() => void toggleCategoryType()}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name={
                    person.isExpenseCategory ? "person-outline" : "receipt-long"
                  }
                  size={18}
                  color="#23423b"
                />
                <Text style={styles.menuText}>
                  {person.isExpenseCategory
                    ? "Convert to person"
                    : "Convert to expense"}
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmDeletePerson}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={18}
                  color="#ba3a3a"
                />
                <Text style={styles.deleteMenuText}>
                  {person.isExpenseCategory
                    ? "Delete expense"
                    : "Delete person"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isImportTransactionsModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsImportTransactionsModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setIsImportTransactionsModalOpen(false)}
            />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Import transactions</Text>
              <Text style={styles.modalHelperText}>
                Upload JSON only for this person. Use merge to keep current
                entries or replace to overwrite them.
              </Text>

              <Pressable
                onPress={() => setImportMode("merge")}
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name={
                    importMode === "merge"
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={20}
                  color="#0f766e"
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Merge with existing</Text>
                  <Text style={styles.optionDescription}>
                    Keep current transactions and add imported ones.
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setImportMode("replace")}
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons
                  name={
                    importMode === "replace"
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={20}
                  color="#0f766e"
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Replace existing</Text>
                  <Text style={styles.optionDescription}>
                    Remove this person&apos;s current transactions first.
                  </Text>
                </View>
              </Pressable>

              <FormField
                label="Paste or write JSON"
                value={importJsonText}
                onChangeText={setImportJsonText}
                placeholder='{"transactions":[{"type":"given","amount":500,"date":"2026-04-01"}]}'
                multiline
                fixedHeight={180}
              />

              <View style={styles.row}>
                <PillButton
                  title="Download example JSON"
                  onPress={handleDownloadImportExample}
                  tone="secondary"
                />
                <PillButton
                  title="Import pasted JSON"
                  onPress={handleImportTransactionsFromText}
                />
                <PillButton
                  title="Import JSON file"
                  onPress={handleImportTransactions}
                />
                <PillButton
                  title="Cancel"
                  onPress={() => setIsImportTransactionsModalOpen(false)}
                  tone="secondary"
                />
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isPersonEditModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPersonEditModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setIsPersonEditModalOpen(false)}
            />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {person.isExpenseCategory ? "Edit expense" : "Edit person"}
              </Text>
              <FormField
                label="Name"
                value={personName}
                onChangeText={setPersonName}
                placeholder="Name"
              />
              {!person.isExpenseCategory ? (
                <FormField
                  label="Phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Optional"
                  keyboardType="phone-pad"
                />
              ) : null}
              <View style={styles.row}>
                <PillButton title="Save changes" onPress={savePersonDetails} />
                <PillButton
                  title="Cancel"
                  onPress={() => setIsPersonEditModalOpen(false)}
                  tone="secondary"
                />
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isTransactionModalOpen}
          transparent
          animationType="fade"
          onRequestClose={resetForm}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={resetForm} />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {editingTransaction
                  ? "Edit transaction"
                  : form.type === "given"
                    ? "Add given entry"
                    : "Add received entry"}
              </Text>
              {editingTransaction ? (
                <SegmentedControl
                  value={form.type}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, type: value }))
                  }
                  options={[
                    { label: "Given", value: "given" },
                    { label: "Received", value: "received" },
                  ]}
                />
              ) : null}
              <FormField
                label="Amount"
                value={form.amount}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, amount: value }))
                }
                placeholder="0"
                keyboardType="numeric"
              />
              <FormField
                label="Date"
                value={form.date}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, date: value }))
                }
                placeholder="YYYY-MM-DD"
              />
              <FormField
                label="Note"
                value={form.note}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, note: value }))
                }
                placeholder="Optional"
                multiline
              />
              <View style={styles.row}>
                <PillButton
                  title={editingTransaction ? "Save changes" : "Save entry"}
                  onPress={submitTransaction}
                />
                <PillButton
                  title="Cancel"
                  onPress={resetForm}
                  tone="secondary"
                />
              </View>
            </View>
          </View>
        </Modal>
      </>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 112,
    gap: 16,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e9f1ed",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d8e4de",
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#102a24",
  },
  row: {
    gap: 10,
  },
  itemCard: {
    gap: 8,
    maxWidth: "50%",
  },
  itemCardLeft: {
    alignSelf: "flex-start",
  },
  itemCardRight: {
    alignSelf: "flex-end",
  },
  dateGroup: {
    gap: 4,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5d726c",
    paddingTop: 4,
    textAlign: "center",
  },
  itemTop: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  itemTopGiven: {
    backgroundColor: "#fff2f2",
    borderWidth: 1,
    borderColor: "#efc1c1",
  },
  itemTopReceived: {
    backgroundColor: "#eefbf3",
    borderWidth: 1,
    borderColor: "#b8e4c3",
  },
  itemText: {
    gap: 4,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#5d726c",
  },
  amountText: {
    fontSize: 15,
    fontWeight: "700",
  },
  positiveText: {
    color: "#c43d3d",
  },
  negativeText: {
    color: "#0f8a43",
  },
  transactionMenu: {
    minWidth: 132,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8e4de",
    paddingVertical: 6,
    shadowColor: "#102a24",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },
  transactionMenuLeft: {
    alignSelf: "flex-start",
  },
  transactionMenuRight: {
    alignSelf: "flex-end",
  },
  transactionMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#102a24",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },
  givenButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efc1c1",
  },
  receivedButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#b8e4c3",
  },
  bottomButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  givenButtonText: {
    color: "#c43d3d",
  },
  receivedButtonText: {
    color: "#0f8a43",
  },
  menuOverlay: {
    flex: 1,
    paddingTop: 84,
    paddingHorizontal: 16,
    alignItems: "flex-end",
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 42, 36, 0.1)",
  },
  menuCard: {
    width: 220,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8e4de",
    paddingVertical: 8,
    shadowColor: "#102a24",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#23423b",
  },
  deleteMenuText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ba3a3a",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16, 42, 36, 0.28)",
    justifyContent: "center",
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: "#f9fcfa",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#d8e4de",
    padding: 18,
    gap: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#102a24",
  },
  modalHelperText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#5d726c",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 6,
  },
  optionText: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#102a24",
  },
  optionDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: "#5d726c",
  },
  pressed: {
    opacity: 0.84,
  },
});
