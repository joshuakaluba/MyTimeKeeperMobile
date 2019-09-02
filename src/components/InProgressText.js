import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'native-base';
import { Colors } from '../constants';

export default class InProgressText extends React.Component {
    render() {
        return (
            <Text style={styles.inProgressText}>
                {this.props.text}
            </Text>
        );
    }
}

const styles = StyleSheet.create({
    inProgressText: {
        color: Colors.primary,
        fontWeight: 'bold',
        paddingTop: 5,
        fontSize: 13
    }
});
