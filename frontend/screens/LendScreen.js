import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Alert,
    Dimensions,
    SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from "../api/api";
import * as SecureStore from 'expo-secure-store';
const API_URL = 'https://money-tracker-05ny.onrender.com/api';
const LendScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        amount: '',
        to_whom: '',
        return_date: new Date()
    });
    const [focusedField, setFocusedField] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const commonBorrowers = [
        { id: 1, name: 'Family', icon: '👨‍👩‍👧‍👦' },
        { id: 2, name: 'Friend', icon: '👫' },
        { id: 3, name: 'Colleague', icon: '💼' },
        { id: 4, name: 'Relative', icon: '👨‍👩‍👧' },
        { id: 5, name: 'Neighbor', icon: '🏠' },
        { id: 6, name: 'Other', icon: '🤝' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBorrowerSelect = (borrower) => {
        handleInputChange('to_whom', borrower.name);
    };

    const handleDateChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
            setFormData(prev => ({ ...prev, return_date: date }));
        }
        setShowDatePicker(false);
    };

    const formatDate = (date) =>
        date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

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
        if (!formData.amount || !formData.to_whom) {
            Alert.alert('Missing Information', 'Please fill in amount and to whom');
            return;
        }

        animateButton();
        setIsLoading(true);

        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                Alert.alert('Error', 'You are not logged in. Please login again.');
                return;
            }

            const response = await api.post(`${API_URL}/lend`, {
                amount: formData.amount,
                to_whom: formData.to_whom,
                return_date: formData.return_date
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success!', response.data.message || 'Lend record added successfully');

            setFormData({ amount: '', to_whom: '', return_date: new Date() });
            setSelectedDate(new Date());
            navigation.goBack();

        } catch (error) {
            console.error("Submit error:", error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
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

    const renderBorrowerItem = ({ item }) => (
        <TouchableOpacity
            style={styles.borrowerItem}
            onPress={() => handleBorrowerSelect(item)}
            activeOpacity={0.7}
        >
            <Text style={styles.borrowerIcon}>{item.icon}</Text>
            <Text style={styles.borrowerName}>{item.name}</Text>
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
                <Animated.View style={[styles.formContainer, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }]}>
                    {/* Title Section */}
                    <View style={styles.titleContainer}>
                        <View style={styles.titleIconContainer}>
                            <Text style={styles.titleIcon}>🤝</Text>
                        </View>
                        <Text style={styles.title}>Lend Money</Text>
                        <Text style={styles.subtitle}>Track money you've lent to others</Text>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount (₹)</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'amount' && styles.inputFocused]}
                            value={formData.amount}
                            onChangeText={(value) => handleInputChange('amount', value)}
                            onFocus={() => setFocusedField('amount')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Enter amount"
                            placeholderTextColor="#94a3b8"
                            keyboardType="decimal-pad"
                        />
                    </View>

                    {/* To Whom Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>To Whom</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'to_whom' && styles.inputFocused]}
                            value={formData.to_whom}
                            onChangeText={(value) => handleInputChange('to_whom', value)}
                            onFocus={() => setFocusedField('to_whom')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Who are you lending to?"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    {/* Return Date */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Return Date</Text>
                        <TouchableOpacity
                            style={[styles.dateInput, focusedField === 'return_date' && styles.inputFocused]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateText}>
                                {formatDate(formData.return_date)}
                            </Text>
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
                                {isLoading ? 'Adding...' : 'Add Lend Record'}
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
    borrowersSection: {
        marginTop: 8,
    },
    borrowersTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
        textAlign: 'center',
    },
    borrowersSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'System',
    },
    borrowersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    borrowerItem: {
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        margin: 4,
        width: '30%',
        minWidth: 80,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    borrowerIcon: {
        fontSize: 20,
        marginBottom: 6,
    },
    borrowerName: {
        fontSize: 11,
        fontWeight: '500',
        color: '#2563eb',
        textAlign: 'center',
        lineHeight: 14,
        fontFamily: 'System',
    },
});

export default LendScreen;