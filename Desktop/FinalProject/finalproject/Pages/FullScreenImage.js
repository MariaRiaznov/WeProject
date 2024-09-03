import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const FullScreenImage = ({ route, navigation }) => {
    const { img } = route.params;

    console.log("Full screen image URI:", img);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Image source={{ uri: img }} style={styles.imageFullScreen} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 30,
        right: 20,
        zIndex: 1,
    },
    imageFullScreen: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default FullScreenImage;
