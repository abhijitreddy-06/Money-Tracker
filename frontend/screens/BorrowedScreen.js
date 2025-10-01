import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Animated, Alert, Dimensions, FlatList,
    SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from "../api/api";
import * as SecureStore from 'expo-secure-store';
const API_URL = 'https://money-tracker-05ny.onrender.com/api';
const BorrowedMoneyScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        amount: '',
        what: '',
        fromWhom: '',
        dueDate: new Date()
    });
    const [focusedField, setFocusedField] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const commonLenders = [
        { id: 1, name: 'Family', icon: '👨‍👩‍👧‍👦' },
        { id: 2, name: 'Friend', icon: '👫' },
        { id: 3, name: 'Bank', icon: '🏦' },
        { id: 4, name: 'Colleague', icon: '💼' },
        { id: 5, name: 'Relative', icon: '👨‍👩‍👧' },
        { id: 6, name: 'Loan App', icon: '📱' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLenderSelect = (lender) => {
        handleInputChange('fromWhom', lender.name);
    };

    const handleDateChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
            setFormData(prev => ({ ...prev, dueDate: date }));
        }
        setShowDatePicker(false);
    };

    const formatDateForDisplay = (date) =>
        `${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;

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

    const handleSubmit = async () => {
        const { amount, what, fromWhom, dueDate } = formData;

        if (!amount || !what || !fromWhom) {
            Alert.alert('Missing Information', 'Please fill all required fields');
            return;
        }

        animateButton();
        setIsLoading(true);

        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                Alert.alert('Error', 'User not logged in');
                return;
            }

            const response = await api.post(`${API_URL}/borrow`, {
                amount,
                for_what: what,
                from_whom: fromWhom,
                return_date: dueDate.toISOString().split('T')[0]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', response.data.message || 'Borrow record added');
            setFormData({ amount: '', what: '', fromWhom: '', dueDate: new Date() });
            setSelectedDate(new Date());
            navigation.goBack();

        } catch (err) {
            console.error('Borrow submit error:', err.response?.data || err.message);
            Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => navigation?.goBack();

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    const renderLenderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.lenderItem}
            onPress={() => handleLenderSelect(item)}
            activeOpacity={0.7}
        >
            <Text style={styles.lenderIcon}>{item.icon}</Text>
            <Text style={styles.lenderName}>{item.name}</Text>
        </TouchableOpacity>
    );

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

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    {/* Header Section */}
                    <View style={styles.titleContainer}>
                        <View style={styles.titleIconContainer}>
                            <Text style={styles.titleIcon}>📥</Text>
                        </View>
                        <Text style={styles.title}>Add Borrowed Money</Text>
                        <Text style={styles.subtitle}>Track money you've borrowed from others</Text>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount Borrowed (₹)</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'amount' && styles.inputFocused]}
                            value={formData.amount}
                            onChangeText={val => handleInputChange('amount', val)}
                            onFocus={() => setFocusedField('amount')}
                            onBlur={() => setFocusedField(null)}
                            keyboardType="decimal-pad"
                            placeholder="Enter amount"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Purpose Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Purpose</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'what' && styles.inputFocused]}
                            value={formData.what}
                            onChangeText={val => handleInputChange('what', val)}
                            onFocus={() => setFocusedField('what')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Reason for borrowing"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Lender Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Borrowed From</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'fromWhom' && styles.inputFocused]}
                            value={formData.fromWhom}
                            onChangeText={val => handleInputChange('fromWhom', val)}
                            onFocus={() => setFocusedField('fromWhom')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Person or institution"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Due Date */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Due Date</Text>
                        <TouchableOpacity
                            style={[styles.dateInput, focusedField === 'dueDate' && styles.inputFocused]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateText}>{formatDateForDisplay(formData.dueDate)}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                minimumDate={new Date()}
                            />
                        )}
                    </View>

                    {/* Submit Button */}
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            activeOpacity={0.9}
                            disabled={isLoading}
                        >
                            <Text style={styles.submitButtonText}>
                                {isLoading ? 'Adding...' : 'Add Borrowed Money'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                </Animated.View>
            </ScrollView>
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
        width: 36,
        height: 36,
        backgroundColor: '#2563eb',
        borderRadius: 18,
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
        fontSize: 16,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: '#f8fafc',
    },
    formContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
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
    titleContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    titleIconContainer: {
        width: 70,
        height: 70,
        backgroundColor: '#dbeafe',
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    titleIcon: {
        fontSize: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        fontFamily: 'System',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        fontFamily: 'System',
        textAlign: 'center',
        lineHeight: 22,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        fontFamily: 'System',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1e293b',
        fontFamily: 'System',
    },
    inputFocused: {
        borderColor: '#2563eb',
        backgroundColor: '#ffffff',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    dateInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    dateText: {
        fontSize: 16,
        color: '#1e293b',
        fontFamily: 'System',
    },
    submitButton: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'System',
    },
    lendersSection: {
        marginTop: 8,
    },
    lendersTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
        textAlign: 'center',
    },
    lendersSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'System',
    },
    lendersGrid: {
        paddingHorizontal: 5,
    },
    lenderItem: {
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        margin: 4,
        flex: 1,
        minWidth: 90,
        maxWidth: 100,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    lenderIcon: {
        fontSize: 20,
        marginBottom: 6,
    },
    lenderName: {
        fontSize: 11,
        fontWeight: '500',
        color: '#2563eb',
        textAlign: 'center',
        lineHeight: 14,
        fontFamily: 'System',
    },
});

export default BorrowedMoneyScreen;