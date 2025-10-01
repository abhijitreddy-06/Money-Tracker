import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
const API_URL = 'https://money-tracker-05ny.onrender.com/api';
const SplashScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const textSlide = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Logo rotation animation
        const rotate = Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
        });

        // Scale and fade animation
        const scaleFade = Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ]);

        // Text slide animation
        const textAnimation = Animated.timing(textSlide, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        });

        // Sequence animations
        Animated.sequence([
            Animated.parallel([rotate, scaleFade]),
            textAnimation
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 600,
                    useNativeDriver: true,
                })
            ]).start(() => {
                navigation.replace('Login');
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, rotateAnim, textSlide, navigation]);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.content,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}>
                <Animated.View style={[
                    styles.logoContainer,
                    {
                        transform: [{ rotate: rotateInterpolate }]
                    }
                ]}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>MT</Text>
                    </View>
                </Animated.View>

                <Animated.View style={{ transform: [{ translateY: textSlide }] }}>
                    <Text style={styles.appName}>MoneyTracker</Text>
                    <Text style={styles.tagline}>Manage Your Finances Wisely</Text>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: 30,
    },
    logo: {
        width: 100,
        height: 100,
        backgroundColor: '#2563eb',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563eb',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#ffffff',
        fontFamily: 'System',
        letterSpacing: 1,
    },
    appName: {
        fontSize: 34,
        fontWeight: '700',
        color: '#1e3a8a',
        marginBottom: 8,
        fontFamily: 'System',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 16,
        color: '#64748b',
        fontFamily: 'System',
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: 0.3,
        lineHeight: 22,
    },
});

export default SplashScreen;