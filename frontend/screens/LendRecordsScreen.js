import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Animated,
    Dimensions,
    ActivityIndicator,
    Alert,
    SafeAreaView
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
const API_URL = 'https://money-tracker-05ny.onrender.com/api';
const LendRecordsScreen = ({ navigation }) => {
    const [lendRecords, setLendRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    useEffect(() => {
        fetchLendRecords();
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

    const fetchLendRecords = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                Alert.alert('Error', 'You are not logged in. Please login again.');
                navigation.navigate('Login');
                return;
            }
            const response = await axios.get(`${API_URL}/lend`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ⚡ Modify here once you add proper '/lend' fetch in backend
            // Expecting array of lend records like [{ amount, to_whom, return_date, created_at }]
            if (Array.isArray(response.data)) {
                setLendRecords(response.data);
            } else {
                setLendRecords([]);
            }
        } catch (error) {
            console.log('Lend fetch error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to fetch lend records.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchLendRecords();
    };

    const renderRecordItem = ({ item, index }) => {
        const icon = '🤝';
        const color = '#3b82f6';
        const typeColor = '#3b82f6';

        const recordDate = item.return_date
            ? new Date(item.return_date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            })
            : '';

        return (
            <Animated.View
                style={[
                    styles.listItem,
                    {
                        opacity: fadeAnim,
                        transform: [
                            {
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 30],
                                    outputRange: [0, 30 - (index * 5)]
                                })
                            }
                        ]
                    }
                ]}
            >
                <View style={styles.itemIconContainer}>
                    <Text style={styles.itemIcon}>{icon}</Text>
                </View>

                <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                        <Text style={styles.itemDescription} numberOfLines={1}>
                            To: {item.to_whom}
                        </Text>
                        <Text style={[styles.amountText, { color }]}>
                            ₹{item.amount}
                        </Text>
                    </View>

                    <View style={styles.itemFooter}>
                        <Text style={[styles.itemType, { color: typeColor }]}>
                            Lent
                        </Text>
                        <Text style={styles.dateText}>
                            Return by {recordDate}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        );
    };

    const ListEmptyComponent = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>📄</Text>
            </View>
            <Text style={styles.emptyText}>No Lend Records Yet</Text>
            <Text style={styles.emptySubtext}>
                Your lend transactions will appear here once you add them
            </Text>
        </View>
    );

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Navigation Header */}
            <View style={[styles.header, isTablet && styles.headerTablet]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                />
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>MT</Text>
                    </View>
                    <Text style={styles.appName}>MoneyTracker</Text>
                </View>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.headerCard}>
                    <View style={styles.titleContainer}>
                        <View style={styles.titleIconContainer}>
                            <Text style={styles.titleIcon}>🤝</Text>
                        </View>
                        <Text style={styles.title}>Lend Records</Text>
                        <Text style={styles.subtitle}>
                            {lendRecords.length} total lends
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text style={styles.loadingText}>Loading your lend records...</Text>
                    </View>
                ) : (
                    <Animated.View
                        style={[
                            styles.recordsContainer,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <FlatList
                            data={lendRecords}
                            renderItem={renderRecordItem}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={ListEmptyComponent}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={
                                lendRecords.length === 0 ? styles.emptyList : styles.recordsList
                            }
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    </Animated.View>
                )}
            </View>
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
    content: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerCard: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    titleContainer: {
        alignItems: 'center',
    },
    titleIconContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#dbeafe',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    titleIcon: {
        fontSize: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
        fontFamily: 'System',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        fontFamily: 'System',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 16,
        fontFamily: 'System',
    },
    recordsContainer: {
        flex: 1,
        padding: 16,
    },
    recordsList: {
        paddingBottom: 20,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    listItem: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
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
        borderColor: '#f1f5f9',
    },
    itemIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    itemIcon: {
        fontSize: 20,
    },
    itemContent: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    itemDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        fontFamily: 'System',
        flex: 1,
        marginRight: 12,
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'System',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemType: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'System',
        textTransform: 'capitalize',
    },
    dateText: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: 'System',
    },
    detailsText: {
        fontSize: 14,
        color: '#94a3b8',
        fontFamily: 'System',
        marginTop: 4,
        fontStyle: 'italic',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#f1f5f9',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyIcon: {
        fontSize: 32,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'System',
    },
    emptySubtext: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: 'System',
    },
});

export default LendRecordsScreen;
