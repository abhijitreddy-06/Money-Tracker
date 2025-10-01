import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Alert,
    ScrollView,
    SafeAreaView
} from 'react-native';
const API_URL = 'https://money-tracker-95ny.onrender.com/api';
const HomeScreen = ({ navigation }) => {
    const menuItems = [
        {
            id: 1,
            title: 'Add Expense',
            icon: '💸',
            screen: 'NewSpentMoney',
            color: '#ef4444',
            subtitle: 'Track spending'
        },
        {
            id: 2,
            title: 'Lend Money',
            icon: '📤',
            screen: 'LendMoney',
            color: '#3b82f6',
            subtitle: 'Money you lent'
        },
        {
            id: 3,
            title: 'Borrow Money',
            icon: '📥',
            screen: 'BorrowedMoney',
            color: '#f59e0b',
            subtitle: 'Money you borrowed'
        },
        {
            id: 4,
            title: 'Check Balance',
            icon: '💰',
            screen: 'balance',
            color: '#10b981',
            subtitle: 'View current balance'
        },
        {
            id: 5,
            title: 'Add Deposit',
            icon: '💳',
            screen: 'Deposit',
            color: '#8b5cf6',
            subtitle: 'Add income/money'
        },
        {
            id: 6,
            title: 'History',
            icon: '📊',
            screen: 'History',
            color: '#64748b',
            subtitle: 'Transaction history'
        }
    ];

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleMenuItemPress = (item, index) => {
        // Button press animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        setTimeout(() => {
            if (navigation) {
                navigation.navigate(item.screen);
            } else {
                Alert.alert('Navigate to ${item.title}', 'Would go to ${item.screen} screen');
            }
        }, 150);
    };

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    return (
        <SafeAreaView style={styles.container}>
            {/* Enhanced Header with Profile Icon */}
            <View style={[styles.header, isTablet && styles.headerTablet]}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>MT</Text>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.appName}>MoneyTracker</Text>
                        <Text style={styles.appSubtitle}>Finance Manager</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={handleProfilePress}
                    activeOpacity={0.7}
                >
                    <View style={styles.profileIconContainer}>
                        <Text style={styles.profileIcon}>👤</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <Animated.Text
                    style={[
                        styles.welcomeTitle,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    Welcome Back!
                </Animated.Text>
                <Animated.Text
                    style={[
                        styles.welcomeSubtitle,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    Manage your finances efficiently
                </Animated.Text>
            </View>

            {/* Main Menu Grid */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.menuGrid}>
                    {menuItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            style={[
                                styles.menuItemContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateY: slideAnim.interpolate({
                                                inputRange: [0, 30],
                                                outputRange: [0, 30 - (index * 4)]
                                            })
                                        },
                                        { scale: scaleAnim }
                                    ]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.menuItem,
                                    { borderLeftColor: item.color }
                                ]}
                                onPress={() => handleMenuItemPress(item, index)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: '${item.color}15' }]}>
                                    <Text style={[styles.menuIcon, { color: item.color }]}>
                                        {item.icon}
                                    </Text>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </View>
                                <View style={styles.arrowContainer}>
                                    <Text style={styles.arrowIcon}>›</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
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
        paddingVertical: 46,
        backgroundColor: '#ffffff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    headerTablet: {
        paddingHorizontal: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoCircle: {
        width: 40,
        height: 40,
        backgroundColor: '#2563eb',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
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
    titleContainer: {
        alignItems: 'flex-start',
    },
    appName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        fontFamily: 'System',
        letterSpacing: 0.5,
    },
    appSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontFamily: 'System',
        fontWeight: '500',
        marginTop: 2,
    },
    profileButton: {
        padding: 8,
    },
    profileIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    profileIcon: {
        fontSize: 18,
        color: '#64748b',
    },
    welcomeSection: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748b',
        fontFamily: 'System',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    menuGrid: {
        padding: 16,
    },
    menuItemContainer: {
        marginBottom: 12,
    },
    menuItem: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderLeftWidth: 4,
        borderColor: '#f1f5f9',
        borderLeftColor: '#2563eb', // Default, will be overridden
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuIcon: {
        fontSize: 22,
        fontWeight: '600',
    },
    textContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1e293b',
        fontFamily: 'System',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: 'System',
    },
    arrowContainer: {
        padding: 4,
    },
    arrowIcon: {
        fontSize: 20,
        color: '#94a3b8',
        fontWeight: 'bold',
    },
    statsContainer: {
        backgroundColor: '#ffffff',
        margin: 16,
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
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 20,
        fontFamily: 'System',
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        fontFamily: 'System',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontFamily: 'System',
    },
});

export default HomeScreen;