import React ,{useEffect, useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, Appbar, Image, } from 'react-native-paper';
import RegistrationPage from './Pages/registrationPage';
import OpenCallPage from './Pages/openCall';
import HomePage from './Pages/homePage';
import GuestCall from './Pages/GuestCall';
import CallDetails from './Pages/CallDetails';
import ReactToCall from './Pages/reactToCall';
import RatingByVolunteer from './Pages/ratingByVolunteer';
import RatingByCaller from './Pages/ratingByCaller';
import login from './Pages/login';
import FullScreenImage from './Pages/FullScreenImage';
import Profile from './Pages/Profile';
import UserProfile from './Pages/UserProfile';
import openCallsList from './Pages/openCallsList';
import closeCall from './Pages/closeCall';
import completedCallsList from "./Pages/completedCallsList";
import callsIOpened  from "./Pages/callsIOpened";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CallsIOpenedList from "./Pages/callsIOpened";

const Stack = createStackNavigator();

const logout = async (navigation) => {
    await AsyncStorage.removeItem('userId');
    navigation.replace('HomePage');
};
const confirmLogout = (navigation) => {
    Alert.alert(
        "התנתקות",
        "האם אתה בטוח שברצונך להתנתק?",
        [
            {
                text: "לא",
                style: "cancel"
            },
            {
                text: "כן",
                onPress: () => logout(navigation)
            }
        ],
        { cancelable: false }
    );
};

const App = () => {
    return (
   <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="HomePage"
            component={HomePage}
            options={({ navigation }) => ({
                header: () => (
                    <Appbar.Header style={{ backgroundColor: '#CED4DA', textAlign: "center" }}>
                        <Appbar.Action
                            icon="logout"
                            onPress={() => confirmLogout(navigation)}
                            style={{ marginLeft: 'auto' }}
                        />
                        <Appbar.Content title="דף הבית" titleStyle={{ textAlign: 'center', flexGrow: 1, marginTop: '5%'}} />
                        <Appbar.Action
                            icon="account-circle"
                            onPress={() => navigation.navigate('Profile')}
                        />
                    </Appbar.Header>
                ),
            })}
          />
            <Stack.Screen
                name="login"
                component={login}
                options={{
                    headerTitle: 'התחברות',
                    headerStyle: { backgroundColor: '#CED4DA' },
                    headerTitleAlign: 'center',
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="OpenCall"
                component={OpenCallPage}
                options={{
                    headerTitle: 'פתיחת קריאה',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="GuestCall"
                component={GuestCall}
                options={{
                    headerTitle: 'פתיחת קריאה - אורח',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="Registration"
                component={RegistrationPage}
                options={{
                    headerTitle: 'הרשמה למערכת',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="CallDetails"
                component={CallDetails}
                options={{
                    headerTitle: 'פרטי הקריאה',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="ReactToCall"
                component={ReactToCall}
                options={{
                    headerTitle: 'פרטי הקריאה',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="ratingByVolunteer"
                component={RatingByVolunteer}
                options={{
                    headerTitle: ' חוות דעת',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="ratingByCaller"
                component={RatingByCaller}
                options={{
                    headerTitle: ' חוות דעת',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen name="FullScreenImage" component={FullScreenImage} />
            <Stack.Screen
                name="Profile"
                component={Profile}
                options={{
                    headerTitle: 'פרופיל',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="UserProfile"
                component={UserProfile}
                options={{
                    headerTitle: ' פרופיל משתמש',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="openCallsList"
                component={openCallsList}
                options={{
                    headerTitle: ' קריאות פתוחות',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="closeCall"
                component={closeCall}
                options={{
                    headerTitle: 'סגירת קריאה',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="completedCallsList"
                component={completedCallsList}
                options={{
                    headerTitle: 'קריאות שנענתי',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
            <Stack.Screen
                name="callsIOpened"
                component={callsIOpened}
                options={{
                    headerTitle: 'קריאות שפתחתי',
                    headerStyle: { backgroundColor: '#CED4DA' }, // או כל סגנון אחר ל-AppBar
                    headerTitleAlign: 'center', // מרכז את הכותרת
                    headerTintColor: '#fff', // צבע הטקסט בכפתורי האינטראקציה
                }}
            />
        </Stack.Navigator>
      </NavigationContainer>
   </PaperProvider>
 );
};


export default App;
