import React, {
    useContext,
    useState,
    useCallback,
    useEffect
} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    ActivityIndicator,
    ImageBackground,
} from 'react-native';
import { MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
//import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import {
    Roboto_400Regular,
    Roboto_500Medium
} from '@expo-google-fonts/roboto';

import { useAuth } from '../../src/hooks/auth';
// import api from '../../src/services/api';

// Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//         shouldPlaySound: false,
//         shouldSetBadge: false,
//         shouldShowAlert: true
//     })
// });

export default function loginBarber({ navigation }) {
    const [fontsLoaded] = useFonts({
        Roboto_500Medium, Roboto_400Regular,
    });

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const [btnActive, setBtnActive] = useState(false);

    const { signInBarber, loadingBarber, Assinatura, setData, BarbeiroAssinaturaCancelado } = useAuth();

    const handleSignIn = useCallback(
        async (data) => {
            await signInBarber({
                email: data.email,
                password: data.pass,
            });
        },
        [signInBarber]
    );
    useEffect(() => {
        if (typeof Assinatura == 'object') {
            navigation.navigate('ReactivateAccount', BarbeiroAssinaturaCancelado)
        }
        setData({})
    }, [Assinatura])

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
                    {
                        /*
                        <MaterialIcons name="attach-money" size={24}
                        size={30}
                        color="white"
                        onPress={() => {
                            if (btnActive) return;
                            navigation.navigate("ReactivateAccount");
                        }}
                        style={{
                            position: 'absolute',
                            right: 0,
                            alignSelf: 'flex-end',
                            paddingTop: 45,
                            paddingRight: 25
                        }}
                    />
                        */
                    }


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
                            source={require('../../assets/logo.png')}
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
                                onPress={() => handleSignIn({ email, pass })}
                                disabled={(btnActive) ? true : (((email != '') && (pass != '')) ? false : true)}
                            >
                                {
                                    loadingBarber ?
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

                            <TouchableOpacity disabled={btnActive} onPress={() => {
                                navigation.navigate("RegisterBarber");
                            }}>
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
                </KeyboardAvoidingView>
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
        backgroundColor: "rgba(38, 38, 38, 0.1)", // rgba(38, 38, 38, 0.50) Azul = rgba(0,123,255,0.50)
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
