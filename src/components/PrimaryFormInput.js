import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'react-native-paper';

export default class PrimaryFormInput extends React.Component {

    static propTypes = {
        onChangeText: PropTypes.func.isRequired,
        label: PropTypes.string.isRequired
    };

    render() {
        return (
            <TextInput
                mode={'outlined'}
                label={this.props.label}
                onChangeText={this.props.onChangeText}
                value={this.props.value}
            />
        );
    }
}
