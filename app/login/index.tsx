import { Text, View, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import {Eye, EyeOff, Mail, Lock, ArrowRight} from "lucide-react-native";
import { FontAwesome5 } from "@expo/vector-icons";


export default function Index(){
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
    const [isLogin, setIsLogin] = useState<boolean>(true);

    return(
        /** Login Form */
        <View>
            
            {/**Title section */}
            <View>
                <Text>Welcome</Text>
                <Text>Sign in to access your wardrobe</Text>
            </View>

            {/**Credentials */}
            <View>
                {/**Username */}
                <View>
                    <Text>Username</Text>
                    <View>
                        <Mail></Mail>
                        <TextInput placeholder="Enter username" />
                    </View>
                </View>

                {/**Paswword */}
                <View>
                    <Text>Password</Text>
                    <View>
                        <Lock></Lock>
                        <TextInput 
                            placeholder="Enter password" 
                            secureTextEntry = {isShowPassword}
                            keyboardType="default"
                            />
                        (
                            {isShowPassword ? (
                                <EyeOff onPress={() => setIsShowPassword(e => !e)} />
                                ) : (
                                <Eye onPress={() => setIsShowPassword(e => !e)} />
                            )}
                        )
                    </View>
                </View>
                
                {/**Forgot password */}
                <Text>Forgot password?</Text>
            </View>
            
            {/**Bottom section */}
            <View>
                {/**Upper*/}
                <View>
                    <TouchableOpacity>
                        <Text>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                        <ArrowRight></ArrowRight>
                    </TouchableOpacity>
                </View>
                
                {/**Divider */}
                
                <View>
                    <View></View>
                
                    <Text>or continue with</Text>

                    <View></View>
                </View>
                
                {/**Lower */}
                <View>
                    <TouchableOpacity>
                        <FontAwesome5 name="google" size={24} color="black" />
                        <Text>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <FontAwesome5 name="facebook" size={24} color="black" />
                        <Text>Facebook</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    )
}