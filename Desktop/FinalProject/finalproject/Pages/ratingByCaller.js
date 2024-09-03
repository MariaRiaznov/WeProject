import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.72:8003';


const RatingByCaller = () => {
    const [starRating, setStarRating] = useState(0);
    const [simpleRating, setSimpleRating] = useState(0);
    const [reportText, setReportText] = useState('');
    const [userId, setUserId] = useState(null);
    const [responderId, setResponderId] = useState(null);
    const [callId, setCallId] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const route = useRoute();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (!storedUserId) {
                    console.error('No user ID found');
                    return;
                }
                setUserId(storedUserId);
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        if (route.params?.callId && route.params?.responderId) {
            setCallId(route.params.callId);
            setResponderId(route.params.responderId);
            console.log('Received call_id:', route.params.callId);
            console.log('Received responder_id:', route.params.responderId);
        } else {
            if (!route.params?.callId) {
                console.error('Missing callId in route params');
            }
            if (!route.params?.responderId) {
                console.error('Missing responderId in route params');
            }
        }
    }, [route.params?.callId, route.params?.responderId]);

    useEffect(() => {
        console.log('User ID:', userId);
        console.log('Responder ID:', responderId);
        console.log('Call ID:', callId);
    }, [userId, responderId, callId]);

    const handleStarRatingPress = (selectedRating) => {
        setStarRating(selectedRating);
    };

    const handleSimpleRatingChange = (selectedRating) => {
        setSimpleRating(selectedRating);
    };

    const handleReportChange = (text) => {
        setReportText(text);
    };

    const handleConfirmation = () => {
        setShowConfirmation(false);
        navigation.navigate('HomePage');
    };

    const handleSendRating = async () => {
        console.log('Sending Rating - User ID:', userId, 'Responder ID:', responderId, 'Call ID:', callId);
        console.log('Star Rating:', starRating, 'Simple Rating:', simpleRating);

        if (!userId || !responderId || !callId) {
            console.error('User ID, Responder ID, or Call ID is missing');
            Alert.alert('Error', 'User ID, Responder ID, or Call ID is missing');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/opinions`, {
                call_id: callId,
                user_id: responderId, // Sending feedback to the responder
                user_type: 'פותח הקריאה',
                star_rating: starRating,
                simple_rating: simpleRating,
                report_text: reportText,
            });

            if (response.status === 201) {
                await axios.post(`${BASE_URL}/update-call-status`, {
                    call_id: callId,
                    status: 'טופל',
                    user_id: userId // The ID of the logged-in user (caller)
                });

                setShowConfirmation(true);
            }
        } catch (error) {
            console.error('Error submitting opinion:', error.message);
            Alert.alert('Error', 'Failed to submit opinion.');
        }
    };

    const RatingBar = ({ rating, onRatingPress }) => {
        const stars = [1, 2, 3, 4, 5];

        return (
            <View style={styles.ratingContainer}>
                {stars.map((star) => (
                    <TouchableOpacity key={star} onPress={() => onRatingPress(star)} style={styles.starButton}>
                        <MaterialIcons
                            name={star <= rating ? 'star' : 'star-border'}
                            size={36}
                            color={star <= rating ? '#FFD700' : 'gray'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const SimpleRating = ({ rating, onRatingChange }) => {
        const numbers = [1, 2, 3, 4, 5];

        return (
            <View style={styles.simpleRatingContainer}>
                <Text style={styles.simpleRatingText}>בחר דירוג:</Text>
                <View style={styles.numberContainer}>
                    {numbers.map((number) => (
                        <TouchableOpacity
                            key={number}
                            onPress={() => onRatingChange(number)}
                            style={[styles.numberButton, rating === number && styles.selectedNumberButton]}
                        >
                            <Text style={[styles.numberText, rating === number && styles.selectedNumberText]}>{number}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>בעת סיום אנא מלא את הפרטים הבאים:</Text>
            </View>

            <Text style={styles.infoText}>דרג את המתנדב שהגיע לעזור לך:</Text>
            <RatingBar rating={starRating} onRatingPress={handleStarRatingPress} />

            <Text style={[styles.infoText, styles.centerText]}>דרג את שביעות הרצון שלך מהעזרה:</Text>
            <SimpleRating rating={simpleRating} onRatingChange={handleSimpleRatingChange} />

            <Text style={[styles.reportText, { color: 'red' }]}>הערות נוספות:</Text>
            <TextInput
                style={styles.reportInput}
                multiline
                numberOfLines={4}
                placeholder="כתוב כאן את הערותיך"
                value={reportText}
                onChangeText={handleReportChange}
            />

            <Button
                mode="contained"
                onPress={handleSendRating}
                style={styles.sendButton}
                labelStyle={styles.sendButtonText}
                icon={() => <MaterialIcons name="send" size={24} color="white" />}
            >
                שלח דירוג וסגור קריאה
            </Button>
            {showConfirmation && (
                <View style={styles.confirmationDialog}>
                    <Text style={styles.confirmationText}>תודה על המשוב!</Text>
                    <Button
                        mode="contained"
                        onPress={handleConfirmation}
                        style={styles.dialogButton}
                        labelStyle={styles.dialogButtonLabel}
                    >
                        אישור
                    </Button>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    titleContainer: {
        width: '100%',
        backgroundColor: '#CED4DA',
        paddingVertical: 10,
        marginBottom: 20,
        borderRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'right',
        width: '100%',
    },
    centerText: {
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    starButton: {
        padding: 5,
    },
    simpleRatingContainer: {
        alignItems: 'center',
        width: '100%',
    },
    simpleRatingText: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    numberContainer: {
        flexDirection: 'row',
    },
    numberButton: {
        margin: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },
    selectedNumberButton: {
        backgroundColor: 'lightgreen',
        borderColor: 'green',
    },
    numberText: {
        fontSize: 16,
    },
    selectedNumberText: {
        color: 'green',
    },
    reportText: {
        fontSize: 16,
        marginTop: 20,
        width: '100%',
        textAlign: 'right',
    },
    reportInput: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        padding: 10,
        width: '100%',
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
        backgroundColor: 'white',
    },
    sendButton: {
        backgroundColor: '#D7263D',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmationDialog: {
        position: 'absolute',
        top: '30%',
        left: '10%',
        right: '10%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 10,
        zIndex: 1000,
        alignItems: 'center',
    },
    confirmationText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    dialogButton: {
        backgroundColor: '#1B998B',
        borderRadius: 5,
    },
    dialogButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default RatingByCaller;
