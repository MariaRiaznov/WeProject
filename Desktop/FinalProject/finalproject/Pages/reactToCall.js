import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';

const BASE_URL = 'http://192.168.1.72:8003';

const CallDetails = ({ route, navigation }) => {
    const { call_id, current_location, first_name, last_name, phone_number, guest_user_id, guest_full_name, guest_phone, urgency, category, description, img, created_at, status, user_id } = route.params.request;
    const [callStatus, setCallStatus] = useState(status);

    const handleCall = () => {
        Linking.openURL(`tel:${phone_number}`);
    };

    const handleSMS = () => {
        Linking.openURL(`sms:${phone_number}`);
    };

    const handleRespond = () => {
        navigation.navigate('ReactToCall', { call_id: call_id });
    };

    const handleNavigate = () => {
        if (current_location) {
            const wazeUrl = `https://waze.com/ul?ll=${current_location.latitude},${current_location.longitude}&navigate=yes`;
            Linking.openURL(wazeUrl).catch(err => console.error('An error occurred', err));
        } else {
            Alert.alert('Error', 'Location information is not available.');
        }
    };

    const handleProfile = () => {
        navigation.navigate('UserProfile', { userId: user_id });
    };
    const openFullScreenImage = () => {
        navigation.navigate('FullScreenImage', { img });
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewStyle}>
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        <MaterialIcons name="chat" size={24} style={styles.icon} />
                        פרטי הקריאה
                    </Text>
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.detailText}>קטגוריה: {category}</Text>
                    <Text style={styles.detailText}>שם: {guest_user_id ? guest_full_name : first_name + ' ' + last_name}</Text>
                    <TouchableOpacity onPress={handleNavigate}>
                        <Text style={[styles.detailText, styles.address]}>
                            כתובת: {current_location}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCall}>
                        <Text style={styles.detailText}>
                            מספר פלאפון: <Text style={styles.phone}>{guest_user_id ? guest_phone : phone_number}</Text>
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.detailText}>רמת דחיפות: {urgency}</Text>
                    <Text style={styles.detailText}>תיאור: {description}</Text>
                    <Text style={styles.detailText}>זמן פתיחת הקריאה: {new Date(created_at).toLocaleString()}</Text>
                    {img && (
                        <TouchableOpacity onPress={openFullScreenImage}>
                            <Image source={{ uri: `${BASE_URL}/${img}` }} style={styles.image} />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.detailText}>סטטוס הקריאה: {callStatus}</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleCall} style={[styles.button, { backgroundColor: '#1B998B' }]}>
                        <MaterialIcons name="phone" size={24} color="white" />
                        <Text style={styles.buttonText}>התקשר</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSMS} style={[styles.button, { backgroundColor: '#1B998B' }]}>
                        <MaterialIcons name="message" size={24} color="white" />
                        <Text style={styles.buttonText}>SMS</Text>
                    </TouchableOpacity>
                </View>
                <Button
                    mode="contained"
                    onPress={handleRespond}
                    style={styles.respondButton}
                    labelStyle={styles.buttonLabel}
                    icon={() => <MaterialIcons name="reply" size={24} color="white" style={styles.icon} />}
                >
                    היענות לקריאה
                </Button>
                {!guest_user_id && (
                    <Button
                        mode="contained"
                        onPress={handleProfile}
                        style={styles.profileButton}
                        labelStyle={styles.buttonLabel}
                        icon={() => <MaterialIcons name="person" size={24} color="white" style={styles.icon} />}
                    >
                        לפרופיל המשתמש
                    </Button>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#f4f4f4',
    },
    scrollViewStyle: {
        paddingVertical: 20,
        paddingHorizontal: 10,
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    icon: {
        marginRight: 10,
        color: 'white',
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    detailText: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'right',
    },
    address: {
        color: '#1B998B',
        textDecorationLine: 'underline',
    },
    phone: {
        textDecorationLine: 'underline',
        color: '#1B998B',
    },
    respondButton: {
        width: '90%',
        marginTop: 20,
        borderRadius: 5,
        backgroundColor: "#D7263D",
    },
    profileButton: {
        width: '90%',
        marginTop: 10,
        borderRadius: 5,
        backgroundColor: "#1B998B",
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        width: "40%",
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        margin: 5,
    },
});

export default CallDetails;
