import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_BASE = "https://money-tracker-95ny.onrender.com";

const SplashScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const textSlide = useRef(new Animated.Value(30)).current;

    // 🔹 Function to check token and determine next screen
    const checkToken = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token || token === 'null') {
                console.log("No token found");
                return 'Login';
            }

            const response = await axios.get(`${API_BASE}/api/check-balance`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Check balance response:", response.data);

            // Navigate based on whether user has a balance
            return response.data.hasBalance ? 'Home' : 'BalanceInput';

        } catch (err) {
            console.log("Token check failed:", err.response?.data || err.message);
            return 'Login';
        }
    };

    useEffect(() => {
        const runSplash = async () => {
            // 🔹 Start animations
            const rotate = Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            });

            const scaleFade = Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ]);

            const textAnimation = Animated.timing(textSlide, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            });

            Animated.sequence([Animated.parallel([rotate, scaleFade]), textAnimation]).start();

            // 🔹 Wait for splash duration
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 🔹 Animate fade out
            await new Promise(resolve => {
                Animated.parallel([
                    Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
                    Animated.timing(scaleAnim, { toValue: 1.2, duration: 600, useNativeDriver: true })
                ]).start(resolve);
            });

            // 🔹 Check token and navigate
            const nextScreen = await checkToken();
            navigation.replace(nextScreen);
        };

        runSplash();
    }, []);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.content,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}>
                <Animated.View style={[styles.logoContainer, { transform: [{ rotate: rotateInterpolate }] }]}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>MT</Text>
                    </View>
                </Animated.View>

                <Animated.View style={{ transform: [{ translateY: textSlide }] }}>
                    <Text style={styles.appName}>MoneyTracker</Text>
                    <Text style={styles.tagline}>Manage Your Finances Wisely</Text>
                </Animated.View>

                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
    content: { alignItems: 'center', justifyContent: 'center' },
    logoContainer: { marginBottom: 30 },
    logo: {
        width: 100, height: 100, backgroundColor: '#2563eb', borderRadius: 25,
        alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
    },
    logoText: { fontSize: 32, fontWeight: '800', color: '#ffffff', fontFamily: 'System', letterSpacing: 1 },
    appName: { fontSize: 34, fontWeight: '700', color: '#1e3a8a', marginBottom: 8, fontFamily: 'System', textAlign: 'center', letterSpacing: 0.5 },
    tagline: { fontSize: 16, color: '#64748b', fontFamily: 'System', fontWeight: '400', textAlign: 'center', letterSpacing: 0.3, lineHeight: 22 },
});

export default SplashScreen;
