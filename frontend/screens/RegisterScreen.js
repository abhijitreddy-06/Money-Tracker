import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
    Animated,
    ScrollView,
    SafeAreaView
} from 'react-native';
import axios from 'axios';
const API_URL = 'https://money-tracker-95ny.onrender.com/api';
const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: ''
    });
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const buttonScale = new Animated.Value(1);

    const handleInputChange = (field, value) => {
        if (field === 'phone') {
            // Remove any non-digit characters and limit to 10 digits
            const cleanedValue = value.replace(/[^0-9]/g, '');
            if (cleanedValue.length <= 10) {
                setFormData(prev => ({
                    ...prev,
                    [field]: cleanedValue
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
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
        const { name, phone, password } = formData;

        if (!name || !phone || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (phone.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
            return;
        }

        animateButton();
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/register`, formData);

            if (response.status === 201) {
                Alert.alert('Success', 'Account created successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('Login')
                    }
                ]);
            } else {
                Alert.alert('Error', response.data.message || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data?.message) {
                Alert.alert('Error', error.response.data.message);
            } else {
                Alert.alert('Error', 'Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLoginRedirect = () => {
        navigation.navigate('Login');
    };

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>MT</Text>
                        </View>
                        <Text style={styles.appName}>MoneyTracker</Text>
                        <Text style={styles.welcomeSubtitle}>Create your account to get started</Text>
                    </View>

                    {/* Register Card */}
                    <View style={[styles.registerCard, isTablet && styles.registerCardTablet]}>
                        <Text style={styles.registerTitle}>Create Account</Text>

                        {/* Name Input */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedField === 'name' && styles.inputFocused
                                ]}
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Enter your full name"
                                placeholderTextColor="#94a3b8"
                                autoCapitalize="words"
                                returnKeyType="next"
                            />
                        </View>

                        {/* Phone Input */}
                        <View style={styles.formGroup}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Phone Number</Text>
                                <Text style={styles.charCount}>
                                    {formData.phone.length}/10
                                </Text>
                            </View>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedField === 'phone' && styles.inputFocused,
                                    formData.phone.length === 10 && styles.inputComplete
                                ]}
                                value={formData.phone}
                                onChangeText={(value) => handleInputChange('phone', value)}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Enter 10-digit phone number"
                                placeholderTextColor="#94a3b8"
                                keyboardType="phone-pad"
                                autoCapitalize="none"
                                returnKeyType="next"
                                maxLength={10}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedField === 'password' && styles.inputFocused,
                                        styles.passwordInput
                                    ]}
                                    value={formData.password}
                                    onChangeText={(value) => handleInputChange('password', value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Create a strong password"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={togglePasswordVisibility}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.eyeIcon}>
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Register Button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                                onPress={handleSubmit}
                                activeOpacity={0.9}
                                disabled={isLoading}
                            >
                                <Text style={styles.registerButtonText}>
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Login Redirect */}
                        <View style={styles.loginRedirectContainer}>
                            <Text style={styles.loginRedirectText}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={handleLoginRedirect}>
                                <Text style={styles.loginRedirectLink}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Security Note */}
                    <View style={styles.securityNote}>
                        <Text style={styles.securityText}>🔒 Your data is securely encrypted</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: '#f8fafc',
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    logoCircle: {
        width: 80,
        height: 80,
        backgroundColor: '#2563eb',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#2563eb',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    logoText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
        fontFamily: 'System',
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        fontFamily: 'System',
        letterSpacing: 0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        fontFamily: 'System',
    },
    registerCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: 20,
    },
    registerCardTablet: {
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    registerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 32,
        textAlign: 'center',
        fontFamily: 'System',
    },
    formGroup: {
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        fontFamily: 'System',
    },
    charCount: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        fontFamily: 'System',
    },
    passwordContainer: {
        position: 'relative',
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
    passwordInput: {
        paddingRight: 50,
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
    inputComplete: {
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4',
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 4,
        zIndex: 10,
    },
    eyeIcon: {
        fontSize: 20,
        color: '#64748b',
    },
    registerButton: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'System',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        color: '#64748b',
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'System',
    },
    loginRedirectContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    loginRedirectText: {
        fontSize: 15,
        color: '#64748b',
        fontFamily: 'System',
    },
    loginRedirectLink: {
        color: '#2563eb',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'System',
    },
    securityNote: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    securityText: {
        fontSize: 14,
        color: '#94a3b8',
        fontFamily: 'System',
    },
});

export default RegisterScreen;