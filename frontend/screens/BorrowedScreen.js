import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Animated, Alert, Dimensions, FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from "../api/api"; // your axios instance
import * as SecureStore from 'expo-secure-store';

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

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const commonLenders = [
        { id: 1, name: 'Family Member', icon: '👨‍👩‍👧‍👦' },
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
        Alert.alert('Lender Selected', `${lender.icon} ${lender.name}`);
    };

    const handleDateChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
            setFormData(prev => ({ ...prev, dueDate: date }));
        }
        setShowDatePicker(false);
    };

    const formatDateForDisplay = (date) =>
        `Due: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;

    const handleSubmit = async () => {
        const { amount, what, fromWhom, dueDate } = formData;

        if (!amount || !what || !fromWhom) {
            Alert.alert('Missing Information', 'Please fill all required fields');
            return;
        }

        try {
            // Retrieve token from SecureStore
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                Alert.alert('Error', 'User not logged in');
                return;
            }

            const response = await api.post('/borrow', {
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
        <View style={styles.container}>
            <View style={[styles.header, isTablet && styles.headerTablet]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>💼</Text>
                    <Text style={styles.logoText}>MoneyTracker</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleIcon}>📥</Text>
                        <Text style={styles.title}>Add Borrowed Money</Text>
                        <Text style={styles.subtitle}>Track money you've borrowed</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount (₹) *</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'amount' && styles.inputFocused]}
                            value={formData.amount}
                            onChangeText={val => handleInputChange('amount', val)}
                            onFocus={() => setFocusedField('amount')}
                            onBlur={() => setFocusedField(null)}
                            keyboardType="decimal-pad"
                            placeholder="Enter amount"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>For What *</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'what' && styles.inputFocused]}
                            value={formData.what}
                            onChangeText={val => handleInputChange('what', val)}
                            onFocus={() => setFocusedField('what')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Purpose of borrowing"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>From Whom *</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'fromWhom' && styles.inputFocused]}
                            value={formData.fromWhom}
                            onChangeText={val => handleInputChange('fromWhom', val)}
                            onFocus={() => setFocusedField('fromWhom')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Person or institution"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Due Date *</Text>
                        <TouchableOpacity
                            style={[styles.dateInput, focusedField === 'dueDate' && styles.inputFocused]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text>{formatDateForDisplay(formData.dueDate)}</Text>
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

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Add Borrowed Money</Text>
                    </TouchableOpacity>

                    <View style={styles.lendersSection}>
                        <Text style={styles.lendersTitle}>Quick Lenders</Text>
                        <FlatList
                            data={commonLenders}
                            renderItem={renderLenderItem}
                            keyExtractor={item => item.id.toString()}
                            numColumns={3}
                        />
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f9ff',
    },
    header: {
        backgroundColor: '#1976D2',
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    headerTablet: {
        paddingVertical: 20,
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    logoText: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        letterSpacing: 0.5,
    },
    placeholder: {
        width: 36,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#0052cc',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    titleIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: '#d32f2f',
    },
    input: {
        backgroundColor: '#fafafa',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
        fontFamily: 'System',
    },
    inputFocused: {
        borderColor: '#1976D2',
        backgroundColor: 'white',
        shadowColor: '#1976D2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    dateInput: {
        backgroundColor: '#fafafa',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    calendarIcon: {
        fontSize: 18,
    },
    dateHint: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        marginLeft: 4,
        fontStyle: 'italic',
    },
    submitButton: {
        backgroundColor: '#1976D2',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25,
        shadowColor: '#1976D2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    lendersSection: {
        marginTop: 10,
    },
    lendersTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    lendersSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    lendersGrid: {
        paddingHorizontal: 5,
    },
    lenderRow: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    lenderItem: {
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
        borderRadius: 12,
        padding: 12,
        margin: 4,
        flex: 1,
        minWidth: 90,
        maxWidth: 100,
        borderWidth: 1,
        borderColor: '#e6e9ff',
    },
    lenderIcon: {
        fontSize: 20,
        marginBottom: 6,
    },
    lenderName: {
        fontSize: 11,
        fontWeight: '500',
        color: '#1976D2',
        textAlign: 'center',
        lineHeight: 14,
    },
    recordsContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#0052cc',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    recordsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    recordsList: {
        padding: 0,
    },
    emptyList: {
        minHeight: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItem: {
        backgroundColor: '#fafafa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    itemMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    metaText: {
        fontSize: 12,
        color: '#666',
        marginRight: 15,
        marginBottom: 4,
    },
    itemActions: {
        flexDirection: 'row',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#1976D2',
        marginLeft: 8,
    },
    deleteButton: {
        backgroundColor: '#d32f2f',
    },
    editButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
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
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default BorrowedMoneyScreen;