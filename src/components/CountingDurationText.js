import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'native-base';
import { Colors } from '../constants';
import { Lib } from '../utilities';

export default class CountingDurationText extends React.Component {

    interval = 0;
    isComponentMounted = false;

    state = {
        elapsed: '00:00'
    };

    componentWillMount() {
        this.isComponentMounted = true;
        interval = setInterval(() => {
            if (this.isComponentMounted) {
                const elapsed = Lib.getElapsedTime(this.props.startTime);
                this.setState({ elapsed });
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.isComponentMounted = false;
    }

    render() {
        return (
            <Text style={styles.inProgressText}>
                {this.state.elapsed}
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
