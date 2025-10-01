import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    Dimensions,
    Animated
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL = 'https://money-tracker-95ny.onrender.com/api';
const BalanceInputScreen = ({ navigation }) => {
    const [balance, setBalance] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const buttonScale = new Animated.Value(1);

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleSaveBalance = async () => {
        if (!balance) {
            Alert.alert('Error', 'Please enter your balance');
            return;
        }

        const balanceNumber = parseFloat(balance);
        if (isNaN(balanceNumber) || balanceNumber < 0) {
            Alert.alert('Error', 'Please enter a valid balance amount');
            return;
        }

        animateButton();
        setIsLoading(true);

        try {
            const token = await SecureStore.getItemAsync('authToken');
            await axios.post(`${API_URL}/balance`,
                { balance: balanceNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Success', 'Balance saved successfully!');
            navigation.replace('Home');
        } catch (err) {
            Alert.alert('Error', 'Failed to save balance');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    return (
        <SafeAreaView style={styles.container}>
            {/* Navigation Header */}
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
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>💰</Text>
                    </View>

                    <Text style={styles.title}>Set Your Balance</Text>
                    <Text style={styles.subtitle}>
                        Enter your current balance to start tracking your finances
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Balance Amount</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedField === 'balance' && styles.inputFocused
                                ]}
                                placeholder="0.00"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                                value={balance}
                                onChangeText={setBalance}
                                onFocus={() => setFocusedField('balance')}
                                onBlur={() => setFocusedField(null)}
                                returnKeyType="done"
                            />
                        </View>
                    </View>

                    <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSaveBalance}
                            activeOpacity={0.9}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Saving...' : 'Save Balance'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Text style={styles.note}>
                        You can update this balance anytime from settings
                    </Text>
                </View>
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
    card: {
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
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#dbeafe',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    icon: {
        fontSize: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
        fontFamily: 'System',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        fontFamily: 'System',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    formGroup: {
        width: '100%',
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 12,
        fontFamily: 'System',
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: '600',
        color: '#64748b',
        marginRight: 8,
        fontFamily: 'System',
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 18,
        color: '#1e293b',
        fontFamily: 'System',
        fontWeight: '600',
    },
    inputFocused: {
        borderColor: '#2563eb',
        backgroundColor: '#ffffff',
    },
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'System',
    },
    note: {
        fontSize: 14,
        color: '#94a3b8',
        fontFamily: 'System',
        textAlign: 'center',
    },
});

export default BalanceInputScreen;