import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  Image,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../AuthContext';
import Config from 'react-native-config';

console.log(Config.API_URL);
console.log(Config.GOOGLE_WEB_CLIENT_ID);


GoogleSignin.configure({
  webClientId:
    'your_web_id',
  // iosClientId:
  //   'yourID',
  scopes: ['profile', 'email'],
});

const LoginScreen = () => {
  const {token, setToken} = useContext(AuthContext);

  const GoogleLogin = async () => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    console.log('u', userInfo);
    return userInfo;
  };

  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const response = await GoogleLogin(); // Google sign-in
      const {idToken} = response; // Check if idToken is directly available

      console.log('idToken:', idToken); // Log idToken to check if it's retrieved

      // If idToken is not directly available, get it from response.data.idToken
      const extractedIdToken = idToken || response.data.idToken;
      console.log('Extracted idToken from data:', extractedIdToken); // Log the extracted idToken

      if (extractedIdToken) {
        // Send idToken to the backend using axios
        const backendResponse = await axios.post(
          'http://localhost:8000/google-login',
          {
            idToken: extractedIdToken, // Sending the idToken
          },
        );

        const data = backendResponse.data;
        console.log('Backend Response:', backendResponse.data);

        await AsyncStorage.setItem('authToken', data.token);

        setToken(data.token);

        // Update auth state (if using context or state)
        // setIsAuthenticated(true); // Navigate to the main screen
        // Handle JWT token and user data here
      }
    } catch (error) {
      console.log('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View style={{marginTop: 30, alignItems: 'center'}}>
      <Text> Welcome to Google Auth App</Text>
      </View>

      <View style={{marginTop: 70}}>
        <Pressable
          onPress={handleGoogleLogin}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            justifyContent: 'center',
            borderColor: '#E0E0E0',
            margin: 12,
            borderWidth: 1,
            gap: 30,
            borderRadius: 25,
            position: 'relative',
            marginTop: 20,
          }}>
          <Text style={{textAlign: 'center', fontSize: 15, fontWeight: '500'}}>
            Sign Up With Google
          </Text>
        </Pressable>

        <Pressable style={{marginTop: 12}}>
          <Text style={{textAlign: 'center', fontSize: 15, color: 'gray'}}>
            Already have an account? Sign In
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
