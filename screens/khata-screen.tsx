import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Contacts from "expo-contacts";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { EmptyState } from "@/components/cards";
import { FormField, PillButton, SegmentedControl } from "@/components/forms";
import { useAppData } from "@/hooks/use-app-data";
import { formatCurrency } from "@/utils/currency";
import { getPersonBalance } from "@/utils/khata";

export function KhataScreen() {
  const { data, isLoading, addPerson } = useAppData();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddExpenseCategoryOpen, setIsAddExpenseCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"people" | "expenses">("people");

  const persons = useMemo(() => {
    return [...data.persons].sort((first, second) => {
      const balanceDifference =
        getPersonBalance(second.id, data.transactions) -
        getPersonBalance(first.id, data.transactions);

      if (balanceDifference !== 0) {
        return balanceDifference;
      }

      return first.name.localeCompare(second.name);
    });
  }, [data.persons, data.transactions]);

  const visiblePersons = useMemo(() => {
    return persons.filter((person) =>
      activeTab === "expenses" ? !!person.isExpenseCategory : !person.isExpenseCategory,
    );
  }, [activeTab, persons]);

  if (isLoading) {
    return <LoadingState />;
  }

  const submitPerson = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Enter a person name before saving.");
      return;
    }

    await addPerson({ name, phoneNumber });
    setName("");
    setPhoneNumber("");
    setIsAddPersonOpen(false);
    Alert.alert(
      "Person added",
      "You can now record given and received transactions.",
    );
  };

  const submitExpenseCategory = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Enter an expense category name before saving.");
      return;
    }

    await addPerson({ name, isExpenseCategory: true });
    setName("");
    setPhoneNumber("");
    setIsAddExpenseCategoryOpen(false);
    setActiveTab("expenses");
    Alert.alert("Expense category added", "You can now track this expense stream inside khata.");
  };

  const pickFromContacts = async () => {
    const permission = await Contacts.requestPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert(
        "Contacts permission needed",
        "Allow contacts permission to pick a saved contact.",
      );
      return;
    }

    const contact = await Contacts.presentContactPickerAsync();

    if (!contact) {
      return;
    }

    setName(contact.name ?? "");
    setPhoneNumber(contact.phoneNumbers?.[0]?.number ?? "");
  };

  return (
    <AppShell
      title="Khata"
      subtitle="Track who owes what, with balances calculated from transactions."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.compactHeader}>
          <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { label: "People", value: "people" },
              { label: "Expenses", value: "expenses" },
            ]}
          />
          <View style={styles.addActions}>
            {activeTab === "people" ? (
              <Pressable
                onPress={() => {
                  setName("");
                  setPhoneNumber("");
                  setIsAddPersonOpen(true);
                }}
                style={({ pressed }) => [
                  styles.addPersonButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons name="person-add-alt-1" size={15} color="#ffffff" />
                <Text style={styles.addPersonButtonText}>Add person</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  setName("");
                  setPhoneNumber("");
                  setIsAddExpenseCategoryOpen(true);
                }}
                style={({ pressed }) => [
                  styles.addExpenseButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons name="receipt-long" size={15} color="#23423b" />
                <Text style={styles.addExpenseButtonText}>Create expense</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{activeTab === "people" ? "People" : "Expenses"}</Text>
          {visiblePersons.length === 0 ? (
            <EmptyState
              title={activeTab === "people" ? "No khata yet" : "No expense categories yet"}
              description={
                activeTab === "people"
                  ? "Add a person manually or import one from your contacts."
                  : "Create an expense category to track those entries in khata."
              }
            />
          ) : (
            visiblePersons.map((person) => {
              const balance = getPersonBalance(person.id, data.transactions);
              const balanceColor =
                balance < 0 ? "#0f8a43" : balance > 0 ? "#c43d3d" : "#5d726c";

              return (
                <Pressable
                  key={person.id}
                  onPress={() => router.push(`/person/${person.id}`)}
                  style={({ pressed }) => [
                    styles.personCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.personText}>
                    <Text style={styles.personName}>{person.name}</Text>
                    <Text style={styles.personMeta}>
                      {person.isExpenseCategory
                        ? "Expense category"
                        : person.phoneNumber || "No phone number saved"}
                    </Text>
                  </View>
                  <Text style={[styles.balanceText, { color: balanceColor }]}>
                    {formatCurrency(Math.abs(balance))}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isAddPersonOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddPersonOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsAddPersonOpen(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Add person</Text>
                <Text style={styles.modalSubtitle}>
                  Add manually or pull basic details from contacts.
                </Text>
              </View>
              <Pressable
                onPress={() => setIsAddPersonOpen(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons name="close" size={18} color="#23423b" />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <FormField
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
              />
              <FormField
                label="Phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Optional"
                keyboardType="phone-pad"
              />
              <View style={styles.row}>
                <PillButton title="Save person" onPress={submitPerson} />
                <PillButton
                  title="Pick from contacts"
                  onPress={() => void pickFromContacts()}
                  tone="secondary"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAddExpenseCategoryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddExpenseCategoryOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsAddExpenseCategoryOpen(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Create expense</Text>
                <Text style={styles.modalSubtitle}>
                  Create an expense category that behaves like a khata record.
                </Text>
              </View>
              <Pressable
                onPress={() => setIsAddExpenseCategoryOpen(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons name="close" size={18} color="#23423b" />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <FormField
                label="Expense name"
                value={name}
                onChangeText={setName}
                placeholder="Fuel, Grocery, Rent"
              />
              <View style={styles.row}>
                <PillButton title="Save expense" onPress={submitExpenseCategory} />
                <PillButton
                  title="Cancel"
                  onPress={() => setIsAddExpenseCategoryOpen(false)}
                  tone="secondary"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    gap: 16,
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
  sectionCaption: {
    fontSize: 13,
    color: "#5d726c",
  },
  compactHeader: {
    gap: 12,
  },
  addActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  addPersonButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0f766e",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addPersonButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  addExpenseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c8d8d2",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addExpenseButtonText: {
    color: "#23423b",
    fontSize: 14,
    fontWeight: "700",
  },
  row: {
    gap: 10,
  },
  personCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#edf3ef",
    gap: 12,
  },
  personText: {
    flex: 1,
    gap: 4,
  },
  personName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#102a24",
  },
  personMeta: {
    fontSize: 13,
    color: "#5d726c",
  },
  balanceText: {
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
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
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  modalHeaderText: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#102a24",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#5d726c",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e9f1ed",
  },
  modalContent: {
    gap: 12,
  },
});
