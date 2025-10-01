import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Alert,
    ScrollView
} from 'react-native';

const HomeScreen = ({ navigation }) => {
    const menuItems = [
        {
            id: 1,
            title: 'New Spent Money',
            icon: '💸',
            screen: 'NewSpentMoney'
        },
        {
            id: 2,
            title: 'Lend Money',
            icon: '📤',
            screen: 'LendMoney'
        },
        {
            id: 3,
            title: 'Borrowed Money',
            icon: '📥',
            screen: 'BorrowedMoney'
        },
        {
            id: 4,
            title: 'Check Balance',
            icon: '💰',
            screen: 'Profile'
        },
        {
            id: 5,
            title: 'Deposit Money',
            icon: '💳',
            screen: 'Deposit'
        },
        {
            id: 6,
            title: 'History',
            icon: '📊',
            screen: 'History'
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
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleMenuItemPress = (item) => {
        // Button press animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            })
        ]).start();

        if (navigation) {
            navigation.navigate(item.screen);
        } else {
            Alert.alert(`Navigate to ${item.title}`, `Would go to ${item.screen} screen`);
        }
    };

    const { width, height } = Dimensions.get('window');
    const isTablet = width > 768;

    return (
        <View style={styles.container}>
            {/* Compact Header */}
            <View style={[styles.header, isTablet && styles.headerTablet]}>
                <View style={styles.logoContainer}>
                    <Animated.Text
                        style={[
                            styles.logoIcon,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}
                    >
                        💼
                    </Animated.Text>
                    <Animated.Text
                        style={[
                            styles.logoText,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateX: slideAnim }]
                            }
                        ]}
                    >
                        MoneyTracker
                    </Animated.Text>
                </View>
            </View>

            {/* Scrollable Main Menu */}
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
                                        { translateY: slideAnim },
                                        { scale: scaleAnim }
                                    ]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleMenuItemPress(item)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
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
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
        paddingVertical: 25,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    logoText: {
        fontSize: 22,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 0.8,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    menuGrid: {
        padding: 15,
        paddingTop: 20,
    },
    menuItemContainer: {
        marginBottom: 15,
    },
    menuItem: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0052cc',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1.5,
        borderColor: '#f0f0f0',
        minHeight: 90,
    },
    menuIcon: {
        fontSize: 26,
        marginBottom: 8,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        fontFamily: 'System',
    },
});

export default HomeScreen;