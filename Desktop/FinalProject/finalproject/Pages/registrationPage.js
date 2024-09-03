import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import Checkbox from 'expo-checkbox';
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import axios from "axios";
import { Button, RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../component/CustomAlert';

const BASE_URL = 'http://192.168.1.72:8003';

const RegistrationPage = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emailVer, setEmailVer] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVer, setPasswordVer] = useState('');
  const [skills, setSkills] = useState([]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [gunLicense, setGunLicense] = useState(false);
  const [gunLicenseFile, setGunLicenseFile] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [authorizationFile, setAuthorizationFile] = useState(null);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);
  const [valueSkills, setValueSkills] = useState([]);
  const [registerStatus, setRegisterStatus] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [gender, setGender] = useState(null);
  const [items, setItems] = useState([
    { label: 'רופא', value: 'רופא' },
    { label: 'עזרה ראשונה', value: 'עזרה ראשונה' },
    { label: 'וטרינר', value: 'וטרינר' },
    { label: 'חשמלאי', value: 'חשמלאי' },
    { label: 'פורץ', value: 'פורץ' },
    { label: 'איש/ת ביטחון', value: 'איש/ת ביטחון' },
    { label: 'התמקצעות רכב', value: 'התמקצעות רכב' },
  ]);

  const validateFields = () => {
    const nameRegex = /^[A-Za-zא-ת]+$/;

    if (!firstName.match(nameRegex)) {
      Alert.alert('שגיאה', 'שם פרטי יכול להכיל רק אותיות.');
      return false;
    }
    if (!lastName.match(nameRegex)) {
      Alert.alert('שגיאה', 'שם משפחה יכול להכיל רק אותיות.');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('שגיאה', 'כתובת אימייל לא חוקית.');
      return false;
    }
    if (email !== emailVer) {
      Alert.alert('שגיאה', 'האימייל ואימות האימייל אינם תואמים.');
      return false;
    }
    if (password !== passwordVer) {
      Alert.alert('שגיאה', 'הסיסמה ואימות הסיסמה אינם תואמים.');
      return false;
    }
    if (!agreementChecked) {
      Alert.alert('שגיאה', 'יש לאשר את תנאי השימוש.');
      return false;
    }
    if (!gender) {
      Alert.alert('שגיאה', 'יש לבחור מין.');
      return false;
    }
    return true;
  };

  const handleRegistration = async () => {
    if (!validateFields()) {
      console.log("Validation failed");
      return;
    }

    const userData = {
      firstName,
      lastName,
      phone,
      email,
      password,
      address,
      skills: skills.join(', '),
      gunLicense,
      gunLicenseFile1: gunLicenseFile ? gunLicenseFile.uri : null,
      gunLicenseFile2: authorizationFile ? authorizationFile.uri : null,
      city,
      gender,
    };

    console.log('Registration data:', userData);

    try {
      const response = await axios.post(BASE_URL + '/users', {
        first_name: firstName,
        last_name: lastName,
        email,
        password_: password,
        phone_number: phone,
        skills: skills.join(', '),
        city,
        address,
        gun_license: gunLicense,
        gun_license_file1: gunLicenseFile ? gunLicenseFile.uri : null,
        gun_license_file2: authorizationFile ? authorizationFile.uri : null,
        gender,
      });
      console.log("Response from server:", response.data);
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
      setRegisterStatus("ACCOUNT CREATED SUCCESSFULLY");
      setShowAlert(true);
    } catch (error) {
      if (error.response) {
        console.error("Error registering user:", error.response.data);
      } else if (error.request) {
        console.error("Error registering user: No response received");
      } else {
        console.error("Error registering user:", error.message);
      }
      setRegisterStatus("Error registering user");
    }
  };

  const handleFileUpload = async (setFile) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({});
      if (res.type === 'success') {
        setFile(res);
      }
    } catch (err) {
      console.log('Error:', err);
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="person-add" size={24} style={styles.icon} />
            <Text style={styles.heading}>הרשמה למערכת</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="שם פרטי"
                onChangeText={setFirstName}
                value={firstName}
            />
            <TextInput
                style={styles.input}
                placeholder="שם משפחה"
                onChangeText={setLastName}
                value={lastName}
            />
            <TextInput
                style={styles.input}
                placeholder="אימייל"
                onChangeText={setEmail}
                value={email}
            />
            <TextInput
                style={styles.input}
                placeholder="אימות אימייל"
                onChangeText={setEmailVer}
                value={emailVer}
            />
            <TextInput
                style={styles.input}
                placeholder="סיסמה"
                secureTextEntry={true}
                onChangeText={setPassword}
                value={password}
            />
            <TextInput
                style={styles.input}
                placeholder="אימות סיסמה"
                secureTextEntry={true}
                onChangeText={setPasswordVer}
                value={passwordVer}
            />
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="מספר פלאפון"
                maxLength={10}
                onChangeText={setPhone}
                value={phone}
            />
            <DropDownPicker
                style={styles.DropDownContainer}
                dropDownStyle={styles.dropDown}
                open={openSkills}
                value={skills}
                items={items}
                setOpen={(isOpen) => {
                  setOpenSkills(isOpen);
                  setIsDropDownOpen(isOpen);
                }}
                setValue={setSkills}
                placeholder="כישורים"
                setItems={setItems}
                theme="LIGHT"
                multiple={true}
                listMode="MODAL"
                onClose={() => setIsDropDownOpen(false)}
                containerStyle={styles.dropDownPickerContainer}
                style={[styles.dropDownPickerStyle, { zIndex: 4000 }]}
                itemStyle={styles.dropDownPickerItemStyle}
                labelStyle={styles.dropDownPickerLabelStyle}
                selectedLabelStyle={styles.dropDownPickerSelectedLabelStyle}
                placeholderStyle={styles.dropDownPickerPlaceholderStyle}
                activeItemStyle={styles.dropDownPickerActiveItemStyle}
                arrowStyle={styles.dropDownPickerArrowStyle}
            />

            <View style={styles.genderContainer}>
              <View style={styles.radioOption}>
                <RadioButton
                    value="male"
                    status={gender === 'male' ? 'checked' : 'unchecked'}
                    onPress={() => setGender('male')}
                    color='#1B998B'
                />
                <Text style={styles.radioText}>זכר</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton
                    value="female"
                    status={gender === 'female' ? 'checked' : 'unchecked'}
                    onPress={() => setGender('female')}
                    color='#1B998B'
                />
                <Text style={styles.radioText}>נקבה</Text>
              </View>
              <Text style={styles.genderLabel}>מין:</Text>
            </View>
            <TextInput
                style={styles.input}
                placeholder="עיר"
                onChangeText={setCity}
                value={city}
            />
            <TextInput
                style={styles.input}
                placeholder="כתובת"
                onChangeText={setAddress}
                value={address}
            />
            <View style={[styles.inputContainer, styles.dropdownItemsContainer]}>
              <View style={styles.checkboxContainer}>
                <Text style={styles.agreementText}>האם יש רישיון נשק?</Text>
                <Checkbox
                    value={gunLicense}
                    onValueChange={setGunLicense}
                />
              </View>
              {gunLicense && (
                  <View>
                    <Text style={styles.upFiles}>העלאת קבצים:</Text>
                    <TouchableOpacity onPress={() => handleFileUpload(setGunLicenseFile)}>
                      <Text style={styles.fileOption}>קובץ 1 - רישיון נשק</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleFileUpload(setAuthorizationFile)}>
                      <Text style={styles.fileOption}>קובץ 2 - תעודת הרשאה</Text>
                    </TouchableOpacity>
                  </View>
              )}
            </View>
            <View style={styles.checkboxContainer}>
              <Text style={styles.agreementText}>
                אני מאשר/ת כי כל הפרטים שהוזנו מלאים ונכונים.
              </Text>
              <Checkbox
                  value={agreementChecked}
                  onValueChange={setAgreementChecked}
              />
            </View>
          </View>
          <Button
              mode="contained"
              onPress={handleRegistration}
              style={styles.button}
              labelStyle={styles.buttonText}
              icon={() => <MaterialIcons name="check" size={24} color="white" />}
          >
            הרשמה
          </Button>
          {showAlert && (
              <CustomAlert
                  message="הרישום בוצע בהצלחה!"
                  onConfirm={() => {
                    setShowAlert(false);
                    navigation.navigate('HomePage');
                  }}
              />
          )}
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f4f4f4',
    padding: 15,
    textAlign: 'right',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: '2%',
    paddingTop: '2%',
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
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    textAlign: 'right',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#1B998B',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
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
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
    textAlign: 'right',
  },
  upFiles: {
    textAlign: 'right',
    fontWeight: 'bold',
    padding: 10,
  },
  fileOption: {
    padding: 10,
    marginVertical: 5,
    textAlign: 'right',
    backgroundColor: '#f0f0f0',
  },
  agreementText: {
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  DropDownContainer: {
    marginBottom: 30,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlign: 'right',
    backgroundColor: 'white',
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  genderLabel: {
    marginLeft: 10,

  },
  radioOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioText: {
    marginLeft: 5,
  },
});

export default RegistrationPage;
