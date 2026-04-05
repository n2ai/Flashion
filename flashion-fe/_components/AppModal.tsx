import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";

type AppModalProps = {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
};

export default function AppModal({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  confirmText,
}: AppModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* overlay */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* stop closing when press inside */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>Close</Text>
            </TouchableOpacity>

            {onConfirm && (
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                <Text style={styles.btnPrimaryText}>{confirmText || "OK"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
    zIndex: 9999,  
},
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  message: { fontSize: 14, color: "#444", marginBottom: 16 },
  row: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, minWidth: 90, alignItems: "center" },
  btnGhost: { backgroundColor: "#f1f1f1" },
  btnGhostText: { color: "#222", fontWeight: "600" },
  btnPrimary: { backgroundColor: "#6a5acd" },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
});
