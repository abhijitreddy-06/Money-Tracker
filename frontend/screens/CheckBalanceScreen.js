import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const CheckBalanceScreen = ({ navigation }) => {
    const [balance, setBalance] = useState(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = await SecureStore.getItemAsync('authToken');
                if (!token) {
                    Alert.alert('Error', 'No token found. Please login again.');
                    navigation.replace('Login');
                    return;
                }

                const response = await axios.get('http://172.16.7.155:3000/check-balance', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.hasBalance) {
                    setBalance(response.data.balance);
                } else {
                    setBalance(0); // or redirect to BalanceInput
                }
            } catch (err) {
                console.error(err);
                Alert.alert('Error', 'Failed to fetch balance');
            }
        };

        fetchBalance();

        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleBack = () => {
        if (navigation) {
            navigation.goBack();
        }
    };

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, isTablet && styles.headerTablet]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>💼</Text>
                    <Text style={styles.logoText}>MoneyTracker</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            {/* Balance Card */}
            <View style={styles.content}>
                <Animated.View
                    style={[
                        styles.balanceCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <Text style={styles.balanceIcon}>💰</Text>
                    <Text style={styles.balanceTitle}>Current Balance</Text>
                    <Text style={styles.balanceAmount}>
                        {balance !== null ? `₹${balance}` : 'Loading...'}
                    </Text>
                    <Text style={styles.balanceSubtitle}>Available to spend</Text>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerTablet: { paddingHorizontal: 40 },
    backButton: { padding: 8 },
    backIcon: { fontSize: 20 },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { fontSize: 20, marginRight: 6 },
    logoText: { fontSize: 18, fontWeight: 'bold' },
    placeholder: { width: 24 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    balanceCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        padding: 30,
        alignItems: 'center',
        elevation: 5,
    },
    balanceIcon: { fontSize: 40, marginBottom: 10 },
    balanceTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    balanceAmount: { fontSize: 28, fontWeight: 'bold', color: '#1976D2' },
    balanceSubtitle: { fontSize: 14, color: '#666', marginTop: 5 },
});

export default CheckBalanceScreen;
