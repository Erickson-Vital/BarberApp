import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    ImageBackground,
} from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import {
    Roboto_400Regular,
    Roboto_500Medium
} from '@expo-google-fonts/roboto';
import { useNavigation } from '@react-navigation/native';

import api from '../../src/services/api';
import logo from '../../assets/logo.png';
import { ActivityIndicator } from 'react-native-paper';

// export default function register({ navigation }) {
export default function register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [btnActive, setBtnActive] = useState(false);
    const [loading, setLoading] = useState(false)

    const navigation = useNavigation();

    const [fontsLoaded] = useFonts({
        Roboto_500Medium, Roboto_400Regular,
    });

    const handle_register = async () => {
        setBtnActive(true);
        setLoading(true)
        await api.post('/api/users/profile/create', {
            nome: name,
            email: email,
            senha: pass,
            telefone: '(00) 00000-0000',
        }).then(() => {
            Alert.alert(
                'Sucesso:',
                'Seu perfil foi cadastrado. Você já pode conectar-se ao aplitivo.'
            )
            setLoading(false)
            navigation.navigate("LoginCliente");
        }).catch((error) => {
            setBtnActive(false);
            if (error.response.status == 400) {
                if (!error.response.data.details.error) {
                    Alert.alert('Erro na Validação', error.response.data.details)
                    return
                }
                setLoading(false)
                Alert.alert('Erro na Validação', 'Digite um Email com o formato  exemplo@email.com, um nome e uma senha com no mínimo 8 caracteres')
            } else {
                Alert.alert('Erro no Sistema', error.response.data.details)
            }
        })
    };

    return (!fontsLoaded) ?
        (
            <></>
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
                        size={25}
                        color="white"
                        onPress={() => {
                            navigation.navigate("Select");
                        }}
                        style={{
                            alignSelf: 'flex-start',
                            paddingTop: 40,
                            paddingLeft: 25
                        }}
                    />

                    <View style={{
                        width: "100%",
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Image
                            style={styles.image}
                            source={logo}
                        />

                        <View style={styles.controler}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu Nome"
                                placeholderTextColor="#fff"
                                autoCompleteType="name"
                                value={name}
                                onChangeText={(e) => {
                                    setName(e);
                                }}
                                editable={!btnActive}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu Email"
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
                                placeholder="Digite sua Senha"
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
                                style={styles.botaoRegister}
                                onPress={handle_register}
                                disabled={(btnActive) ? true : (((email != '') && (pass != '') && (name != '')) ? false : true)}
                            >
                                {
                                    loading ?
                                        <ActivityIndicator color={"#fff"} />
                                        :
                                        <Text
                                            style={{
                                                color: "#fff",
                                                fontSize: 17,
                                                fontFamily: 'Roboto_500Medium'
                                            }}
                                        >Registre-se</Text>

                                }

                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={btnActive}
                                onPress={() => {
                                    navigation.navigate("LoginCliente");
                                }}
                            >
                                <Text
                                    style={{
                                        color: "white",
                                        fontSize: 16,
                                        paddingTop: 5,
                                        fontFamily: 'Roboto_400Regular'
                                    }}
                                >Já tem uma conta ? <Text style={{
                                    color: "#EA4335",
                                    fontSize: 17,
                                    paddingTop: 5,
                                    fontFamily: 'Roboto_400Regular'
                                }}>Login</Text></Text>
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
    botaoRegister: {
        width: "99%",
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: "#262626",
    },
    textFaçaLogin: {
        color: "#fff",
        fontSize: 16,
        paddingTop: 5,
        fontFamily: 'Roboto_400Regular'
    },
    textConta: {
        color: "#fff",
        fontSize: 16,
        paddingTop: 5,
        fontFamily: 'Roboto_400Regular'
    },
});
