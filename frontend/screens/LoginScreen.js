import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const LoginScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });
    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Mark the function as async
    const handleSubmit = async () => {
        if (!formData.phone || !formData.password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            const response = await axios.post('http://172.16.7.155:3000/login', formData);

            if (response.data.token) {
                // Save token
                await SecureStore.setItemAsync('authToken', response.data.token);

                // ✅ Check if balance is set
                const checkResponse = await axios.get('http://172.16.7.155:3000/check-balance', {
                    headers: { Authorization: `Bearer ${response.data.token}` }
                });

                if (checkResponse.data.hasBalance) {
                    navigation.replace('Home');
                } else {
                    navigation.replace('BalanceInput');
                }
            } else {
                Alert.alert('Error', response.data.message || 'Invalid credentials');
            }
        } catch (error) {
            if (error.response) {
                const message = error.response.data?.message || 'Something went wrong';
                Alert.alert('Error', message);
                setFormData({ phone: '', password: '' });
            } else {
                Alert.alert('Error', 'Cannot connect to server. Check your network.');
            }
        }
    };




    

    function handleCreateAccount() {
        navigation.navigate('Register');
    }

const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
};

const { width } = Dimensions.get('window');
const isTablet = width > 768;

return (
    <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
    >
        <View style={styles.background}>
            {/* Main Card Container */}
            <View style={[styles.cardContainer, isTablet && styles.cardContainerTablet]}>

                {/* Welcome Section - Compact */}
                <View style={[styles.welcomeSection, isTablet && styles.welcomeSectionTablet]}>
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />

                    <View style={styles.welcomeContent}>
                        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                    </View>
                </View>

                {/* Login Card Section */}
                <View style={[styles.loginCard, isTablet && styles.loginCardTablet]}>
                    {/* Logo with Professional Wallet */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoIcon}>💼</Text>
                        <Text style={styles.logoText}>MoneyTracker</Text>
                    </View>

                    <Text style={styles.loginTitle}>Sign In to Your Account</Text>

                    {/* Phone Input */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'phone' && styles.inputFocused
                            ]}
                            value={formData.phone}
                            onChangeText={(value) => handleInputChange('phone', value)}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Enter your phone number"
                            placeholderTextColor="#777"
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
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
                                placeholder="Enter your password"
                                placeholderTextColor="#777"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={togglePasswordVisibility}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.eyeIcon}>
                                    {showPassword ? '🐵' : '🙈'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleSubmit}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    {/* Links Container */}
                    <View style={styles.linksContainer}>
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>Forgot your password?</Text>
                        </TouchableOpacity>

                        {/* Create Account Text */}
                        <View style={styles.createAccountContainer}>
                            <Text style={styles.createAccountText}>
                                Don't have an account? {' '}
                                <Text style={styles.createAccountLink} onPress={handleCreateAccount}>
                                    Create Account
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    </KeyboardAvoidingView>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f9ff',
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'linear-gradient(135deg, #f5f9ff 0%, #e6f0ff 100%)',
    },
    cardContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#0052cc',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 15,
        overflow: 'hidden',
    },
    cardContainerTablet: {
        maxWidth: 800,
        flexDirection: 'row',
        height: 500,
    },
    welcomeSection: {
        backgroundColor: '#1976D2',
        padding: 25,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 100,
        justifyContent: 'center',
    },
    welcomeSectionTablet: {
        flex: 0.4,
        minHeight: 'auto',
        padding: 30,
    },
    circle1: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -25,
        right: -25,
    },
    circle2: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        bottom: -20,
        left: -20,
    },
    welcomeContent: {
        position: 'relative',
        zIndex: 1,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    loginCard: {
        padding: 30,
    },
    loginCardTablet: {
        flex: 0.6,
        padding: 40,
        justifyContent: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
    },
    logoIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    logoText: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1976D2',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
        letterSpacing: 0.8,
        textShadowColor: 'rgba(25, 118, 210, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    loginTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 25,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
        color: '#555',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    inputContainer: {
        position: 'relative',
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
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    passwordInput: {
        paddingRight: 50,
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
    eyeButton: {
        position: 'absolute',
        right: 15,
        top: '20%',
        transform: [{ translateY: -12 }],
        padding: 2,
        // backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 6,
        width: 50,
        height: 60,
        left: 'auto',
        bottom: 'auto',
        right: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeIcon: {
        right: 6,
        fontSize: 35,
    },
    loginButton: {
        backgroundColor: '#1976D2',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20,
        shadowColor: '#1976D2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
        letterSpacing: 0.5,
    },
    linksContainer: {
        alignItems: 'center',
    },
    linkButton: {
        paddingVertical: 8,
        marginBottom: 15,
    },
    linkText: {
        color: '#1976D2',
        fontSize: 15,
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    createAccountContainer: {
        marginTop: 10,
    },
    createAccountText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    createAccountLink: {
        color: '#1976D2',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;