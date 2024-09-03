import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const CustomAlert = ({ message, onConfirm }) => {
    return (
        <View style={styles.alertContainer}>
            <Text style={styles.alertText}>{message}</Text>
            <Button
                title="אישור"
                onPress={onConfirm}
                color="#1B998B"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    alertContainer: {
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
    alertText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
});

export default CustomAlert;
