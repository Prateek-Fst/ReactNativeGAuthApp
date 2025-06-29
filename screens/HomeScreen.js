import {StyleSheet, Text, View, SafeAreaView,Pressable} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import {AuthContext} from '../AuthContext';
import {jwtDecode} from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'core-js/stable/atob';
import axios from 'axios';

const HomeScreen = () => {
  const {userId, setUserId, setToken, userInfo, setUserInfo} =
    useContext(AuthContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    const response = await axios.get(`http://localhost:8000/user/${userId}`);
    setUser(response.data);
  };

  const logout = () => {
    clearAuthToken();
  };
  const clearAuthToken = async () => {
    try {
      await AsyncStorage.removeItem('authToken');

      setToken('');
    } catch (error) {
      console.log('Error', error);
    }
  };
  return (
    <SafeAreaView>
      <Text>HomeScreen</Text>

      <Text>{user?.user?.email}</Text>

      <Pressable onPress={logout}>
        <Text>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
