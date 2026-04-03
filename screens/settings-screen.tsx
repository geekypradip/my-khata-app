import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
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
import { FormField, PillButton } from "@/components/forms";
import { useAppData } from "@/hooks/use-app-data";

export function SettingsScreen() {
  const { data, isLoading, exportBackup, importBackup, updateReportOwnerName } = useAppData();
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isReportNameOpen, setIsReportNameOpen] = useState(false);
  const [reportOwnerName, setReportOwnerName] = useState(
    data.settings?.reportOwnerName || "My Khata",
  );
  const currentReportOwnerName = data.settings?.reportOwnerName || "My Khata";
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const androidVersionCode = Constants.expoConfig?.android?.versionCode;

  useEffect(() => {
    setReportOwnerName(currentReportOwnerName);
  }, [currentReportOwnerName]);

  if (isLoading) {
    return <LoadingState />;
  }

  const handleExport = async () => {
    const result = await exportBackup();
    Alert.alert(
      result.success ? "Backup ready" : "Backup failed",
      result.message,
    );
  };

  const handleImport = async () => {
    const result = await importBackup();
    Alert.alert(
      result.success ? "Restore complete" : "Restore status",
      result.message,
    );
  };

  const handleSaveReportOwnerName = async () => {
    await updateReportOwnerName(reportOwnerName);
    setIsReportNameOpen(false);
    Alert.alert("Saved", "Report name updated for future PDF exports.");
  };

  return (
    <AppShell title="Settings" subtitle="Manage backup and report preferences.">
      <>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App version</Text>
            <Text style={styles.sectionText}>Version: {appVersion}</Text>
            {androidVersionCode ? (
              <Text style={styles.sectionText}>Android build: {androidVersionCode}</Text>
            ) : null}
            <View style={styles.supportRow}>
              <MaterialIcons name="mail-outline" size={18} color="#23423b" />
              <View style={styles.supportTextWrap}>
                <Text style={styles.sectionText}>
                  Report bugs or share suggestions:
                </Text>
                <Pressable
                  onPress={() => void Linking.openURL("mailto:dev.pradip.mandal@gmail.com")}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.emailText}>dev.pradip.mandal@gmail.com</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Pressable
              onPress={() => setIsBackupOpen((current) => !current)}
              style={({ pressed }) => [
                styles.rowHeader,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.rowHeaderText}>
                <Text style={styles.sectionTitle}>Data backup</Text>
                <Text style={styles.sectionText}>
                  Export or restore all app data.
                </Text>
              </View>
              <MaterialIcons
                name={isBackupOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color="#23423b"
              />
            </Pressable>
            {isBackupOpen ? (
              <>
                <Text style={styles.sectionText}>
                  Export everything into one JSON file and restore it later from
                  local storage or a shared backup.
                </Text>
                <View style={styles.row}>
                  <PillButton title="Export JSON backup" onPress={handleExport} />
                  <PillButton
                    title="Import backup"
                    onPress={handleImport}
                    tone="secondary"
                  />
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.section}>
            <Pressable
              onPress={() => setIsReportNameOpen(true)}
              style={({ pressed }) => [
                styles.rowHeader,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.rowHeaderText}>
                <Text style={styles.sectionTitle}>Change report provider name</Text>
                <Text style={styles.sectionText}>
                  Current: {currentReportOwnerName}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#23423b" />
            </Pressable>
          </View>
        </ScrollView>

        <Modal
          visible={isReportNameOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsReportNameOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setIsReportNameOpen(false)} />
            <View style={styles.modalCard}>
              <Text style={styles.sectionTitle}>Change report provider name</Text>
              <Text style={styles.sectionText}>
                This name appears in the PDF report footer.
              </Text>
              <FormField
                label="Report name"
                value={reportOwnerName}
                onChangeText={setReportOwnerName}
                placeholder="Enter name to show in reports"
              />
              <View style={styles.row}>
                <PillButton title="Save report name" onPress={handleSaveReportOwnerName} />
                <PillButton
                  title="Cancel"
                  onPress={() => setIsReportNameOpen(false)}
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
    paddingBottom: 32,
    gap: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d8e4de",
    padding: 16,
    gap: 10,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowHeaderText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#102a24",
  },
  sectionText: {
    fontSize: 14,
    color: "#4c655f",
  },
  row: {
    gap: 12,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 6,
  },
  supportTextWrap: {
    flex: 1,
    gap: 2,
  },
  emailText: {
    fontSize: 14,
    color: "#0f766e",
    fontWeight: "600",
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
  pressed: {
    opacity: 0.84,
  },
});
