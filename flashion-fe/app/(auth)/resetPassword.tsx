import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import {Feather} from "@expo/vector-icons";
import * as Linking from "expo-linking";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  subtitle: { color: "#666", marginBottom: 32, lineHeight: 20 },
  label: { fontSize: 14, marginBottom: 4 },
  inputWrapper: { position: "relative", justifyContent: "center", marginBottom: 16 },
  leftIcon: { position: "absolute", left: 12, zIndex: 10 },
  rightIcon: { position: "absolute", right: 12, zIndex: 10 },
  input: {
    height: 54, backgroundColor: "#f2f2f2", borderRadius: 12,
    paddingHorizontal: 16, paddingLeft: 44, paddingRight: 44, fontSize: 16, color: "#000",
  },
  button: {
    height: 54, backgroundColor: "#6a5acd", borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
})

export default function ResetPasswordScreen(){
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPasssword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [ready, setReady] = useState(false); 

    const router = useRouter();
    
    useEffect(()=>{
        const handleDeepLink = async (url:string)=>{
            //Handle deep link and extract access token
            if (!url) return;

            //Parse the URL token from Fragment or Query Params
            const fragment = url.split('#')[1] || url.split('?')[1];
            if (!fragment) return;
            
            const params = new URLSearchParams(fragment);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken){
                const {error} = await supabase.auth.setSession({access_token: accessToken, refresh_token: refreshToken})
                if(!error) setReady(true);
                else Alert.alert("Error", "Failed to set session. Please try again.");
            }
            
        }

        //Open the app from the deep link
        Linking.getInitialURL().then((url)=>{
            if (url) handleDeepLink(url);

        })

        const subscription = Linking.addEventListener('url', (event)=>{
            handleDeepLink(event.url);
        })

        return ()=>subscription.remove();
    },[])
    
    const handleResetPassword = async ()=>{
        if(!password || !confirmPassword){
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if(password !== confirmPassword){
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        //Add any additional password validation here (length, complexity, etc)

        setLoading(true);
        const {error} = await supabase.auth.updateUser({password});
        setLoading(false);

        
    }
}