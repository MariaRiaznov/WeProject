import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../component/CustomAlert'; // assuming you have a CustomAlert component

const BASE_URL = 'http://192.168.1.72:8003';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            console.log("Sending login request to:", `${BASE_URL}/login`);
            const response = await axios.post(`${BASE_URL}/login`, { email, password });

            if (response.data.userId) {
                const userId = response.data.userId.toString(); // המרה למחרוזת
                await AsyncStorage.setItem('userId', userId);
                setShowAlert(true);
            } else {
                alert('שם משתמש או סיסמה לא נכונים');
            }

            console.log("Response from server:", response.data);

        } catch (error) {
            if (error.response) {
                console.error("Error logging in:", error.response.data);
                Alert.alert('שגיאה', error.response.data.message);
            } else if (error.request) {
                console.error("Error logging in: No response received", error.request);
                Alert.alert('שגיאה', 'לא התקבלה תגובה מהשרת');
            } else {
                console.error("Error logging in:", error.message);
                Alert.alert('שגיאה', error.message);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <MaterialIcons name="lock" size={24} style={styles.icon} />
                <Text style={styles.pageTitle}>התחברות</Text>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>אמייל:</Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { textAlign: 'right' }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="הזן את כתובת האימייל שלך"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>סיסמה:</Text>
            </View>
            <View style={styles.passwordContainer}>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={24}
                        color="black"
                        style={styles.passwordToggleIcon}
                    />
                </TouchableOpacity>
                <TextInput
                    style={[styles.input, { flex: 1, textAlign: 'right' }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="הזן את הסיסמה שלך"
                    secureTextEntry={!showPassword}
                />
            </View>

            <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                labelStyle={styles.buttonText}
                icon={() => <MaterialIcons name="login" size={24} color="white" />}
            >
                התחבר
            </Button>
            {showAlert && (
                <CustomAlert
                    message="התחברת בהצלחה!"
                    onConfirm={() => {
                        setShowAlert(false);
                        navigation.replace('HomePage');
                    }}
                />
            )}
            <TouchableOpacity onPress={() => navigation.navigate('Registration')} style={styles.registrationContainer}>
                <Text style={styles.registrationText}>משתמש לא רשום? הירשם כאן</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f4f4f4',
        padding: 15,
        textAlign: 'right',
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
    pageTitle: {
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginVertical: 8,
        marginHorizontal: 16,
    },
    label: {
        fontSize: 16,
        marginRight: 8,
    },
    input: {
        height: 50,
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 8,
        backgroundColor: 'white',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 8,
        backgroundColor: 'white',
        marginVertical: 8,
        marginHorizontal: 16,
    },
    button: {
        backgroundColor: '#1B998B',
        padding: 10,
        alignItems: 'center',
        borderRadius: 4,
        marginHorizontal: 16,
        marginTop: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    passwordToggleIcon: {
        padding: 10,
    },
    registrationContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    registrationText: {
        color: '#1B998B',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});

export default Login;
