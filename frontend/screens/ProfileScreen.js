import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Alert,
    SafeAreaView,
    Dimensions
} from 'react-native';

const ProfileScreen = ({ navigation }) => {
    const [userData, setUserData] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 9876543210',
        joinDate: 'Jan 2024'
    });

    const [records, setRecords] = useState({
        lend: 5,
        spent: 23,
        borrowed: 3,
        deposit: 8
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    React.useEffect(() => {
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
            })
        ]).start();
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        // Handle logout logic here
                        navigation.replace('Login');
                    }
                }
            ]
        );
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleEditProfile = () => {
        Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
    };

    const handleRecordPress = (type) => {
        let screenName = '';
        switch (type) {
            case 'lend':
                screenName = 'LendRecords';
                break;
            case 'spent':
                screenName = 'SpentRecords';
                break;
            case 'borrowed':
                screenName = 'BorrowedRecords';
                break;
            case 'deposit':
                screenName = 'DepositRecords';
                break;
        }

        if (screenName) {
            navigation.navigate(screenName);
        } else {
            Alert.alert('Coming Soon', 'This feature is under development');
        }
    };

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    const RecordCard = ({ title, count, type, color, icon }) => (
        <TouchableOpacity
            style={[styles.recordCard, { borderLeftColor: color }]}
            onPress={() => handleRecordPress(type)}
            activeOpacity={0.8}
        >
            <View style={styles.recordHeader}>
                <View style={[styles.recordIcon, { backgroundColor: `${color}15` }]}>
                    <Text style={[styles.recordIconText, { color }]}>{icon}</Text>
                </View>
                <Text style={styles.recordCount}>{count}</Text>
            </View>
            <Text style={styles.recordTitle}>{title}</Text>
            <Text style={styles.recordSubtitle}>Tap to view details</Text>
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
                    <View style={styles.backButtonContainer}>
                        <Text style={styles.backIcon}>‹</Text>
                        <Text style={styles.backText}>Back</Text>
                    </View>
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
                {/* Profile Header Section */}
                <Animated.View
                    style={[
                        styles.profileHeader,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {userData.name.split(' ').map(n => n[0]).join('')}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={handleEditProfile}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    <Text style={styles.userPhone}>{userData.phone}</Text>

                    <View style={styles.memberSince}>
                        <Text style={styles.memberSinceText}>
                            Member since {userData.joinDate}
                        </Text>
                    </View>
                </Animated.View>

                {/* Records Overview Section */}
                <Animated.View
                    style={[
                        styles.section,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={styles.sectionTitle}>Records Overview</Text>
                    <Text style={styles.sectionSubtitle}>Your financial activity summary</Text>

                    <View style={styles.recordsGrid}>
                        <RecordCard
                            title="Lend Records"
                            count={records.lend}
                            type="lend"
                            color="#3b82f6"
                            icon="📤"
                        />
                        <RecordCard
                            title="Spent Records"
                            count={records.spent}
                            type="spent"
                            color="#ef4444"
                            icon="💸"
                        />
                        <RecordCard
                            title="Borrowed Records"
                            count={records.borrowed}
                            type="borrowed"
                            color="#f59e0b"
                            icon="📥"
                        />
                        <RecordCard
                            title="Deposit Records"
                            count={records.deposit}
                            type="deposit"
                            color="#10b981"
                            icon="💰"
                        />
                    </View>
                </Animated.View>

                {/* Quick Stats Section */}
                <Animated.View
                    style={[
                        styles.section,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={styles.sectionTitle}>Quick Stats</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>₹15,000</Text>
                            <Text style={styles.statLabel}>Total Balance</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>₹8,500</Text>
                            <Text style={styles.statLabel}>Total Spent</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>₹2,000</Text>
                            <Text style={styles.statLabel}>Total Lent</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Account Actions Section */}
                <Animated.View
                    style={[
                        styles.section,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={styles.sectionTitle}>Account</Text>

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
                            <View style={styles.actionIconContainer}>
                                <Text style={styles.actionIcon}>⚙️</Text>
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={styles.actionTitle}>Settings</Text>
                                <Text style={styles.actionSubtitle}>App preferences and settings</Text>
                            </View>
                            <Text style={styles.arrowIcon}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
                            <View style={styles.actionIconContainer}>
                                <Text style={styles.actionIcon}>🛡️</Text>
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={styles.actionTitle}>Privacy & Security</Text>
                                <Text style={styles.actionSubtitle}>Manage your data and security</Text>
                            </View>
                            <Text style={styles.arrowIcon}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
                            <View style={styles.actionIconContainer}>
                                <Text style={styles.actionIcon}>❓</Text>
                            </View>
                            <View style={styles.actionTextContainer}>
                                <Text style={styles.actionTitle}>Help & Support</Text>
                                <Text style={styles.actionSubtitle}>Get help and contact support</Text>
                            </View>
                            <Text style={styles.arrowIcon}>›</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Logout Button */}
                <Animated.View
                    style={[
                        styles.logoutContainer,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>MoneyTracker v1.0.0</Text>
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
        width: 36,
        height: 36,
        backgroundColor: '#2563eb',
        borderRadius: 18,
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
        fontSize: 16,
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
        paddingBottom: 40,
        backgroundColor: '#f8fafc',
    },
    profileHeader: {
        backgroundColor: '#ffffff',
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        backgroundColor: '#2563eb',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#ffffff',
        fontFamily: 'System',
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#ffffff',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    editIcon: {
        fontSize: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
    },
    userEmail: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 2,
        fontFamily: 'System',
    },
    userPhone: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 16,
        fontFamily: 'System',
    },
    memberSince: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    memberSinceText: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: 'System',
    },
    section: {
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 20,
        fontFamily: 'System',
    },
    recordsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    recordCard: {
        width: '48%',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    recordIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordIconText: {
        fontSize: 18,
        fontWeight: '600',
    },
    recordCount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        fontFamily: 'System',
    },
    recordTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
    },
    recordSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontFamily: 'System',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontFamily: 'System',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
    },
    actionsContainer: {
        marginTop: 8,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    actionIcon: {
        fontSize: 18,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        fontFamily: 'System',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: 'System',
    },
    arrowIcon: {
        fontSize: 20,
        color: '#94a3b8',
        fontWeight: 'bold',
    },
    logoutContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    logoutButton: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#fef2f2',
    },
    logoutIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    logoutText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ef4444',
        fontFamily: 'System',
    },
    versionContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    versionText: {
        fontSize: 14,
        color: '#94a3b8',
        fontFamily: 'System',
    },
});

export default ProfileScreen;