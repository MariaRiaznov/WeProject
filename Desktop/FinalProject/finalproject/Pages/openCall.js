import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    ScrollView,
    Image,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../component/CustomAlert';


const BASE_URL = 'http://192.168.1.72:8003';

const OpenCallPage = () => {
    const [currentLocation, setCurrentLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [openUrgency, setOpenUrgency] = useState(false);
    const [valueUrgency, setValueUrgency] = useState(null);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isOtherCategoryVisible, setIsOtherCategoryVisible] = useState(false);
    const [otherCategory, setOtherCategory] = useState('');
    const [openCategory, setOpenCategory] = useState(false);
    const [valueCategory, setValueCategory] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const navigation = useNavigation();
    const [selectedImages, setSelectedImages] = useState([]);
    const [isImageFullScreen, setIsImageFullScreen] = useState(false);
    const [userName, setUserName] = useState('');
    const mapRef = useRef(null);
    const [showAlert, setShowAlert] = useState(false);

    // משתנים חדשים לניהול הערכים הדרושים
    const [alertData, setAlertData] = useState({
        categoryToSend: '',
        phoneToUse: '',
        formattedDate: '',
        selectedImages: [],
    });

    useEffect(() => {
        if (location && mapRef.current && mapReady) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000);
        }
    }, [location, mapReady]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    const response = await axios.get(`${BASE_URL}/user/profile`, {
                        headers: {
                            Authorization: `Bearer ${userId}`
                        }
                    });
                    if (response.data) {
                        setUserName(`${response.data.first_name} ${response.data.last_name}`);
                        setPhone(response.data.phone_number.toString()); // Ensure phone number is a string
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const chooseImageSource = () => {
        Alert.alert(
            "בחר מקור תמונה",
            "",
            [
                {
                    text: "ביטול",
                    onPress: () => console.log("ביטול"),
                    style: "cancel",
                },
                {
                    text: "בחירה מהגלריה",
                    onPress: addImage,
                },
                {
                    text: "צילום",
                    onPress: takePhoto,
                },
            ],
            { cancelable: false }
        );
    };

    const handleOpenCallPage = async () => {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}`;
        const phoneToUse = phone;
        const categoryToSend = valueCategory === 'אחר' ? otherCategory : valueCategory;

        try {
            const userId = await AsyncStorage.getItem('userId');

            // העלאת התמונה לשרת
            if (selectedImages.length > 0) {
                const formData = new FormData();
                formData.append('image', {
                    uri: selectedImages[0], // השתמש בנתיב של התמונה שנבחרה
                    name: 'photo.jpg',
                    type: 'image/jpeg',
                });

                const responseUpload = await axios.post(`${BASE_URL}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // שליחת הבקשה לפתיחת קריאה
                const response = await axios.post(`${BASE_URL}/calls`, {
                    user_id: userId,
                    category: categoryToSend,
                    urgency: valueUrgency,
                    current_location: currentLocation,
                    description,
                    img: responseUpload.data.imagePath, // שמירת הנתיב של התמונה
                });

                if (response.status === 201) {
                    setShowAlert(true);
                }
            } else {
                Alert.alert('Error', 'No image selected');
            }
        } catch (error) {
            console.error('Error opening the call:', error.message);
            Alert.alert('Error', 'Failed to open the call.');
        }
    };

    const guestCall = () => {
        navigation.navigate('GuestCall');
    };

    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'You need to enable camera access to take photos.');
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        const hasCameraPermission = await requestCameraPermission();
        if (!hasCameraPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            console.log('Result:', result);

            if (!result.canceled) {
                setSelectedImages([...selectedImages, result.assets[0].uri]);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        }
    };

    const addImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'You need to enable media library access to choose photos.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            console.log('Result:', result);

            if (!result.canceled) {
                setSelectedImages([...selectedImages, result.assets[0].uri]);
            }
        } catch (error) {
            console.error('Error choosing photo from gallery:', error);
        }
    };

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        let { coords } = await Location.getCurrentPositionAsync({});
        console.log('Current location:', coords);
        setLocation(coords);

        let reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude,
        });

        if (reverseGeocode.length > 0) {
            let currentLocation = `${reverseGeocode[0].street}, ${reverseGeocode[0].city}, ${reverseGeocode[0].region}`;
            console.log('Current location from reverse geocode:', currentLocation);
            setCurrentLocation(currentLocation);
        } else {
            setCurrentLocation('Location not available');
        }
        setShowMap(true);
    };

    const closeMap = () => {
        setShowMap(false);
    };

    const renderSelectedImages = () => {
        return selectedImages.map((imageUri, index) => (
            <TouchableOpacity key={index} onPress={() => navigation.navigate('FullScreenImage', { img: imageUri })}>
                <Image source={{ uri: imageUri }} style={styles.image} />
            </TouchableOpacity>
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewStyle}>
                <View style={styles.titleContainer}>
                    <Text style={styles.heading}>
                        <MaterialIcons name="create" size={24} style={styles.icon} />
                        פתיחת קריאה חדשה
                    </Text>
                </View>
                <DropDownPicker
                    items={[
                        { label: 'חיות', value: 'חיות' },
                        { label: 'רפואה', value: 'רפואה' },
                        { label: 'צד הכביש', value: 'צד הכביש' },
                        { label: 'אירוע רב נפגעים', value: 'אירוע רב נפגעים' },
                        { label: 'חקלאות', value: 'חקלאות' },
                        { label: 'חשמל', value: 'חשמל' },
                        { label: 'אסון טבע', value: 'אסון טבע' },
                        { label: 'אחר', value: 'אחר' },
                    ]}
                    open={openCategory}
                    value={valueCategory}
                    setOpen={setOpenCategory}
                    setValue={setValueCategory}
                    placeholder="קטגוריה"
                    containerStyle={styles.dropDownPickerContainer}
                    style={styles.dropDownPickerStyle}
                    itemStyle={styles.dropDownPickerItemStyle}
                    labelStyle={styles.dropDownPickerLabelStyle}
                    selectedLabelStyle={styles.dropDownPickerSelectedLabelStyle}
                    placeholderStyle={styles.dropDownPickerPlaceholderStyle}
                    activeItemStyle={styles.dropDownPickerActiveItemStyle}
                    arrowStyle={styles.dropDownPickerArrowStyle}
                    listMode="MODAL"
                    onChangeValue={(value) => {
                        setValueCategory(value);
                        if (value === 'אחר') {
                            setIsOtherCategoryVisible(true);
                        } else {
                            setIsOtherCategoryVisible(false);
                        }
                        setOtherCategory('');
                    }}
                    dropDownMaxHeight={250}
                />
                {isOtherCategoryVisible && valueCategory === 'אחר' && (
                    <TextInput
                        style={styles.input}
                        placeholder="קטגוריה אחרת"
                        onChangeText={setOtherCategory}
                        value={otherCategory}
                    />
                )}
                <DropDownPicker
                    items={[
                        { label: 'נמוכה', value: 'נמוכה' },
                        { label: 'בינונית', value: 'בינונית' },
                        { label: 'גבוהה', value: 'גבוהה' },
                    ]}
                    open={openUrgency}
                    value={valueUrgency}
                    setOpen={setOpenUrgency}
                    setValue={setValueUrgency}
                    placeholder="רמת דחיפות"
                    containerStyle={styles.dropDownPickerContainer}
                    style={[styles.dropDownPickerStyle, { zIndex: 4000 }]}
                    itemStyle={styles.dropDownPickerItemStyle}
                    labelStyle={styles.dropDownPickerLabelStyle}
                    selectedLabelStyle={styles.dropDownPickerSelectedLabelStyle}
                    placeholderStyle={styles.dropDownPickerPlaceholderStyle}
                    activeItemStyle={styles.dropDownPickerActiveItemStyle}
                    arrowStyle={styles.dropDownPickerArrowStyle}
                    listMode="MODAL"
                    onClose={() => setOpenUrgency(false)}
                />

                <TextInput
                    style={[styles.input, styles.phoneInput]}
                    keyboardType="numeric"
                    placeholder="מספר פלאפון"
                    maxLength={10}
                    minLength={10}
                    onChangeText={setPhone}
                    value={phone}
                    placeholderTextColor="#ccc"
                />
                <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    placeholder="תיאור..."
                    multiline={true}
                    onChangeText={setDescription}
                    value={description}
                    textAlignVertical="top"
                    placeholderTextColor="#ccc"
                />
                <TextInput
                    style={styles.input}
                    placeholder="כתובת האירוע"
                    onChangeText={setCurrentLocation}
                    value={currentLocation}
                    placeholderTextColor="#ccc"
                />
                {showMap && location && (
                    <View style={styles.mapContainer}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            onMapReady={() => setMapReady(true)}
                        >
                            <Marker
                                coordinate={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                }}
                                title="המיקום הנוכחי שלך"
                            />
                        </MapView>
                        <Button mode="contained" style={styles.closeMapButton} onPress={closeMap}>
                            <MaterialCommunityIcons name="close" size={24} color="white" />
                            <Text style={styles.buttonText}>סגור מפה</Text>
                        </Button>
                    </View>
                )}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={chooseImageSource}>
                        <Image source={require('../assets/images/selectFromGallery.png')} style={styles.iconImage} />
                        <Text style={styles.iconButtonText}>הוסף תמונה</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={getCurrentLocation}>
                        <Image source={require('../assets/images/addLocation.png')} style={styles.iconImage} />
                        <Text style={styles.iconButtonText}>הוסף מיקום</Text>
                    </TouchableOpacity>
                </View>
                {renderSelectedImages()}
                <Button mode="contained" style={styles.Button} onPress={handleOpenCallPage}>
                    <MaterialIcons name="warning" size={24} color="white" />
                    <Text style={styles.buttonText}>פתיחת קריאה</Text>
                </Button>
                {showAlert && (
                    <CustomAlert
                        message="הקריאה נפתחה בהצלחה"
                        onConfirm={() => {
                            setShowAlert(false);
                            navigation.navigate('HomePage', {
                                newRequest: {
                                    category: alertData.categoryToSend,
                                    current_location: currentLocation,
                                    phone: alertData.phoneToUse,
                                    urgency: valueUrgency,
                                    description,
                                    requestDate: alertData.formattedDate,
                                    takenImages: alertData.selectedImages,
                                    name: userName,
                                }
                            });
                        }}
                    />
                )}

                <TouchableOpacity onPress={() => navigation.navigate('GuestCall')} style={styles.guestCallContainer}>
                    <Text style={styles.guestCallText}>משתמש לא רשום? פתיחת קריאה כאורח</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f4f4f4',
        padding: 15,
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
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    icon: {
        marginRight: 10,
        color: 'white',
    },
    scrollViewStyle: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        textAlign: 'right',
    },
    Button: {
        backgroundColor: '#D7263D',
        height: 50,
        borderRadius: 5,
        marginBottom: 10,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 5,
    },
    dropDownPickerContainer: {
        width: '100%',
        height: 50,
        marginBottom: 10,
    },
    dropDownPickerStyle: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        height: 40,
    },
    dropDownPickerItemStyle: {
        justifyContent: 'flex-start',
    },
    dropDownPickerLabelStyle: {
        textAlign: 'right',
        color: '#000',
    },
    dropDownPickerSelectedLabelStyle: {
        color: '#000',
    },
    dropDownPickerPlaceholderStyle: {
        textAlign: 'right',
        color: '#ccc',
    },
    dropDownPickerActiveItemStyle: {
        backgroundColor: '#fafafa',
    },
    dropDownPickerArrowStyle: {
        borderTopColor: '#000',
    },
    addLocationButton: {
        backgroundColor: '#1B998B',
        height: 50,
        borderRadius: 5,
        marginBottom: 10,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addLocationButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 5,
    },
    descriptionInput: {
        height: 90,
        paddingTop: 10,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 15,
    },
    imageFullScreen: {
        width: '100%',
        height: 300,
        borderRadius: 10,
        marginTop: 10,
    },
    mapContainer: {
        width: '100%',
        height: 350,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: 300,
        borderRadius: 10,
    },
    closeMapButton: {
        backgroundColor: '#D7263D',
        height: 50,
        borderRadius: 5,
        marginTop: 10,
        flexDirection: 'row',
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    phoneInput: {
        marginTop: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    iconButton: {
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '48%',
    },
    iconImage: {
        width: 70,
        height: 50,
    },
    iconButtonText: {
        textAlign: 'center',
        marginTop: 5,
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    guestCallContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    guestCallText: {
        color: 'black',
        fontSize: 18,
        textDecorationLine: 'underline',
    },
});

export default OpenCallPage;
