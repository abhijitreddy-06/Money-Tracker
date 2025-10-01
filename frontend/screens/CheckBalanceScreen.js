import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Alert,
    SafeAreaView
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
const API_URL = 'https://money-tracker-95ny.onrender.com/api';
const CheckBalanceScreen = ({ navigation }) => {
    const [balance, setBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = await SecureStore.getItemAsync('authToken');
                if (!token) {
                    Alert.alert('Error', 'No token found. Please login again.');
                    navigation.replace('Login');
                    return;
                }

                const response = await axios.get(`${API_URL}/check-balance`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.hasBalance) {
                    setBalance(response.data.balance);
                } else {
                    setBalance(0);
                }
            } catch (err) {
                console.error(err);
                Alert.alert('Error', 'Failed to fetch balance');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBalance();

        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleBack = () => {
        navigation.goBack();
    };

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    return (
        <SafeAreaView style={styles.container}>
            {/* Enhanced Navigation Header */}
            <View style={[styles.header, isTablet && styles.headerTablet]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                >

                </TouchableOpacity>

                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>MT</Text>
                    </View>
                    <Text style={styles.appName}>MoneyTracker</Text>
                </View>

                <View style={styles.headerPlaceholder} />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <Animated.View
                    style={[
                        styles.balanceCard,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { translateY: slideAnim }
                            ]
                        }
                    ]}
                >
                    <View style={styles.balanceIconContainer}>
                        <Text style={styles.balanceIcon}>💰</Text>
                    </View>

                    <Text style={styles.balanceTitle}>Your Current Balance</Text>

                    <Text style={styles.balanceAmount}>
                        {isLoading ? '...' : (balance !== null ? '₹${balance.toLocaleString()}' : '--')}
                    </Text>

                    <Text style={styles.balanceSubtitle}>
                        {isLoading ? 'Loading your balance' : 'Total available amount'}
                    </Text>

                    {/* Balance Summary */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Account Status</Text>
                            <Text style={[styles.summaryValue, styles.statusActive]}>Active</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Last Updated</Text>
                            <Text style={styles.summaryValue}>Just now</Text>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        minHeight: 60,
    },
    headerTablet: {
        paddingHorizontal: 40,
    },
    backButton: {
        flex: 1,
        maxWidth: 80,
    },
    backButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    backIcon: {
        fontSize: 20,
        color: '#2563eb',
        fontWeight: 'bold',
        marginRight: 6,
    },
    backText: {
        fontSize: 16,
        color: '#2563eb',
        fontWeight: '600',
        fontFamily: 'System',
    },
    logoContainer: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoCircle: {
        width: 40,
        height: 40,
        backgroundColor: '#2563eb',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        shadowColor: '#2563eb',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#ffffff',
        fontFamily: 'System',
    },
    appName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        fontFamily: 'System',
        letterSpacing: 0.5,
    },
    headerPlaceholder: {
        flex: 1,
        maxWidth: 80,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    balanceIconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#dbeafe',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    balanceIcon: {
        fontSize: 40,
    },
    balanceTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 12,
        fontFamily: 'System',
        textAlign: 'center',
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
        fontFamily: 'System',
        textAlign: 'center',
    },
    balanceSubtitle: {
        fontSize: 16,
        color: '#94a3b8',
        fontFamily: 'System',
        textAlign: 'center',
        marginBottom: 32,
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: 'System',
        marginBottom: 6,
        textAlign: 'center',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        fontFamily: 'System',
        textAlign: 'center',
    },
    statusActive: {
        color: '#10b981',
        fontWeight: '700',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 10,
    },
});

export default CheckBalanceScreen;