import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MultipleSelectList } from "react-native-dropdown-select-list";
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const BASE_URL = 'http://192.168.1.72:8003';

function HomePage({ navigation, route }) {
  const [openFilter, setOpenFilter] = useState(false);
  const [valueFilter, setValueFilter] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [originalUserRequests, setOriginalUserRequests] = useState([]);
  const [selected, setSelected] = useState([]);

  const dataFilter = [
    { key: '1', value: 'כל הקטגוריות' },
    { key: '2', value: 'קטגוריה', disabled: true },
    { key: '3', value: 'חיות' },
    { key: '4', value: 'רפואה' },
    { key: '5', value: 'צד הכביש' },
    { key: '6', value: 'אירוע רב נפגעים' },
    { key: '7', value: 'חקלאות' },
    { key: '8', value: 'אסון טבע' },
    { key: '9', value: 'מיקום', disabled: true },
    { key: '10', value: 'עד 2 ק"מ' },
    { key: '11', value: 'עד 5 ק"מ' },
    { key: '12', value: 'עד 10 ק"מ' },
    { key: '13', value: 'עד 30 ק"מ' },
    { key: '14', value: 'כל המיקומים' },
    { key: '15', value: 'רמת דחיפות', disabled: true },
    { key: '16', value: 'גבוהה' },
    { key: '17', value: 'בינונית' },
    { key: '18', value: 'נמוכה' },
    { key: '19', value: 'חדשה/ישנה', disabled: true },
    { key: '20', value: 'מהחדשה לישנה' },
    { key: '21', value: 'מהישנה לחדשה' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/calls`);
        setUserRequests(response.data);
        setOriginalUserRequests(response.data); // Save the original data
      } catch (error) {
        console.error('Error fetching calls:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (route.params?.newRequest) {
      setUserRequests(prevRequests => [...prevRequests, route.params.newRequest]);
      setOriginalUserRequests(prevRequests => [...prevRequests, route.params.newRequest]);
    }
  }, [route.params?.newRequest]);

  const openNewCall = () => {
    navigation.navigate('OpenCall');
  };

  const filterRequests = (selectedCriteria) => {
    if (selectedCriteria.length === 0) {
      return originalUserRequests; // Return the original data when no filter is selected
    }

    let filteredRequests = originalUserRequests.filter(request => {
      if (selectedCriteria.includes(request.category)) {
        return true;
      }
      if (selectedCriteria.includes(request.urgency)) {
        return true;
      }
      return false;
    });

    if (selectedCriteria.includes("מהחדשה לישנה")) {
      filteredRequests = filteredRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filteredRequests;
  };

  useEffect(() => {
    const filteredRequests = filterRequests(selected);
    setUserRequests(filteredRequests);
  }, [selected]);

  const handleCategorySelection = (selectedItems) => {
    setSelected(selectedItems);
  };

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button
              style={[styles.button, { backgroundColor: '#D7263D' }]}
              icon="alert-circle"
              mode="contained"
              onPress={openNewCall}
          >
            קריאה חדשה
          </Button>
          <Button
              style={[styles.button, { backgroundColor: '#1B998B' }]}
              icon="account-plus"
              mode="contained"
              onPress={() => navigation.navigate('Registration')}
          >
            הרשמה
          </Button>
          <Button
              style={[styles.button, { backgroundColor: '#1B998B' }]}
              icon="login"
              mode="contained"
              onPress={() => navigation.navigate('login')}
          >
            התחברות
          </Button>
        </View>
        <View style={styles.selectList}>
          <MultipleSelectList
              setSelected={handleCategorySelection}
              selected={selected}
              data={dataFilter}
              save="value"
              onSelect={() => console.log(selected)}
              label="קטגוריות שנבחרו"
              boxStyles={{ backgroundColor: 'white', alignItems: 'right' }}
              dropdownStyles={{ backgroundColor: 'white' }}
              placeholder="סנן לפי..."
              containerStyles={{
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
                alignItems: 'center',
                direction: 'rtl',
              }}
              itemTextStyle={{ textAlign: 'right' }}
              dropDownDirection="top"
              dropDownPosition="right"
          />
        </View>
        <ScrollView nestedScrollEnabled={true} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.separator} />
          {userRequests.filter(request => request.status !== 'טופל').map((request, index) => (
              <View key={index} style={styles.requestContainer}>
                <View style={styles.headerContainer}>
                  <Text style={styles.categoryText}>{request.category}</Text>
                  {request.guest_user_id && (
                      <View style={styles.guestUserContainer}>
                        <MaterialIcons name="person" size={20} color="black" />
                        <Text style={styles.guestUserText}>משתמש אורח</Text>
                      </View>
                  )}
                </View>
                {request.guest_user_id ? (
                    <>
                      <Text style={styles.requestText}>שם: {request.guest_full_name}</Text>
                      <Text style={styles.requestText}>מספר פלאפון: {request.guest_phone}</Text>
                    </>
                ) : (
                    <>
                      <Text style={styles.requestText}>שם: {request.first_name + ' ' + request.last_name}</Text>
                      <Text style={styles.requestText}>מספר פלאפון: {request.phone_number}</Text>
                    </>
                )}
                <Text style={styles.requestText}>כתובת: {request.current_location}</Text>
                <Text style={styles.requestText}>רמת דחיפות: {request.urgency}</Text>
                <Text style={styles.descriptionText}>תיאור הקריאה: {request.description}</Text>
                <Text style={styles.descriptionText}>{new Date(request.created_at).toLocaleString()}</Text>
                <Button
                    style={styles.callButton}
                    icon="more"
                    mode="contained"
                    onPress={() => navigation.navigate('CallDetails', { request })}
                >
                  פרטים
                </Button>
              </View>
          ))}
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: '2%',
    paddingTop: '2%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '1%',
  },
  button: {
    flex: 1,
    elevation: 5,
    marginHorizontal: '1%',
    borderRadius: 5,
  },
  separator: {
    width: '100%',
    backgroundColor: 'gray',
    height: 1,
    marginVertical: '2%',
  },
  requestContainer: {
    paddingVertical: '2%',
    borderWidth: 1.5,
    borderRadius: 5,
    marginBottom: '2%',
    backgroundColor: 'white',
    elevation: 5,
    paddingHorizontal: '2%',
    textAlign: 'right',
    direction: 'rtl',
  },
  headerContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '97%',
    marginBottom: '2%',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  guestUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestUserText: {
    fontSize: 16,
    marginLeft: 5,
    color: 'black',
  },
  requestText: {
    textAlign: 'right',
    marginBottom: '2%',
  },
  descriptionText: {
    textAlign: 'right',
    marginBottom: '2%',
  },
  callButton: {
    alignSelf: 'flex-start',
    marginTop: '2%',
    backgroundColor: '#CED4DA',
    elevation: 5,
    borderRadius: 5,
  },
  selectList: {
    paddingHorizontal: 5,
    paddingTop: 20,
    width: '100%',
    textAlign: 'right',
    direction: 'rtl',
  },
});

export default HomePage;
