import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Platform,
    Alert,
    Button,
    ActivityIndicator,
    Modal,
    Picker
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import {
    Roboto_400Regular,
    Roboto_500Medium
} from '@expo-google-fonts/roboto';
import { TextInputMask } from 'react-native-masked-text';
import { FontAwesome } from '@expo/vector-icons';

import bs_default_img from '../../assets/barber.png';
import api from '../../src/services/api';
import { useAuth } from '../../src/hooks/auth';
import { Ionicons } from '@expo/vector-icons';

export default function ({ navigation, props }) {
    const [fontsLoaded] = useFonts({
        Roboto_500Medium, Roboto_400Regular,
    });
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const [imageProfile, setImageProfile] = useState('');
    const [userID, setUserID] = useState(-1);

    const [name_const, setNameConst] = useState('');
    const [email_const, setEmailConst] = useState('');
    const [telefone_const, setTelefoneConst] = useState('');
    const [loadingphoto, setLoadingPhoto] = useState(false)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');

    const [ModalFeedback, setModalFeedback] = useState(false)
    const [ModalAjuda, setModalAjuda] = useState(false)
    const [ModalCentraldeAjuda, setModalCentraldeAjuda] = useState(false)

    const [tipoFeedback, setTipoFeedback] = useState("melhoria")

    const [ComentarioFeedback, setComentarioFeedback] = useState("")

    const [btnActive, setBtnActive] = useState(false);

    const { signOut, user } = useAuth();

    useEffect(() => {
        setUserID(user.id);
        setName(user.nome);
        setNameConst(user.nome);
        setEmail(user.email);
        setEmailConst(user.email);
        setTelefone(user.telefone);
        setTelefoneConst(user.telefone);
        setImageProfile((user.foto !== null) ? user.foto : '');
    }, []);

    const changePhoto = async () => {
        setBtnActive(true);
        setLoadingPhoto(true)
        Alert.alert("Foto de perfil", "", [
            {
                text: "Mudar foto",
                onPress: async () => {
                    if (Platform.OS === 'web') {
                        Alert.alert('Aviso:', 'Esta função não funciona na web.');
                        setBtnActive(false)
                        return;
                    }

                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

                    if (status !== 'granted') {
                        Alert.alert('Aviso:', 'Nâo há permissão para selecionar a foto da galeria.');
                        setBtnActive(false)
                        return;
                    }

                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [4, 4],
                        quality: 0.5,
                        base64: true
                    });

                    if (result.cancelled) {
                        setBtnActive(false)
                        setLoadingPhoto(false)
                        return;
                    }

                    if (userID === -1) {
                        Alert.alert('Aviso:', 'Usuário não foi validado.');
                        setBtnActive(false)
                        return;
                    }
                    const base64Img = `data:image/jpg;base64,${result.base64}`;

                    await api.post('/api/users/profile/photo', {
                        photo_img: base64Img,
                    }).then(async (photo_update) => {
                        const user_updated = JSON.parse(await AsyncStorage.getItem("@eBarber:user"));

                        user_updated.foto = photo_update.data.details;

                        await AsyncStorage.setItem("@eBarber:user", JSON.stringify(user_updated));

                        setImageProfile(photo_update.data.details);

                        Alert.alert(
                            'Aviso:',
                            'Foto alterada com sucesso.'
                        );
                    }).catch((error) => {
                        console.log(error)
                    }).finally(() => {
                        setLoadingPhoto(false)
                    })

                    setBtnActive(false)
                }
            },
            {
                text: "Cancelar",
                style: 'cancel',
                onPress: () => {
                    setBtnActive(false)
                    setLoadingPhoto(false)
                }
            }
        ], {
            cancelable: false
        });
    };

    // const handleUpdateProfile = async () => {
    const handleUpdateProfile = async () => {
        setBtnActive(true);

        try {
            const userUpdate = {}
            if (name != user.nome) {
                userUpdate.nome = name
            }
            if (email != user.email) {
                if (user.facebook !== 1 && user.google !== 1) {
                    userUpdate.email = email
                }
            }
            if (telefone != user.telefone) {
                userUpdate.telefone = telefone
            }
            await api.put('/api/users/profile/update', userUpdate),

                await AsyncStorage.setItem("@eBarber:user", JSON.stringify({
                    facebook: user.facebook,
                    foto: user.foto,
                    google: user.google,
                    id: user.id,
                    nome: name,
                    email: email,
                    telefone: telefone
                }));

            setNameConst(name);
            setEmailConst(email);
            setTelefoneConst(telefone);
            setBtnActive(false);
        } catch (error) {
            const { details } = error.response.data;

            if (details) {
                Alert.alert("Aviso:", details);

            } else {
                Alert.alert(
                    "Aviso:",
                    "Não foi possível atualizar seu perfil neste momento. Por favor, tente novamente em breve."
                );
            }

        }

        setBtnActive(false);
    };

    return (!fontsLoaded) ?
        (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size='large' color='red' />
            </View>
        )
        :
        (

            <View
                style={{
                    backgroundColor: '#262626',
                    flex: 1,
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                }}
            >
                <View style={styles.container}>
                    <View style={{
                        width: 200,
                        height: 200,
                        marginBottom: 25,
                        borderRadius: 100,
                        marginTop: -70,
                        backgroundColor: 'white'
                    }}>
                        <TouchableOpacity
                            style={styles.cardUser}
                            disabled={btnActive}
                            onPress={changePhoto}
                        >
                            {
                                loadingphoto ? <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}><ActivityIndicator size={40} color="black" /></View> :
                                    (imageProfile !== '') ?
                                        (
                                            <Image
                                                style={styles.image}
                                                source={{ uri: imageProfile }}
                                            />
                                        )
                                        :
                                        (
                                            <Image
                                                style={styles.image}
                                                source={bs_default_img}
                                            />
                                        )
                            }
                        </TouchableOpacity>
                    </View>

                    <View styles={styles.inputContainer}>
                        <Text style={styles.textDetails}>DETALHES PESSOAIS</Text>

                        <TextInput
                            placeholder="Seu Nome"
                            placeholderTextColor="#000"
                            style={styles.nameInput}
                            value={name}
                            onChangeText={(e) => {
                                setName(e);
                            }}
                            editable={!btnActive}
                        />

                        <TextInputMask
                            type={'cel-phone'}
                            options={{
                                maskType: 'BRL',
                                withDDD: true,
                                dddMask: '(99) '
                            }}
                            editable={!btnActive}
                            placeholder="Seu Telefone"
                            placeholderTextColor="#000"
                            keyboardType='decimal-pad'
                            style={styles.nameInput}
                            value={telefone}
                            onChangeText={(e) => {
                                setTelefone(e);
                            }}
                        />
                        {
                            !user.facebook && !user.google &&
                            <TextInput
                                placeholder="Seu Email"
                                placeholderTextColor="#000"
                                style={styles.nameInput}
                                value={email}
                                onChangeText={(e) => {
                                    setEmail(e);
                                }}
                                editable={!btnActive}
                            />
                        }


                        {
                            (name !== name_const || email != email_const || telefone != telefone_const) &&
                            <TouchableOpacity
                                style={styles.botao}
                                disabled={((
                                    name === name_const &&
                                    email === email_const &&
                                    telefone === telefone_const) ||
                                    btnActive)
                                }
                                onPress={handleUpdateProfile}
                            >
                                <Text
                                    style={{
                                        color: "#FFF",
                                        fontSize: 17,
                                        fontFamily: 'Roboto_500Medium'
                                    }}
                                >Atualizar</Text>
                            </TouchableOpacity>

                        }


                        <TouchableOpacity
                            style={styles.botao}
                            disabled={btnActive}
                            onPress={signOut}
                        >
                            <Text
                                style={{
                                    color: "#FFF",
                                    fontSize: 17,
                                    fontFamily: 'Roboto_500Medium'
                                }}
                            >Sair</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.btnConfig}
                    onPress={() =>
                        navigation.navigate('SettingsProfile')
                    }>
                    <FontAwesome name="gears" size={25} color="white" />
                </TouchableOpacity>
            </View >
        );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '80%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: "#fff",
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 100,
    },
    textDetails: {
        alignSelf: 'flex-start',
        color: "#000",
        marginLeft: 5,
        marginBottom: 10,
        fontFamily: 'Roboto_500Medium',
    },
    cardUser: {
        width: "100%",
        height: "100%",
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2
    },
    modalView: {
        width: "80%",
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    nameInput: {
        width: 350,
        height: 50,
        borderWidth: 2,
        borderColor: "#FFF",
        borderRadius: 15,
        paddingLeft: 15,
        fontSize: 17,
        backgroundColor: "whitesmoke",
    },
    inputContainer: {
        width: "100%",
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    botao: {
        width: 350,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: "#262626",
        marginTop: 5,
    },
    btnConfig: {
        backgroundColor: '#262626',
        width: 50,
        height: 50,
        position: 'absolute',
        right: 0,
        bottom: 0,
        marginRight: 20,
        marginBottom: 20,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
});
