import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    Button,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ImageBackground,
    Alert,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import {
    Roboto_400Regular,
    Roboto_500Medium
} from '@expo-google-fonts/roboto';
import { useNavigation } from '@react-navigation/native';

import logo from '../../assets/logo.png';

import { useAuth } from '../../src/hooks/auth';

export default function login({ nav }) {
    const [fontsLoaded] = useFonts({
        Roboto_500Medium, Roboto_400Regular,
    });

    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const [btnActive, setBtnActive] = useState(false);

    const { signIn, loadingUser } = useAuth();

    const handleSignIn = useCallback(async (data) => {
        await signIn({
            email: data.email,
            password: data.pass,
        })

    }, [signIn]);

    return (!fontsLoaded) ?
        (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size='large' color='red' />
            </View>
        )
        :
        (
            <ImageBackground source={require('../../assets/login.png')} style={styles.imageBackground}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <SimpleLineIcons
                        name="arrow-left"
                        size={24}
                        color="white"
                        onPress={() => {
                            if (btnActive) return;
                            navigation.navigate("Select");
                        }}
                        style={{
                            alignSelf: 'flex-start',
                            paddingTop: 45,
                            paddingLeft: 25
                        }}
                    />

                    <View
                        style={{
                            width: "100%",
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Image
                            style={styles.image}
                            source={logo}
                        />

                        <View style={styles.controler}>
                            <TextInput

                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#fff"
                                autoCompleteType="email"
                                value={email}
                                onChangeText={(e) => {
                                    setEmail(e);
                                }}
                                editable={!btnActive}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Senha"
                                placeholderTextColor="#fff"
                                autoCompleteType="password"
                                secureTextEntry
                                value={pass}
                                onChangeText={(e) => {
                                    setPass(e);
                                }}
                                editable={!btnActive}
                            />

                            <TouchableOpacity
                                style={styles.botaoLogin}
                                // onPress={handleLogin}
                                onPress={() => handleSignIn({ email, pass })}
                                disabled={(btnActive) ? true : (((email != '') && (pass != '')) ? false : true)}
                            >
                                {
                                    loadingUser ?
                                        <ActivityIndicator color={"#fff"} />
                                        :
                                        <Text
                                            style={{
                                                color: "#fff",
                                                fontSize: 17,
                                                fontFamily: 'Roboto_500Medium'
                                            }}
                                        >Entrar</Text>

                                }
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={btnActive}
                                style={{ marginTop: 20 }}
                                onPress={() => {
                                    navigation.navigate("RegisterCliente");
                                }}
                            >
                                <Text
                                    style={{
                                        color: "white",
                                        fontSize: 16,
                                        paddingTop: 5,
                                        fontFamily: 'Roboto_400Regular'
                                    }}
                                >Ainda não tem conta? <Text style={{
                                    color: "#EA4335",
                                    fontSize: 17,
                                    paddingTop: 5,
                                    fontFamily: 'Roboto_400Regular'
                                }}>Registre-se</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView >
            </ImageBackground>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    imageBackground: {
        width: "100%",
        height: "100%",
    },
    controler: {
        width: "80%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: "100%",
        height: "40%",
        marginBottom: 10,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 2,
        paddingHorizontal: 10,
        borderColor: "#262626",
        borderRadius: 11,
        paddingVertical: 2,
        marginBottom: 7,
        paddingLeft: 15,
        fontSize: 17,
        backgroundColor: "rgba(38, 38, 38,0.1)",
        color: "#fff",
    },
    botaoLogin: {
        width: "99%",
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: "#262626",
    },
});
