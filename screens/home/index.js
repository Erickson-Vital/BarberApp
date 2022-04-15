import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Card from '../../components/card';
import { useFonts } from 'expo-font';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import api from '../../src/services/api';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import ListaEstados from '../../src/services/ListaEstados'

export default function Home({ navigation }) {
    const [location, setLocation] = useState(null);
    const [fontsLoaded] = useFonts({
        Roboto_500Medium, Roboto_400Regular,
    });
    const [barbers, setBarbers] = useState([]);
    const [inputText, setInputText] = useState('');
    const [cidade, setCity] = useState("")
    const [estado, setState] = useState("")
    const [loading, setLoading] = useState(false)
    const [showWarningLocation, setShowWarningLocation] = useState(false)
    const load_barber_shops = (state, city) => {
        api.post('/api/barbearia/best', {
            state: state,
            city: city
        }).then((response) => {
            if (response.data.details.barbers) {
                setBarbers(response.data.details.barbers);
            }
            setLoading(false)
        }).catch((error) => {
            console.log(error)
        })
        setLoading(false)
    };

    const getPosition = () => {
        Location.watchPositionAsync({ distanceInterval: 50 }, location => { //TODO: 50 é a distancia percorida do usuario e depois ele ira fazer uma nova requisicao
            if (!location.coords) return setLoading(false) // TODO: Colocar msg de error
            const { latitude, longitude } = location.coords;
            Location.reverseGeocodeAsync({ latitude, longitude }).then(response => {
                let [{ region, subregion }] = response
                if (!region || !subregion) return setLoading(false) // TODO: Colocar msg de error
                setState(ListaEstados[region])
                setCity(subregion)
                load_barber_shops(ListaEstados[region], subregion);
            }).catch(err => {
                setLoading(false)
            })
        })
    }

    const Getlocation = async () => {
        Location.requestForegroundPermissionsAsync().then((result) => {
            if (result.status == "granted") {
                getPosition()
                return setShowWarningLocation(false)
            } else setShowWarningLocation(true) //console.log('Permission to access location was denied')
        })
    }

    useEffect(() => {
        let isAlive = true;
        setInterval(() => {
            Location.hasServicesEnabledAsync().then((item) => {
                if (!item) {
                    setShowWarningLocation(true)
                } else {
                    setShowWarningLocation(false)
                }
            })
        }, 1000);
        setLoading(true)

        Getlocation()
        return () => {
            isAlive = false;
        }

    }, []);

    return (!fontsLoaded) ?
        (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size='large' color='red' />
            </View>
        )
        :
        (
            <View style={styles.container}>
                {
                    showWarningLocation &&
                    <View style={{ position: 'absolute', width: '100%', zIndex: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 40, paddingBottom: 20, paddingLeft: 5, paddingRight: 5, bottom: 0 }}>
                        <View style={{ width: '90%', height: '100%', backgroundColor: '#fff', padding: 30, borderWidth: 3, borderWidth: 2, borderColor: '#000', marginTop: 20 }}>
                            <Text style={{ textAlign: 'justify' }}>Sua Localização está desativada, Ative para Mostrar as Barbearias mais Próximas de você:</Text>
                            <TouchableOpacity onPress={async () => {
                                await Getlocation()
                            }} style={{ backgroundColor: '#00aa00', height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                                <Text>Ativar
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                }

                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent
                />
                <View style={styles.iconSearch}>
                    <TouchableOpacity
                        value={inputText}
                        onSubmitEditing={() => {
                            navigation.navigate('Search', {
                                text: inputText,
                                city: cidade,
                                state: estado
                            })
                            // setInputText('');
                        }}
                        onChangeText={(e) => {
                            setInputText(e)
                        }}
                        onPress={() => {
                            navigation.navigate('Search', {
                                text: inputText,
                                city: cidade,
                                state: estado
                            })
                            // setInputText('');
                        }}
                    >
                        <Text style={{ color: "#C0C0C0", fontSize: 17, fontFamily: 'Roboto_500Medium' }}>Encontre seu barbeiro</Text>
                    </TouchableOpacity>

                    <FontAwesome
                        name="search"
                        size={24}
                        color="#C0C0C0" // #262626 #C0C0C0
                        onPress={() => {
                            navigation.navigate('Search', {
                                text: inputText,
                                city: cidade,
                                state: estado
                            })
                            // setInputText('');
                        }}
                    />
                </View>

                <SafeAreaView style={styles.cards}>
                    <ScrollView contentContainerStyle={{ minWidth: "100%" }} showsVerticalScrollIndicator={false}>
                        {loading ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                                <ActivityIndicator size='large' color='red' />
                            </View>
                        )

                            :
                            (barbers.length) ?
                                barbers.map((barber, index) => {
                                    return (
                                        barber &&
                                        <Card
                                            name={barber?.nome}
                                            key={`barber_${index}`}
                                            barber_id={barber?.barber_id}
                                            foto={barber?.foto}
                                            cover={barber?.cover}
                                            bairro={barber?.bairro}
                                            cidade={barber?.cidade}
                                            estado={barber?.estado}
                                            telefone={barber?.telefone}
                                            rua={barber?.rua}
                                            numero={barber?.numero}
                                            nav={navigation}
                                            evaluation_value={barber?.evaluation ? Math.round(barber?.evaluation) : 0}
                                        />
                                    )
                                }) :
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={styles.text}>Nenhuma Barbearia Encontrada na Região</Text>
                                </View>

                        }
                    </ScrollView>
                </SafeAreaView>
            </View >
        );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 35,
        flex: 1,
        alignItems: 'center',
        paddingBottom: 5,
        justifyContent: 'space-between',
        flexDirection: 'column',
        backgroundColor: "#202020",
    },
    text: {
        fontSize: 18,
        flex: 1,
        fontFamily: 'Roboto_500Medium',
        color: "#fff",
    },
    iconSearch: {
        textAlign: 'left',
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 15,
        width: "95%",
        backgroundColor: "#181818", // #262626 #1A1A1A
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    cards: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        width: "95%",
        flex: 1,
        paddingBottom: 5,
    },
    Location: {
        width: "95%",
        minHeight: "7%",
        marginBottom: 35,
        fontFamily: 'Roboto_500Medium',

    },
    botaoLocation: {
        width: "95%",
        height: "7%",
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        marginTop: 5,
        backgroundColor: "#007bff",
    },
});