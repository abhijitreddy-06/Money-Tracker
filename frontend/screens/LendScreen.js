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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from "../api/api";

const LendScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        amount: '',
        to_whom: '',
        return_date: new Date()
    });
    const [focusedField, setFocusedField] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
            setFormData(prev => ({ ...prev, return_date: date }));
        }
        setShowDatePicker(false);
    };

    const formatDate = (date) =>
        date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleSubmit = async () => {
        if (!formData.amount || !formData.to_whom) {
            Alert.alert('Missing Information', 'Please fill in amount and to whom');
            return;
        }

        try {
            const response = await api.post('/lend', {
                amount: formData.amount,
                to_whom: formData.to_whom,
                return_date: formData.return_date
            });

            Alert.alert('Success!', response.data.message || 'Lend record added successfully');

            setFormData({ amount: '', to_whom: '', return_date: new Date() });
            setSelectedDate(new Date());
            navigation.goBack();

        } catch (error) {
            console.error("Submit error:", error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
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

    return (
        <View style={styles.container}>
            {/* Header */}
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
                        <Text style={styles.titleIcon}>🤝</Text>
                        <Text style={styles.title}>Lend Money</Text>
                        <Text style={styles.subtitle}>Track your lending easily</Text>
                    </View>

                    {/* Amount */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount (₹) <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, focusedField === 'amount' && styles.inputFocused]}
                            value={formData.amount}
                            onChangeText={(value) => handleInputChange('amount', value)}
                            onFocus={() => setFocusedField('amount')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Enter amount"
                            placeholderTextColor="#999"
                            keyboardType="decimal-pad"
                        />
                    </View>

                    {/* To Whom */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>To Whom <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, focusedField === 'to_whom' && styles.inputFocused]}
                            value={formData.to_whom}
                            onChangeText={(value) => handleInputChange('to_whom', value)}
                            onFocus={() => setFocusedField('to_whom')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Who are you lending to?"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Return Date */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Return Date <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity
                            style={[styles.dateInput, focusedField === 'return_date' && styles.inputFocused]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateText}>
                                {formData.return_date ? formatDate(formData.return_date) : 'Select return date'}
                            </Text>
                            <Text style={styles.calendarIcon}>📅</Text>
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

                    {/* Submit */}
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Add Lend Record</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f9ff' },
    header: {
        backgroundColor: '#1976D2',
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    headerTablet: { paddingVertical: 20 },
    backButton: { padding: 8 },
    backIcon: { fontSize: 20, color: 'white', fontWeight: 'bold' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { fontSize: 20, marginRight: 8 },
    logoText: { fontSize: 18, fontWeight: '700', color: 'white', letterSpacing: 0.5 },
    placeholder: { width: 36 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#0052cc',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    titleContainer: { alignItems: 'center', marginBottom: 30 },
    titleIcon: { fontSize: 40, marginBottom: 10 },
    title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 5, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
    required: { color: '#d32f2f' },
    input: {
        backgroundColor: '#fafafa',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
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
    dateText: { fontSize: 16, color: '#333' },
    calendarIcon: { fontSize: 18 },
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
    submitButtonText: { color: 'white', fontSize: 18, fontWeight: '600', letterSpacing: 0.5 },
});

export default LendScreen;
