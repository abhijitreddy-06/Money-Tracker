import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const SplashScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current; // initial opacity 1

    useEffect(() => {
        const timer = setTimeout(() => {
            // Fade out animation
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }).start(() => {
                // Navigate to LoginScreen after fade
                navigation.replace('Login');
            });
        }, 1500); 

        return () => clearTimeout(timer);
    }, [fadeAnim, navigation]);

    const { width, height } = Dimensions.get('window');

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Text style={styles.logo}>MoneyTracker</Text>
            <Text style={styles.subtitle}>Manage your finances wisely</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontSize: 40,
        fontWeight: '700',
        color: '#007bff',
    },
    subtitle: {
        fontSize: 18,
        marginTop: 10,
        color: '#6c757d',
    },
});

export default SplashScreen;
