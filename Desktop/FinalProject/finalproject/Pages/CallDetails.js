import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const BASE_URL = 'http://192.168.1.72:8003';

const CallDetails = ({ route, navigation }) => {
  const { call_id, current_location, first_name, last_name, phone_number, guest_user_id, guest_full_name, guest_phone, urgency, category, description, created_at, status, user_id } = route.params.request;
  const [callStatus, setCallStatus] = useState(status);
  const [request, setRequest] = useState(route.params.request);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [img, setImg] = useState(null);

  useEffect(() => {
    const fetchUpdatedCall = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/call/${call_id}`);
        if (response.status === 200) {
          console.log("Received image path:", response.data.img);
          setRequest(response.data);
          setCallStatus(response.data.status);
          setImg(response.data.img); // Update the image path from response data
        }
      } catch (error) {
        console.error('Error fetching updated call details:', error);
      }
    };
    fetchUpdatedCall();
  }, [call_id]);

  useEffect(() => {
    if (route.params.request.status !== request.status) {
      setRequest(route.params.request);
      setCallStatus(route.params.request.status);
    }
  }, [route.params.request]);

  const handleCall = () => {
    Linking.openURL(`tel:${phone_number}`);
  };

  const handleSMS = () => {
    Linking.openURL(`sms:${phone_number}`);
  };

  const confirmResponse = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      const response = await axios.post(`${BASE_URL}/update-call-status`, {
        call_id: call_id,
        status: 'בטיפול',
        user_id: userId
      });
      if (response.status === 200) {
        setCallStatus('בטיפול');
        setShowConfirmation(false);

        // Update the profile to fetch the latest responded calls count
        const profileResponse = await axios.get(`${BASE_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${userId}`
          }
        });
      }
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  };

  const cancelResponse = () => {
    setShowConfirmation(false);
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
    const imageUrl = img.startsWith('http') ? img : `${BASE_URL}/${img}`;
    navigation.navigate('FullScreenImage', { img: imageUrl });
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
            {typeof img === 'string' && (
                <TouchableOpacity onPress={openFullScreenImage}>
                  <Image source={{ uri: img }} style={styles.image} />
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
              onPress={() => setShowConfirmation(true)}
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
        {showConfirmation && (
            <View style={styles.confirmationDialog}>
              <Text style={styles.confirmationText}>האם אתה מתחייב להגיע לקריאה זו? </Text>
              <View style={styles.dialogButtons}>
                <Button
                    mode="contained"
                    onPress={confirmResponse}
                    style={styles.dialogButton}
                    labelStyle={styles.dialogButtonLabel}
                >
                  אישור
                </Button>
                <Button
                    mode="outlined"
                    onPress={cancelResponse}
                    style={[styles.dialogButton, styles.cancelButton]}
                    labelStyle={styles.dialogButtonLabel}
                >
                  ביטול
                </Button>
              </View>
            </View>
        )}
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
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#D7263D',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  dialogButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CallDetails;
