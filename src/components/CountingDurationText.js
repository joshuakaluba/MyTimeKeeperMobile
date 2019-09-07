import React from 'react';
import { StyleSheet, View } from 'react-native';
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
            try {
                if (this.isComponentMounted) {
                    const elapsed = Lib.getElapsedTime(this.props.startTime);
                    this.setState({ elapsed });
                }
            } catch (error) {
                console.log(error);
            }
        }, 1000);
    }

    componentWillUnmount() {
        try {
            this.isComponentMounted = false;
            clearInterval(this.interval);
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        return (
            <View>
                {
                    this.props.large ?
                        <Text style={styles.inProgressTextLarge}>
                            {this.state.elapsed}
                        </Text>
                        :
                        <Text style={styles.inProgressTextSmall}>
                            {this.state.elapsed}
                        </Text>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    inProgressTextSmall: {
        color: Colors.danger,
        fontWeight: 'bold',
        paddingTop: 5,
        fontSize: 13
    },
    inProgressTextLarge: {
        color: Colors.black,
        fontWeight: 'bold',
        paddingTop: 5,
        fontSize: 20
    }
});
