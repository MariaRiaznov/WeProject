import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Switch, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';

const BASE_URL = 'http://192.168.1.72:8003';

const ProfilePage = ({ navigation }) => {
    const [remindersEnabled, setRemindersEnabled] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [helpEnabled, setHelpEnabled] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [userData, setUserData] = useState(null);
    const [opinions, setOpinions] = useState([]);
    const [avgStarRating, setAvgStarRating] = useState(0);
    const [avgSimpleRating, setAvgSimpleRating] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [openCalls, setOpenCalls] = useState(0);
    const [respondedCallsCount, setRespondedCallsCount] = useState(0);
    const [completedOpenedCallsCount, setCompletedOpenedCallsCount] = useState(0);
    const [showImageDialog, setShowImageDialog] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    console.error('No user ID found');
                    return;
                }
                const profileResponse = await axios.get(`${BASE_URL}/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${userId}`
                    }
                });
                console.log("User Data:", profileResponse.data);
                setUserData(profileResponse.data);
                setEmail(profileResponse.data.email);
                setCity(profileResponse.data.city);
                setAddress(profileResponse.data.address);
                setAvgStarRating(profileResponse.data.avg_star_rating || 0);
                setAvgSimpleRating(profileResponse.data.avg_simple_rating || 0);
                setOpenCalls(profileResponse.data.open_calls || 0);
                setRespondedCallsCount(profileResponse.data.calls_responded || 0);
                setCompletedOpenedCallsCount(profileResponse.data.calls_I_opened || 0);
                if (profileResponse.data.profile_image) {
                    setProfileImage({ uri: `${BASE_URL}/${profileResponse.data.profile_image}` });

                }

                const opinionsResponse = await axios.get(`${BASE_URL}/user/opinions`, {
                    headers: {
                        Authorization: `Bearer ${userId}`
                    }
                });
                console.log("Opinions Data:", opinionsResponse.data);
                setOpinions(opinionsResponse.data);

                const openCallsCountResponse = await axios.get(`${BASE_URL}/user/open-calls-count`, {
                    headers: {
                        Authorization: `Bearer ${userId}`
                    }
                });
                console.log("Open Calls Count:", openCallsCountResponse.data);
                setOpenCalls(openCallsCountResponse.data.open_calls_count);

                const completedOpenedCallsResponse = await axios.get(`${BASE_URL}/user/completed-opened-calls-count`, {
                    headers: {
                        Authorization: `Bearer ${userId}`
                    }
                });
                console.log("Completed Opened Calls Count:", completedOpenedCallsResponse.data);
                if (completedOpenedCallsResponse.data && completedOpenedCallsResponse.data.completed_opened_calls_count !== undefined) {
                    setCompletedOpenedCallsCount(completedOpenedCallsResponse.data.completed_opened_calls_count);
                } else {
                    console.error("Unexpected response data:", completedOpenedCallsResponse.data);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchData();
    }, []);

    const fetchUserSettings = async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/user/settings`, {
                headers: {
                    Authorization: `Bearer ${userId}`
                }
            });

            if (response.status === 200) {
                const settings = response.data;
                setRemindersEnabled(settings.reminders_enabled);
                setNotificationsEnabled(settings.notifications_enabled);
                setHelpEnabled(settings.help_enabled);
            }
        } catch (error) {
            console.error('Error fetching user settings:', error);
        }
    };

    const chooseImageSource = () => {
        setShowImageDialog(true);
    };

    const pickImageFromGallery = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            await updateProfileImage(imageUri);
            setShowImageDialog(false);
        }
    };

    const takePhoto = async () => {
        const hasCameraPermission = await requestCameraPermission();
        if (!hasCameraPermission) return;

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            await updateProfileImage(imageUri);
            setShowImageDialog(false);
        }
    };

    const updateProfileImage = async (imageUri) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.error('No user ID found');
                return;
            }

            const formData = new FormData();
            formData.append('profile_image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'profile_image.jpg'
            });

            const response = await axios.post(`${BASE_URL}/user/update-profile-image`, formData, {
                headers: {
                    Authorization: `Bearer ${userId}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                console.log('Profile image updated successfully');
                const imagePath = response.data.imagePath;
                if (imagePath) {
                    setProfileImage({ uri: `${BASE_URL}/${imagePath.replace(BASE_URL + '/', '')}` });
                }
            }
        } catch (error) {
            console.error('Error updating profile image:', error);
            Alert.alert('Error', 'Failed to update profile image. Please try again.');        }
    };

    const removeProfileImage = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.error('No user ID found');
                return;
            }

            const response = await axios.post(`${BASE_URL}/user/remove-profile-image`, {}, {
                headers: {
                    Authorization: `Bearer ${userId}`
                }
            });

            if (response.status === 200) {
                console.log('Profile image removed successfully');
                setProfileImage(null);
                setShowImageDialog(false);
            }
        } catch (error) {
            console.error('Error removing profile image:', error);
        }
    };

    const updateSettings = async (settings) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.error('No user ID found');
                return;
            }

            const response = await axios.post(`${BASE_URL}/user/update-settings`, settings, {
                headers: {
                    Authorization: `Bearer ${userId}`
                }
            });

            if (response.status === 200) {
                console.log('Settings updated successfully');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    const handleRemindersToggle = (value) => {
        setRemindersEnabled(value);
        updateSettings({ remindersEnabled: value });
    };

    const handleNotificationsToggle = (value) => {
        setNotificationsEnabled(value);
        updateSettings({ notificationsEnabled: value });
    };

    const handleHelpToggle = (value) => {
        setHelpEnabled(value);
        updateSettings({ helpEnabled: value });
    };

    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'You need to enable camera access to take photos.');
            return false;
        }
        return true;
    };

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

    const handleEditPress = () => {
        if (isEditing) {
            const updatedUserData = { user_id: userData.user_id, email, city, address };
            setUserData(updatedUserData);
            updateUserData(updatedUserData);
        }
        setIsEditing(!isEditing);
    };

    const updateUserData = async (data) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.error('No user ID found');
                return;
            }
            const response = await axios.post(`${BASE_URL}/user/update-profile`, data, {
                headers: {
                    Authorization: `Bearer ${userId}`
                }
            });
            if (response.status === 200) {
                console.log('User data updated successfully');
            } else {
                console.error('Failed to update user data', response.data);
            }
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const handleOpenCallsPress = () => {
        navigation.navigate('openCallsList');
    };

    const handleCompletedCallsPress = () => {
        navigation.navigate('completedCallsList');
    };

    const handleCallsIOpenedPress = () => {
        navigation.navigate('callsIOpened');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <MaterialIcons name="person" size={24} style={styles.icon} />
                <Text style={styles.title}>פרופיל</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.profileHeader}>
                    <TouchableOpacity onPress={chooseImageSource}>
                        <Image
                            style={styles.profileImage}
                            source={profileImage ? profileImage : require('../assets/images/AvatarMen.jpg')}
                        />
                    </TouchableOpacity>
                    {userData && (
                        <>
                            <Text style={styles.profileName}>{userData.first_name} {userData.last_name}</Text>
                            <Text style={styles.profileRole}>{userData.skills}</Text>
                        </>
                    )}
                </View>
                {userData && (
                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>אימייל:</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.infoValue}
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            ) : (
                                <Text style={styles.infoValue}>{userData.email}</Text>
                            )}
                            <TouchableOpacity onPress={handleEditPress} style={styles.editIcon}>
                                <MaterialIcons name={isEditing ? "done" : "edit"} size={24} color="#1B998B" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>עיר:</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.infoValue}
                                    value={city}
                                    onChangeText={setCity}
                                />
                            ) : (
                                <Text style={styles.infoValue}>{userData.city}</Text>
                            )}
                            <TouchableOpacity onPress={handleEditPress} style={styles.editIcon}>
                                <MaterialIcons name={isEditing ? "done" : "edit"} size={24} color="#1B998B" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>כתובת:</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.infoValue}
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            ) : (
                                <Text style={styles.infoValue}>{userData.address}</Text>
                            )}
                            <TouchableOpacity onPress={handleEditPress} style={styles.editIcon}>
                                <MaterialIcons name={isEditing ? "done" : "edit"} size={24} color="#1B998B" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                <View style={styles.statsContainer}>
                    <TouchableOpacity style={styles.statItem} onPress={handleOpenCallsPress}>
                        <Text style={styles.statNumber}>{openCalls}</Text>
                        <Text style={styles.statLabel}>קריאות פתוחות</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem} onPress={handleCallsIOpenedPress}>
                        <Text style={styles.statNumber}>{completedOpenedCallsCount}</Text>
                        <Text style={styles.statLabel}>קריאות שפתחתי</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem} onPress={handleCompletedCallsPress}>
                        <Text style={styles.statNumber}>{respondedCallsCount}</Text>
                        <Text style={styles.statLabel}>קריאות שנענתי</Text>
                    </TouchableOpacity>
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
                <View style={styles.settingsContainer}>
                    <View style={styles.settingsItem}>
                        <Text style={styles.settingsLabel}>תן עדיפות לקריאות רלוונטיות</Text>
                        <Switch
                            value={remindersEnabled}
                            onValueChange={handleRemindersToggle}
                        />
                    </View>
                    <View style={styles.settingsItem}>
                        <Text style={styles.settingsLabel}>שתף את המיקום שלי בזמן אמת</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleNotificationsToggle}
                        />
                    </View>
                    <View style={styles.settingsItem}>
                        <Text style={styles.settingsLabel}>שלח לי התראה על קריאות רלוונטיות</Text>
                        <Switch
                            value={helpEnabled}
                            onValueChange={handleHelpToggle}
                        />
                    </View>
                </View>
            </ScrollView>
            {showImageDialog && (
                <View style={styles.dialogContainer}>
                    <Text style={styles.dialogTitle}>בחר מקור תמונה</Text>
                    <View style={styles.dialogButtons}>
                        <Button mode="contained" onPress={pickImageFromGallery} style={styles.dialogButton}>
                            בחירה מהגלריה
                        </Button>
                        <Button mode="contained" onPress={takePhoto} style={styles.dialogButton}>
                            צילום
                        </Button>
                        <Button mode="contained" onPress={removeProfileImage} style={styles.dialogButton}>
                            הסר תמונה
                        </Button>
                        <Button mode="outlined" onPress={() => setShowImageDialog(false)} style={[styles.dialogButton, styles.cancelButton]} labelStyle={[styles.dialogButtonLabel, { color: 'white' }]}>
                            ביטול
                        </Button>
                    </View>
                </View>
            )}
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
    infoRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        textAlign: 'left',
    },
    infoValue: {
        fontSize: 16,
        color: '#555',
        flex: 3,
        textAlign: 'center',
    },
    infoInput: {
        fontSize: 16,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flex: 1,
        marginLeft: 5,
    },
    editIcon: {
        flex: 1,
        alignItems: 'flex-start',
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
    settingsContainer: {
        marginTop: 12,
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        width: '100%',
        paddingVertical: 16,
        elevation: 3,
    },
    settingsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    settingsLabel: {
        fontSize: 16,
        color: '#333',
    },
    dialogContainer: {
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
    dialogTitle: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    dialogButtons: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        width: '100%',
    },
    dialogButton: {
        marginVertical: 5,
        backgroundColor: '#1B998B'
    },
    cancelButton: {
        backgroundColor: 'gray',
    },
});

export default ProfilePage;
