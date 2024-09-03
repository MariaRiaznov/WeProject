import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'http://192.168.1.72:8003';

const OpenCallsList = ({ navigation }) => {
    const [openCalls, setOpenCalls] = useState([]);

    useEffect(() => {
        const fetchOpenCalls = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    console.error('No user ID found');
                    return;
                }
                const response = await axios.get(`${BASE_URL}/user/open-calls`, {
                    headers: {
                        Authorization: `Bearer ${userId}`
                    }
                });

                const data = response.data;

                if (Array.isArray(data)) {
                    const processedCalls = data.map(call => ({
                        ...call,
                        responded_users: call.responded_users || []
                    }));
                    setOpenCalls(processedCalls);
                } else {
                    console.error('Unexpected response data:', data);
                }
            } catch (error) {
                console.error('Error fetching open calls:', error);
            }
        };
        fetchOpenCalls();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {openCalls.map(call => (
                    <TouchableOpacity
                        key={call.call_id}
                        onPress={() => {
                            const responderId = call.responded_by_user_id; // עדכון לזהות המתנדב
                            console.log('Navigating to ratingByCaller with callId:', call.call_id, 'and responderId:', responderId);
                            navigation.navigate('ratingByCaller', {
                                callId: call.call_id,
                                responderId: responderId
                            });
                        }}
                        style={styles.callContainer}>
                        <Text style={styles.callText}>קטגוריה: {call.category}</Text>
                        <Text style={styles.callText}>תיאור: {call.description}</Text>
                        <Text style={styles.callText}>תאריך: {new Date(call.created_at).toLocaleString()}</Text>
                        <Text style={styles.callText}>סטטוס: {call.status}</Text>
                        {call.status === 'בטיפול' && call.responded_by_user_id && (
                            <View style={styles.respondedUsersContainer}>
                                <Text style={styles.respondedUsersTitle}>מתנדב שנענה:</Text>
                                <Text style={styles.respondedUser}>{call.responded_first_name} {call.responded_last_name}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        padding: 15,
    },
    scrollViewContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
    },
    callContainer: {
        width: '100%',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        elevation: 3,
        marginBottom: 10,
    },
    callText: {
        fontSize: 16,
        marginBottom: 5,
    },
    respondedUsersContainer: {
        marginTop: 10,
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
    },
    respondedUsersTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    respondedUser: {
        fontSize: 14,
        color: '#555',
    },
});

export default OpenCallsList;