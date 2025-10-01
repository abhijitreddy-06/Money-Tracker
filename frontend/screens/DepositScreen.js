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
    FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // for storing JWT

const DepositScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        amount: '',
        fromWhom: '',
        date: new Date()
    });
    const [focusedField, setFocusedField] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [depositRecords, setDepositRecords] = useState([
        {
            id: '1',
            amount: '15,000',
            fromWhom: 'Salary',
            date: '2024-01-15',
            formattedDate: '15 Jan 2024'
        },
        {
            id: '2',
            amount: '5,000',
            fromWhom: 'Freelance Work',
            date: '2024-01-10',
            formattedDate: '10 Jan 2024'
        }
    ]);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const commonSources = [
        { id: 1, name: 'Salary', icon: '💰', type: 'income' },
        { id: 2, name: 'Freelance', icon: '💻', type: 'income' },
        { id: 3, name: 'Investment', icon: '📈', type: 'income' },
        { id: 4, name: 'Gift', icon: '🎁', type: 'other' },
        { id: 5, name: 'Refund', icon: '↩️', type: 'other' },
        { id: 6, name: 'Bonus', icon: '⭐', type: 'income' },
        { id: 7, name: 'Business', icon: '🏢', type: 'income' },
        { id: 8, name: 'Other', icon: '📥', type: 'other' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSourceSelect = (source) => {
        handleInputChange('fromWhom', source.name);
        Alert.alert('Source Selected', `${source.icon} ${source.name}`, [], { cancelable: true });
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

  

    const handleSubmit = async () => {
        try {
            // Get token from SecureStore
            const token = await SecureStore.getItemAsync('authToken');

            console.log('Token being sent:', token);

            if (!token) {
                Alert.alert('Error', 'You are not logged in. Please log in again.');
                return;
            }

            // Validate form inputs
            if (!formData.amount || !formData.fromWhom || !formData.date) {
                Alert.alert('Error', 'Please fill all fields before submitting.');
                return;
            }

            // POST request with Authorization header
            const response = await axios.post(
                'http://172.16.7.155:3000/deposit',
                {
                    amount: formData.amount,
                    fromWhom: formData.fromWhom,
                    date: formData.date,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log('Deposit response:', response.data);
            Alert.alert('Success', response.data.message);

            // Reset form
            setFormData({ amount: '', fromWhom: '', date: new Date() });
            setSelectedDate(new Date());
        } catch (error) {
            console.log('Error response:', error.response?.data || error.message);

            if (error.response?.status === 401 || error.response?.status === 403) {
                Alert.alert(
                    'Unauthorized',
                    'Your session has expired or token is invalid. Please log in again.'
                );
                // Optional: navigate to login screen
                navigation.navigate('LoginScreen');
            } else {
                Alert.alert('Error', 'Something went wrong. Try again.');
            }
        }
    };





    const handleEdit = (record) => {
        Alert.alert('Edit Record', `Edit deposit of ₹${record.amount}`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Edit', onPress: () => {
                    // Pre-fill form with record data
                    setFormData({
                        amount: record.amount,
                        fromWhom: record.fromWhom,
                        date: new Date(record.date)
                    });
                    setSelectedDate(new Date(record.date));

                    // Remove from list
                    setDepositRecords(prev => prev.filter(item => item.id !== record.id));
                }
            }
        ]);
    };

    const handleDelete = (record) => {
        Alert.alert('Delete Record', `Are you sure you want to delete deposit of ₹${record.amount}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
                    setDepositRecords(prev => prev.filter(item => item.id !== record.id));
                    Alert.alert('Deleted', 'Deposit record deleted successfully');
                }
            }
        ]);
    };

    const handleBack = () => {
        if (navigation) {
            navigation.goBack();
        }
    };

    React.useEffect(() => {
        // Start animations when component mounts
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
            style={[
                styles.sourceItem,
                item.type === 'income' ? styles.incomeSource : styles.otherSource
            ]}
            onPress={() => handleSourceSelect(item)}
            activeOpacity={0.7}
        >
            <Text style={styles.sourceIcon}>{item.icon}</Text>
            <Text style={styles.sourceName} numberOfLines={2}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderDepositItem = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.itemMain}>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>₹{item.amount}</Text>
                    <Text style={styles.dateText}>{item.formattedDate}</Text>
                </View>
                <View style={styles.sourceContainer}>
                    <Text style={styles.sourceText}>{item.fromWhom}</Text>
                </View>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const ListEmptyComponent = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No deposit records yet.</Text>
            <Text style={styles.emptySubtext}>Add your first deposit above!</Text>
        </View>
    );

    // Calculate total deposits
    const totalDeposits = depositRecords.reduce((total, record) => {
        const amount = parseFloat(record.amount.replace(/,/g, '')) || 0;
        return total + amount;
    }, 0);

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
                        <Text style={styles.titleIcon}>💵</Text>
                        <Text style={styles.title}>Add Deposit</Text>
                        <Text style={styles.subtitle}>Record your income and deposits</Text>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Amount (₹) <Text style={styles.required}>*</Text>
                        </Text>
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
                            placeholderTextColor="#999"
                            keyboardType="decimal-pad"
                            returnKeyType="next"
                        />
                    </View>

                    {/* From Whom Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            From Whom <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'fromWhom' && styles.inputFocused
                            ]}
                            value={formData.fromWhom}
                            onChangeText={(value) => handleInputChange('fromWhom', value)}
                            onFocus={() => setFocusedField('fromWhom')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Source of deposit (e.g., Salary, Gift)"
                            placeholderTextColor="#999"
                            returnKeyType="next"
                        />
                    </View>

                    {/* Date Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Date <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.dateInput,
                                focusedField === 'date' && styles.inputFocused
                            ]}
                            onPress={showDatepicker}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.dateText,
                                !formData.date && styles.placeholderText
                            ]}>
                                {formData.date ? formatDate(formData.date) : 'Select deposit date'}
                            </Text>
                            <Text style={styles.calendarIcon}>📅</Text>
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
                        <Text style={styles.dateHint}>Date when you received the money</Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.submitButtonText}>Add Deposit</Text>
                    </TouchableOpacity>

                    {/* Quick Sources */}
                    <View style={styles.sourcesSection}>
                        <Text style={styles.sourcesTitle}>Quick Sources</Text>
                        <Text style={styles.sourcesSubtitle}>Tap to select a source</Text>

                        <FlatList
                            data={commonSources}
                            renderItem={renderSourceItem}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={4}
                            scrollEnabled={false}
                            contentContainerStyle={styles.sourcesGrid}
                            columnWrapperStyle={isTablet ? null : styles.sourceRow}
                        />
                    </View>
                </Animated.View>

                {/* Summary Card */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Deposit Summary</Text>
                    <View style={styles.summaryContent}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total Deposits</Text>
                            <Text style={styles.summaryValue}>₹{totalDeposits.toLocaleString()}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Records Count</Text>
                            <Text style={styles.summaryValue}>{depositRecords.length}</Text>
                        </View>
                    </View>
                </View>

                {/* Deposit Records List */}
                <View style={styles.recordsContainer}>
                    <Text style={styles.recordsTitle}>Recent Deposits</Text>

                    <FlatList
                        data={depositRecords}
                        renderItem={renderDepositItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        ListEmptyComponent={ListEmptyComponent}
                        contentContainerStyle={depositRecords.length === 0 ? styles.emptyList : styles.recordsList}
                    />
                </View>
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
        backgroundColor: '#28a745',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25,
        shadowColor: '#28a745',
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
    sourcesSection: {
        marginTop: 10,
    },
    sourcesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    sourcesSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    sourcesGrid: {
        paddingHorizontal: 5,
    },
    sourceRow: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    sourceItem: {
        alignItems: 'center',
        borderRadius: 12,
        padding: 12,
        margin: 4,
        flex: 1,
        minWidth: 70,
        maxWidth: 80,
        borderWidth: 1,
    },
    incomeSource: {
        backgroundColor: '#e8f5e8',
        borderColor: '#c8e6c9',
    },
    otherSource: {
        backgroundColor: '#fff3e0',
        borderColor: '#ffe0b2',
    },
    sourceIcon: {
        fontSize: 20,
        marginBottom: 6,
    },
    sourceName: {
        fontSize: 11,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
        lineHeight: 14,
    },
    summaryContainer: {
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
    summaryTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    summaryContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#28a745',
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
    itemMain: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountContainer: {
        alignItems: 'flex-start',
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#28a745',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
    },
    sourceContainer: {
        alignItems: 'flex-end',
    },
    sourceText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemActions: {
        flexDirection: 'row',
        marginLeft: 10,
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

export default DepositScreen;