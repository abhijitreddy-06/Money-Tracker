import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const BalanceInputScreen = ({ navigation }) => {
    const [balance, setBalance] = useState('');

    const handleSaveBalance = async () => {
        if (!balance) {
            Alert.alert('Error', 'Please enter balance');
            return;
        }

        const token = await SecureStore.getItemAsync('authToken');

        try {
            await axios.post('http://172.16.7.155:3000/balance',
                { balance },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Success', 'Balance saved!');
            navigation.replace('Home');
        } catch (err) {
            Alert.alert('Error', 'Failed to save balance');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter Your Current Balance</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter balance"
                keyboardType="numeric"
                value={balance}
                onChangeText={setBalance}
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveBalance}>
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 20, marginBottom: 20 },
    input: { borderWidth: 1, width: '80%', padding: 10, marginBottom: 20, borderRadius: 8 },
    button: { backgroundColor: '#1976D2', padding: 15, borderRadius: 8 },
    buttonText: { color: 'white', fontWeight: 'bold' }
});

export default BalanceInputScreen;
