import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.72:8003';

const CloseCall = ({ route, navigation }) => {
    const { call } = route.params;
    const [opinion, setOpinion] = useState('');
    const [rating, setRating] = useState('');

    const handleCloseCall = async () => {
        if (!opinion || !rating) {
            Alert.alert('שגיאה', 'אנא מלא את כל השדות');
            return;
        }

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.error('No user ID found');
                return;
            }

            await axios.post(`${BASE_URL}/update-call-status`, {
                call_id: call.call_id,
                status: 'טופל',
                user_id: userId
            });

            await axios.post(`${BASE_URL}/opinions`, {
                call_id: call.call_id,
                user_id: userId,
                user_type: 'volunteer',
                star_rating: rating,
                simple_rating: rating,
                report_text: opinion
            });

            navigation.navigate('OpenCallsList');
        } catch (error) {
            console.error('Error closing call or submitting opinion:', error);
            Alert.alert('Error', 'Failed to close call or submit opinion.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>סגירת קריאה</Text>
            </View>
            <Text style={styles.label}>חוות דעת</Text>
            <TextInput
                style={styles.input}
                value={opinion}
                onChangeText={setOpinion}
                placeholder="הכנס חוות דעת"
                multiline
            />
            <Text style={styles.label}>דירוג</Text>
            <TextInput
                style={styles.input}
                value={rating}
                onChangeText={setRating}
                placeholder="הכנס דירוג בין 1 ל-5"
                keyboardType="numeric"
                maxLength={1}
            />
            <Button
                mode="contained"
                onPress={handleCloseCall}
                style={styles.button}
                labelStyle={styles.buttonText}
            >
                סגור קריאה
            </Button>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        padding: 20,
    },
    titleContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        elevation: 2,
    },
    button: {
        width: '100%',
        padding: 10,
        backgroundColor: '#D7263D',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CloseCall;
