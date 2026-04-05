import React, { useState } from "react"
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import validateSignUp from "../../utils/FormValidation";
import {supabase} from "@/utils/supabase";
import AppModal from "@/_components/AppModal";
import { useRouter } from "expo-router";

// interface LoginScreenProps {
//   onLogin: () => void
//   onSignUp: () => void
// }

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");

    const router = useRouter();

    // const handleSubmit = () => {
    //     if (isLogin) onLogin()
    //     else onSignUp()
    // }

    const handleForgotPassword = ()=>{
        router.push("/(auth)/forgotPassword");
    }

    const handleSignInManual = async () =>{
        const {data, error} = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if(error){
            Alert.alert("Login Failed", error.message);
        }else{
            Alert.alert("Login Successful", "You have been logged in successfully.");
            router.replace("/(tabs)");
        }

        // router.replace("/(tabs)");
    }


    const handleSignUpManual = async () =>{
        try{
            
            if (!name) {
                setShowModal(true);
                setModalTitle("Validation Error");
                setModalMessage("Name cannot be empty.");
                return;
            }

            if (!email) {
                setShowModal(true);
                setModalTitle("Validation Error");
                setModalMessage("Email cannot be empty.");
                return;
            }

            if (!password) {
                setShowModal(true);
                setModalTitle("Validation Error");
                setModalMessage("Password cannot be empty.");
                return;
            }

            const validationResult = validateSignUp({ name, email, password });
            if (!validationResult) {
                setShowModal(true);
                setModalTitle("Validation Error");
                setModalMessage("Please ensure all fields are filled out correctly.");
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data:{
                        name:name
                    }
                }
            });

            if (error) {
                setShowModal(true);
                setModalTitle("Sign Up Failed");
                setModalMessage(error.message);
                return;
            }else{
                setShowModal(true);
                setModalTitle("Sign Up Successful");
                setModalMessage("Your account has been created successfully");
                // setIsLogin(true);
                // return
            }
        }catch(error){
            console.error("Sign Up error:", error);
            Alert.alert("Sign Up Failed", "An error occurred during sign up. Please try again.");
        }
    }

    const submitForm = () => {
        if (isLogin) {
            handleSignInManual();
        } else {
            handleSignUpManual();
        }
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#fff",
            paddingHorizontal: 24,
            paddingTop: 60,
        },
        header: { alignItems: "center", marginBottom: 40 },
        logoBox: {
            width: 60,
            height: 60,
            backgroundColor: "#ddd",
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
        },
        logoText: { fontSize: 28, fontWeight: "bold" },
        title: { fontSize: 24, fontWeight: "600", marginBottom: 6 },
        subtitle: { color: "#666", textAlign: "center" },

        form: { gap: 16 },
        inputGroup: {},
        label: { fontSize: 14, marginBottom: 4 },
        input: {
            height: 54,
            backgroundColor: "#f2f2f2",
            borderRadius: 12,
            paddingHorizontal: 16,
            fontSize: 16,
            color: "#000",
        },
        inputIconWrapper: { position: "relative", justifyContent: "center" },
        leftIcon: { position: "absolute", left: 12, zIndex: 10 },
        rightIcon: { position: "absolute", right: 12, zIndex: 10 },

        forgot: { color: "#6a5acd", fontSize: 14, marginTop: 6 },

        button: {
            height: 54,
            backgroundColor: "#6a5acd",
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
        },
        buttonText: { color: "white", fontSize: 16, fontWeight: "600" },

        dividerBox: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 26,
        },
        divider: {
            flex: 1,
            height: 1,
            backgroundColor: "#ddd",
        },
        dividerText: {
            marginHorizontal: 10,
            color: "#666",
            fontSize: 13,
        },

        socialRow: { flexDirection: "row", gap: 12 },
        socialButton: {
            flex: 1,
            height: 54,
            borderRadius: 12,
            backgroundColor: "#f2f2f2",
            alignItems: "center",
            justifyContent: "center",
        },

        toggleText: {
            marginTop: 30,
            textAlign: "center",
            color: "#666",
            fontSize: 14,
        },
        toggleLink: {
            color: "#6a5acd",
            fontWeight: "600",
        },
    })

  return (
    <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                    <Text style={styles.logoText}>W</Text>
                    </View>
                    <Text style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
                    <Text style={styles.subtitle}>
                    {isLogin ? "Sign in to access your wardrobe" : "Start organizing your wardrobe today"}
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {!isLogin && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                        placeholder="Your name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholderTextColor="#888"
                        />
                    </View>
                    )}

                    {/* Email */}
                    <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputIconWrapper}>
                        <MaterialIcons name="mail-outline" size={20} color="#888" style={styles.leftIcon} />
                        <TextInput
                        placeholder="your@email.com"
                        value={email}
                        onChangeText={setEmail}
                        style={[styles.input, { paddingLeft: 44 }]}
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        />
                    </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputIconWrapper}>
                        <Feather name="lock" size={20} color="#888" style={styles.leftIcon} />
                        <TextInput
                        placeholder="Enter password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        style={[styles.input, { paddingLeft: 44, paddingRight: 44 }]}
                        placeholderTextColor="#888"
                        />
                        <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={() => setShowPassword(!showPassword)}
                        >
                        <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#888" />
                        </TouchableOpacity>
                    </View>
                    </View>

                    {isLogin && (
                    <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: "flex-end" }}>
                        <Text style={styles.forgot}>Forgot password?</Text>
                    </TouchableOpacity>
                    )}

                    {/* Submit */}
                    <TouchableOpacity style={styles.button} onPress={submitForm}>
                    <Text style={styles.buttonText}>{isLogin ? "Sign In" : "Create Account"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.dividerBox}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.divider} />
                </View>

                {/* Social buttons */}
                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialButton}>
                    <Text>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                    <Text>Apple</Text>
                    </TouchableOpacity>
                </View>

                {/* Toggle */}
                <Text style={styles.toggleText}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <Text style={styles.toggleLink} onPress={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Sign Up" : "Sign In"}
                    </Text>
                </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        <AppModal
        visible={showModal}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setShowModal(false)}
        />

    </>
  )
}


