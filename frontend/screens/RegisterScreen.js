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
    Dimensions
} from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
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

    const handleSubmit = async () => {
        const { name, phone, password } = formData;

        if (!name || !phone || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            // Replace IP with your backend server IP/URL
            const response = await axios.post('http://172.16.7.155:3000/register', formData);

            if (response.status === 201) {
                Alert.alert('Success', 'Account created successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('Login') // navigate to Login screen
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.background}>
                <View style={[styles.cardContainer, isTablet && styles.cardContainerTablet]}>
                    <View style={[styles.welcomeSection, isTablet && styles.welcomeSectionTablet]}>
                        <View style={styles.circle1} />
                        <View style={styles.circle2} />
                        <View style={styles.welcomeContent}>
                            <Text style={styles.welcomeTitle}>Create Account!</Text>
                        </View>
                    </View>

                    <View style={[styles.registerCard, isTablet && styles.registerCardTablet]}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoIcon}>💼</Text>
                            <Text style={styles.logoText}>MoneyTracker</Text>
                        </View>

                        <Text style={styles.registerTitle}>Join MoneyTracker Today</Text>

                        {/* Name Input */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={[styles.input, focusedField === 'name' && styles.inputFocused]}
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Enter your full name"
                                placeholderTextColor="#777"
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Phone Input */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={[styles.input, focusedField === 'phone' && styles.inputFocused]}
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
                                    placeholder="Create a password"
                                    placeholderTextColor="#777"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={togglePasswordVisibility}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.eyeIcon}>{showPassword ? '🐵' : '🙈'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleSubmit}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.registerButtonText}>Create Account</Text>
                        </TouchableOpacity>

                        <View style={styles.loginRedirectContainer}>
                            <Text style={styles.loginRedirectText}>
                                Already have an account?{' '}
                                <Text style={styles.loginRedirectLink} onPress={handleLoginRedirect}>
                                    Login
                                </Text>
                            </Text>
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
        height: 550,
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
    registerCard: {
        padding: 30,
    },
    registerCardTablet: {
        flex: 0.6,
        padding: 40,
        justifyContent: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
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
    registerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 25,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    formGroup: {
        marginBottom: 18,
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
    registerButton: {
        backgroundColor: '#28a745',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20,
        shadowColor: '#28a745',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    registerButtonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
        letterSpacing: 0.5,
    },
    loginRedirectContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    loginRedirectText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    loginRedirectLink: {
        color: '#1976D2',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;