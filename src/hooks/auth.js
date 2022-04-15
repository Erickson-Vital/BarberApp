import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useEffect
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
// interface User {
//   id: string;
//   name: string;
//   // email: string;
//   // avatar_url: string;
// }

// interface AuthState {
//   token: string;
//   user: User;
// }

// interface SignInCredentials {
//   email: string;
//   password: string;
// }

// interface AuthContextData {
//   user: User;
//   loading: boolean;
//   signIn( credentials: SignInCredentials ): Promise< void >;
//   signOut(): void;
// }

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false)
  const [loadingBarber, setLoadingBarber] = useState(false)

  useEffect(() => {
    async function loadStorageData() {
      const [user, barber, token, token_limit] = await AsyncStorage.multiGet([
        '@eBarber:user',
        '@eBarber:barbershop',
        '@eBarber:token',
        '@eBarber:token_limit'
      ]);

      console.log(token_limit["1"])
      console.log(Date.now())
      console.log(token_limit["1"] - Date.now())
      if (token[1] && (user[1] || barber[1])) {
        api.defaults.headers.authorization = `Bearer ${token[1]}`;

        const info = {
          token: token[1],
        };

        if (user[1]) {
          info.user = JSON.parse(user[1]);
        } else if (barber[1]) {
          info.barber = JSON.parse(barber[1]);
        }

        setData(info);
      }
      // Refresh the token a minute early to avoid latency issues
      //const expirationTime = (token_limit * 1000) - 60000
      if (Date.now() >= parseInt(token_limit["1"])) {
        signOut();
        Alert.alert("Seu tempo de login de 7 dias acabou", "Faça o login novamente!")
      }

      setLoading(false);
    }

    loadStorageData();
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    setLoadingUser(true)
    await api.post('/api/auth/login/user', {
      email,
      senha: password,
    }).then(async (response) => {
      const { token, user } = response.data;
      let token_limit = new Date().setDate(new Date().getDate() + 7);
      await AsyncStorage.multiSet([
        ['@eBarber:user', JSON.stringify(user)],
        ['@eBarber:token', token],
        ['@eBarber:token_limit', JSON.stringify(token_limit)]
      ]);
      api.defaults.headers.authorization = `Bearer ${token}`;
      setData({ token, user });
    }).catch((error) => {
      if (error.response.status == 400) {
        if (!error.response.data.details.error) {
          Alert.alert('Erro na Validação', error.response.data.details)
          return
        }
        Alert.alert('Erro na Validação', 'Digite um Email com o formato exemplo@email.com e uma senha com no mínimo 8 caracteres')

      } else {
        Alert.alert('Erro no Sistema', error.response.data.details)
      }
    }).finally(() => {
      setLoadingUser(false)
    })


  }, []);

  const signInBarber = useCallback(async ({ email, password }) => {
    setLoadingBarber(true)
    let notification_token = await Notifications.getExpoPushTokenAsync().catch(err => {
      Alert.alert("Ocorreu um error: 'Notifications - signInBarber'")
      Alert.alert(String(err))
      setLoadingBarber(false)
    }) // TODO: Com problma
    notification_token = notification_token.data
    if (!notification_token) {
      setLoadingBarber(false)
      return
    }
    await api.post('/api/auth/login/barber', {
      email,
      senha: password,
      notification_token
    }).then(async (response) => {

      const { token, barber } = response.data;
      let token_limit = new Date().setDate(new Date().getDate() + 7);
      await AsyncStorage.multiSet([
        ['@eBarber:barbershop', JSON.stringify(barber)],
        ['@eBarber:token', token],
        ['@eBarber:token_limit', JSON.stringify(token_limit)]
      ]);

      api.defaults.headers.authorization = `Bearer ${token}`;

      setData({ token, barber });
    }).catch(async (error) => {
      let response = typeof error.response == 'object' ? error.response : {}
      if (response != 500 && response != undefined) {
        if (typeof response.data.details == 'object') {

          if (response.data.details.error) {
            Alert.alert('Erro', response.data.details.error)
          }
        } else if (response.data.details) {
          if (error.response.status == 403 && response.data.inactive === true) {
            Alert.alert('Assinatura Cancelada', "Sua Assinatura está cancelada você será redirecionado para tela de renovação")
            setData({
              Assinatura: { inactive: true }, BarbeiroAssinaturaCancelado: {
                email: email, password: password
              }
            });
          } else {
            Alert.alert('Erro', response.data.details)
          }
        } else {
          Alert.alert('Erro na Validação', 'Digite um Email com o formato exemplo@email.com e uma senha com no mínimo 8 caracteres')
        }
      } else {
        Alert.alert('Erro no Sistema')
      }
    }).finally(() => {
      setLoadingBarber(false)
    })


  }, []);

  const signOut = useCallback(async () => {
    try {

      AsyncStorage.multiRemove([
        '@eBarber:barbershop',
        '@eBarber:user',
        '@eBarber:token'
      ]);

      setData({});

    } catch (error) {
      // Alert.alert( 'Aviso:', 'Houve um erro ao tentar se desconectar da sua conta.' );
      AsyncStorage.multiRemove([
        '@eBarber:barbershop',
        '@eBarber:user',
        '@eBarber:token'
      ]);

      setData({});
    }

  }, []);

  return (
    <AuthContext.Provider
      value={{ barber: data.barber, user: data.user, loading, signIn, signInBarber, signOut, setData, loadingUser, loadingBarber, Assinatura: data.Assinatura, BarbeiroAssinaturaCancelado: data.BarbeiroAssinaturaCancelado }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado com um AuthProvider.');
  }

  return context;
}

export { AuthProvider, useAuth };
