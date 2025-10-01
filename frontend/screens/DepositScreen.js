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
    FlatList,
    SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const DepositScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        amount: '',
        fromWhom: '',
        date: new Date()
    });
    const [focusedField, setFocusedField] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [depositRecords, setDepositRecords] = useState([]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const commonSources = [
        { id: 1, name: 'Salary', icon: '💰' },
        { id: 2, name: 'Freelance', icon: '💻' },
        { id: 3, name: 'Investment', icon: '📈' },
        { id: 4, name: 'Gift', icon: '🎁' },
        { id: 5, name: 'Refund', icon: '↩️' },
        { id: 6, name: 'Bonus', icon: '⭐' },
        { id: 7, name: 'Business', icon: '🏢' },
        { id: 8, name: 'Other', icon: '📥' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSourceSelect = (source) => {
        handleInputChange('fromWhom', source.name);
    };

    const handleDateChange = (event, date) => {
        if (date !== undefined) {
            setSelectedDate(date);
            setFormData(prev => ({
                ...prev,
                date: date
            }));
        }
        setShowDatePicker(false);
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
        if (!formData.amount || !formData.fromWhom || !formData.date) {
            Alert.alert('Error', 'Please fill all fields before submitting.');
            return;
        }

        animateButton();
        setIsLoading(true);

        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                Alert.alert('Error', 'You are not logged in. Please log in again.');
                return;
            }

            const response = await axios.post(
                'http://YOUR_IP_ADDRESS:3000/deposit',
                {
                    amount: formData.amount,
                    fromWhom: formData.fromWhom,
                    date: formData.date,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            Alert.alert('Success', response.data.message);

            // Reset form
            setFormData({ amount: '', fromWhom: '', date: new Date() });
            setSelectedDate(new Date());

        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                Alert.alert('Unauthorized', 'Your session has expired. Please log in again.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Error', 'Something went wrong. Try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    const renderSourceItem = ({ item }) => (
        <TouchableOpacity
            style={styles.sourceItem}
            onPress={() => handleSourceSelect(item)}
            activeOpacity={0.7}
        >
            <Text style={styles.sourceIcon}>{item.icon}</Text>
            <Text style={styles.sourceName} numberOfLines={2}>{item.name}</Text>
        </TouchableOpacity>
    );

    const ListEmptyComponent = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No deposit records yet</Text>
            <Text style={styles.emptySubtext}>Add your first deposit above</Text>
        </View>
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
                {/* Form Card */}
                <Animated.View
                    style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* Title Section */}
                    <View style={styles.titleContainer}>
                        <View style={styles.titleIconContainer}>
                            <Text style={styles.titleIcon}>💵</Text>
                        </View>
                        <Text style={styles.title}>Add Deposit</Text>
                        <Text style={styles.subtitle}>Record your income and deposits</Text>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount (₹)</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'amount' && styles.inputFocused
                            ]}
                            value={formData.amount}
                            onChangeText={(value) => handleInputChange('amount', value)}
                            onFocus={() => setFocusedField('amount')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Enter deposit amount"
                            placeholderTextColor="#94a3b8"
                            keyboardType="decimal-pad"
                            returnKeyType="next"
                        />
                    </View>

                    {/* From Whom Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Source</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'fromWhom' && styles.inputFocused
                            ]}
                            value={formData.fromWhom}
                            onChangeText={(value) => handleInputChange('fromWhom', value)}
                            onFocus={() => setFocusedField('fromWhom')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Source of deposit"
                            placeholderTextColor="#94a3b8"
                            returnKeyType="next"
                        />
                    </View>

                    {/* Date Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity
                            style={[
                                styles.dateInput,
                                focusedField === 'date' && styles.inputFocused
                            ]}
                            onPress={showDatepicker}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.dateText}>
                                {formatDate(formData.date)}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
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
                                {isLoading ? 'Adding Deposit...' : 'Add Deposit'}
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
        marginBottom: 20,
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
    sourcesSection: {
        marginTop: 8,
    },
    sourcesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
        textAlign: 'center',
    },
    sourcesSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'System',
    },
    sourcesGrid: {
        paddingHorizontal: 5,
    },
    sourceItem: {
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        margin: 4,
        flex: 1,
        minWidth: 70,
        maxWidth: 80,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sourceIcon: {
        fontSize: 20,
        marginBottom: 6,
    },
    sourceName: {
        fontSize: 11,
        fontWeight: '500',
        color: '#2563eb',
        textAlign: 'center',
        lineHeight: 14,
        fontFamily: 'System',
    },
    recordsContainer: {
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
    recordsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 20,
        fontFamily: 'System',
        textAlign: 'center',
    },
    recordItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    recordIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#dbeafe',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    recordIconText: {
        fontSize: 16,
    },
    recordDetails: {
        flex: 1,
    },
    recordAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        fontFamily: 'System',
        marginBottom: 4,
    },
    recordSource: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: 'System',
    },
    recordDate: {
        fontSize: 12,
        color: '#94a3b8',
        fontFamily: 'System',
    },
    emptyList: {
        minHeight: 200,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'System',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        fontFamily: 'System',
    },
});

export default DepositScreen;