import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

interface AccountSettingsProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface AccountSettingsFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface FormErrors {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8000";

const EMPTY_FORM: AccountSettingsFormData = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

export default function AccountSettings({ visible, onClose, onSuccess }: AccountSettingsProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<AccountSettingsFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    // Reset form when modal closes
    useEffect(() => {
        if (!visible) {
            setFormData(EMPTY_FORM);
            setErrors({});
            setLoading(false);
            setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
        }
    }, [visible]);

    const handleInputChange = (field: keyof AccountSettingsFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error on change
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const toggleShowPassword = (field: keyof typeof showPasswords) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = "Current password is required";
        }
        if (!formData.newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your new password";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    userId: user?.id,
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json().catch(() => null);
                const message = data?.message || "Failed to change password. Please try again.";
                Alert.alert("Error", message);
            }
        } catch (error) {
            Alert.alert("Error", "Network error. Please check your connection and try again.");
            console.error("Error changing password:", error);
        } finally {
            setLoading(false);
        }
    };

    const fields: { key: keyof AccountSettingsFormData; label: string; placeholder: string }[] = [
        { key: "currentPassword", label: "Current Password", placeholder: "Enter current password" },
        { key: "newPassword", label: "New Password", placeholder: "At least 8 characters" },
        { key: "confirmPassword", label: "Confirm New Password", placeholder: "Re-enter new password" },
    ];

    return (
        <Modal
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
            presentationStyle="pageSheet"
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={onClose} style={styles.backButton} hitSlop={8}>
                        <Ionicons name="arrow-back" size={20} color="#1F2937" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Form */}
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.subtitle}>
                        Choose a strong password with at least 8 characters.
                    </Text>

                    {fields.map(({ key, label, placeholder }) => (
                        <View key={key} style={styles.fieldGroup}>
                            <Text style={styles.label}>{label}</Text>
                            <View style={[styles.inputWrapper, errors[key] ? styles.inputError : null]}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showPasswords[key]}
                                    value={formData[key]}
                                    onChangeText={(text) => handleInputChange(key, text)}
                                    placeholder={placeholder}
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <Pressable
                                    onPress={() => toggleShowPassword(key)}
                                    hitSlop={8}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showPasswords[key] ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </Pressable>
                            </View>
                            {errors[key] ? (
                                <Text style={styles.errorText}>{errors[key]}</Text>
                            ) : null}
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitText}>Update Password</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAF9F6",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#FAF9F6",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1F2937",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 48,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 28,
        lineHeight: 20,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        height: 52,
        borderRadius: 12,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 14,
    },
    inputError: {
        borderColor: "#EF4444",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#1F2937",
        height: "100%",
    },
    eyeButton: {
        padding: 4,
    },
    errorText: {
        fontSize: 12,
        color: "#EF4444",
        marginTop: 6,
        marginLeft: 2,
    },
    submitButton: {
        height: 54,
        borderRadius: 14,
        backgroundColor: "#1F2937",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
    },
});