import { useState } from "react";
import {View, Text, KeyboardAvoidingView, StyleSheet, TextInput, TouchableOpacity, Alert, Platform} from "react-native";
import {supabase} from '@/utils/supabase';
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 60 },
  backButton: { marginBottom: 32 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  subtitle: { color: "#666", marginBottom: 32, lineHeight: 20 },
  label: { fontSize: 14, marginBottom: 4 },
  inputWrapper: { position: "relative", justifyContent: "center", marginBottom: 16 },
  leftIcon: { position: "absolute", left: 12, zIndex: 10 },
  input: {
    height: 54, backgroundColor: "#f2f2f2", borderRadius: 12,
    paddingHorizontal: 16, paddingLeft: 44, fontSize: 16, color: "#000",
  },
  button: {
    height: 54, backgroundColor: "#6a5acd", borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
})

export default function ForgotPasswordScreen(){
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handlePasswordReset = async () =>{
        const redirectTo = __DEV__
            ? Linking.createURL('/resetPassword')   // expo go: exp://192.168.x.x:8081/resetPassword
            : 'flashion://resetPassword';           // production

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        setLoading(false);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            Alert.alert("Success", "Password reset email sent. Please check your inbox.");
        }
    }

    return (
        <KeyboardAvoidingView
            style = {styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <TouchableOpacity onPress={()=>router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>

            <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={24} color="#666" style={styles.leftIcon} />
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <TouchableOpacity
                onPress={handlePasswordReset}
                disabled={loading}
                style={[styles.button, {opacity: loading ? 0.7 : 1}]}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}