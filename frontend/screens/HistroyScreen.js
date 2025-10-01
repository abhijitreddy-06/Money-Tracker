import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Animated,
    Dimensions,
    ActivityIndicator,
    Alert
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const HistoryScreen = ({ navigation }) => {
    const [historyRecords, setHistoryRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    useEffect(() => {
        fetchHistory();
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

    const fetchHistory = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                Alert.alert('Error', 'You are not logged in. Please login again.');
                navigation.navigate('LoginScreen');
                return;
            }
            const response = await axios.get('http://172.16.7.155:3000/history', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHistoryRecords(response.data);
        } catch (error) {
            console.log('History fetch error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to fetch history.');
        } finally {
            setLoading(false);
        }
    };

    const renderRecordItem = ({ item }) => {
        let icon = '💰';
        let color = '#28a745';
        switch (item.type) {
            case 'Spend':
                icon = '💸';
                color = '#d32f2f';
                break;
            case 'Lent':
                icon = '🤝';
                color = '#1976D2';
                break;
            case 'Borrowed':
                icon = '📥';
                color = '#f57c00';
                break;
            case 'Deposit':
                icon = '💰';
                color = '#28a745';
                break;
        }

        const recordDate = item.date ? new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        }) : '';

        return (
            <View style={styles.listItem}>
                <View style={styles.itemMain}>
                    <View style={styles.amountContainer}>
                        <Text style={[styles.amountText, { color }]}>{icon} ₹{item.amount}</Text>
                        <Text style={styles.dateText}>{recordDate}</Text>
                    </View>
                    <View style={styles.sourceContainer}>
                        <Text style={styles.sourceText}>{item.description}</Text>
                        {item.details && <Text style={styles.detailsText}>{item.details}</Text>}
                    </View>
                </View>
            </View>
        );
    };

    const ListEmptyComponent = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>No history records yet.</Text>
            <Text style={styles.emptySubtext}>Your transactions will appear here.</Text>
        </View>
    );

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, isTablet && styles.headerTablet]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>📜</Text>
                    <Text style={styles.logoText}>History</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    {loading ? (
                        <ActivityIndicator size="large" color="#1976D2" style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                            data={historyRecords}
                            renderItem={renderRecordItem}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={ListEmptyComponent}
                            scrollEnabled={false}
                            contentContainerStyle={historyRecords.length === 0 ? styles.emptyList : styles.recordsList}
                        />
                    )}
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
    itemMain: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    amountContainer: { alignItems: 'flex-start' },
    amountText: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    dateText: { fontSize: 12, color: '#666' },
    sourceContainer: { alignItems: 'flex-end' },
    sourceText: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
    detailsText: { fontSize: 12, color: '#666' },
    recordsList: { padding: 0 },
    emptyList: { minHeight: 200, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyIcon: { fontSize: 40, marginBottom: 16, opacity: 0.5 },
    emptyText: { fontSize: 16, color: '#666', marginBottom: 8, textAlign: 'center' },
    emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
});

export default HistoryScreen;
