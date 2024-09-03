import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'http://192.168.1.72:8003';
const CallsIOpenedList = ({ navigation }) => {
    const [completedCalls, setCompletedCalls] = useState([]);

    useEffect(() => {
        const fetchCompletedCalls = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    console.error('No user ID found');
                    return;
                }
                const response = await axios.get(`${BASE_URL}/user/completed-opened-calls`, {
                    headers: {
                        Authorization: `Bearer ${userId}`
                    }
                });

                const data = response.data;

                if (Array.isArray(data)) {
                    setCompletedCalls(data);
                } else {
                    console.error('Unexpected response data:', data);
                }
            } catch (error) {
                console.error('Error fetching completed calls:', error);
            }
        };
        fetchCompletedCalls();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {completedCalls.map(call => (
                    <TouchableOpacity key={call.call_id} onPress={() => navigation.navigate('CallDetails', { request: call })} style={styles.callContainer}>
                        <Text style={styles.callText}>קטגוריה: {call.category}</Text>
                        <Text style={styles.callText}>תיאור: {call.description}</Text>
                        <Text style={styles.callText}>תאריך: {new Date(call.created_at).toLocaleString()}</Text>
                        <Text style={styles.callText}>סטטוס: {call.status}</Text>
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
});

export default CallsIOpenedList;
