import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default class PrimaryButton extends React.Component {

    static propTypes = {
        onPress: PropTypes.func.isRequired,
        text: PropTypes.string.isRequired,
        disabled: PropTypes.bool
    };

    static defaultProps = {
        disabled: false
    }

    render() {
        return (
            <Button
                mode={'contained'}
                dark
                disabled={this.props.disabled}
                onPress={this.props.onPress} style={styles.buttonStyle}>
                {this.props.text}
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonStyle: {
        width: 300,
        height: 40
    }
});