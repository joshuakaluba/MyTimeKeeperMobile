import { StyleSheet } from 'react-native';
import Colors from './Colors';

export default DefaultStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.bodyBackgroundColor,
        padding: 10
    },
    mainView: {
        backgroundColor: Colors.mainViewBackgroudColor,
        alignItems: 'center',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
    },
    textLink: {
        paddingVertical: 15,
        alignItems: "center",
    },
    textLinkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
    modalHeaderText: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.defaultTextColor
    },
    scrollViewHeaderText: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.defaultTextColor
    }
});