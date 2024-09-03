import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const BASE_URL = 'http://192.168.1.72:8003';

const UserProfile = ({ route, navigation }) => {
    const { userId } = route.params;
    const [profileImage, setProfileImage] = useState(require('../assets/images/Profile.webp'));
    const [userData, setUserData] = useState(null);
    const [opinions, setOpinions] = useState([]);
    const [avgStarRating, setAvgStarRating] = useState(0);
    const [avgSimpleRating, setAvgSimpleRating] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${userId}`
                    }
                });
                setUserData(response.data);
                setAvgStarRating(response.data.avg_star_rating || 0);
                setAvgSimpleRating(response.data.avg_simple_rating || 0);
                if (response.data.profile_image) {
                    setProfileImage({ uri: `${BASE_URL}/${response.data.profile_image}` });
                }

                const opinionsResponse = await axios.get(`${BASE_URL}/user/opinions`, {
                    headers: {
                        Authorization: `Bearer ${userId}`
                    }
                });
                setOpinions(opinionsResponse.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchData();
    }, [userId]);

    const renderStarRating = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <MaterialIcons
                    key={i}
                    name={i <= avgStarRating ? 'star' : 'star-border'}
                    size={24}
                    color={i <= avgStarRating ? '#FFD700' : 'gray'}
                />
            );
        }
        return stars;
    };

    const renderOpinions = () => {
        return opinions.map((opinion, index) => (
            <View key={index} style={styles.opinionContainer}>
                <View style={styles.ratingContainer}>
                    {Array.from({ length: 5 }, (_, i) => (
                        <MaterialIcons
                            key={i}
                            name={i < opinion.star_rating ? 'star' : 'star-border'}
                            size={24}
                            color={i < opinion.star_rating ? '#FFD700' : 'gray'}
                        />
                    ))}
                </View>
                <Text style={styles.opinionText}>דירוג התייחסות למקרה בפועל: {opinion.simple_rating}</Text>
                <Text style={styles.opinionText}>חוות דעת: {opinion.report_text}</Text>
            </View>
        ));
    };

    if (!userData) {
        return <Text>Loading...</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <MaterialIcons name="person" size={24} style={styles.icon} />
                <Text style={styles.title}>פרופיל</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.profileHeader}>
                    <Image
                        style={styles.profileImage}
                        source={profileImage}
                    />
                    <Text style={styles.profileName}>{userData.first_name} {userData.last_name}</Text>
                    <Text style={styles.profileRole}>{userData.skills}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>אימייל: {userData.email}</Text>
                    <Text style={styles.infoText}>עיר: {userData.city}</Text>
                    <Text style={styles.infoText}>כתובת: {userData.address}</Text>
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userData.calls_I_opened}</Text>
                        <Text style={styles.statLabel}>קריאות שפתחתי</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userData.calls_responded}</Text>
                        <Text style={styles.statLabel}>קריאות שנענתי</Text>
                    </View>
                </View>
                <View style={styles.ratingSummaryContainer}>
                    <Text style={styles.ratingSummaryText}>דירוג משתמש:</Text>
                    <View style={styles.ratingContainer}>
                        {renderStarRating()}
                    </View>
                    <Text style={styles.ratingSummaryText}>קריאות זהות למקרה בפועל:</Text>
                    <Text style={styles.simpleRatingText}>{avgSimpleRating}</Text>
                </View>
                <View style={styles.opinionsContainer}>
                    <Text style={styles.opinionsTitle}>חוות דעת:</Text>
                    {renderOpinions()}
                </View>
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
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    icon: {
        marginRight: 10,
        color: 'white',
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 12,
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 12,
        width: '100%',
        elevation: 3,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
        backgroundColor: '#ddd',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    profileRole: {
        fontSize: 16,
        color: 'gray',
    },
    infoContainer: {
        alignItems: 'center',
        marginVertical: 12,
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 12,
        width: '100%',
        elevation: 3,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 12,
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 12,
        width: '100%',
        elevation: 3,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 14,
        color: 'gray',
    },
    ratingSummaryContainer: {
        marginTop: 12,
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        width: '100%',
        elevation: 3,
        alignItems: 'center',
    },
    ratingSummaryText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    simpleRatingText: {
        fontSize: 18,
        color: '#333',
    },
    opinionsContainer: {
        marginTop: 12,
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        width: '100%',
        elevation: 3,
    },
    opinionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    opinionContainer: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 12,
    },
    opinionText: {
        fontSize: 16,
        color: '#333',
    },
});

export default UserProfile;
