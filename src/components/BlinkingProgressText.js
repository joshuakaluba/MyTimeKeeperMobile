import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'native-base';
import { Colors } from '../constants';

export default class BlinkingProgressText extends React.Component {

    interval = 0;
    isComponentMounted = false;

    state = {
        showText: false
    };

    componentWillMount() {
        this.isComponentMounted = true;

        interval = setInterval(() => {
            if (this.isComponentMounted) {
                this.setState(previousState => {
                    return { showText: !previousState.showText };
                });
            }
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.isComponentMounted = false;
    }

    render() {
        let text = this.state.showText ? this.props.text : ' ';
        return (
            <Text style={styles.inProgressText}>
                {text}
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
