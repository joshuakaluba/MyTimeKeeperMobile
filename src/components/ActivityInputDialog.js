import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import PrimaryButton from './PrimaryButton';
import PrimaryFormInput from './PrimaryFormInput';
import { Dialog, Portal } from 'react-native-paper';
import {StringDictionary} from '../constants';

export default class ActivityInputDialog extends React.Component {

    static propTypes = {
        activity: PropTypes.object.isRequired,
        saveActivityActionPress: PropTypes.func.isRequired,
        onDismiss: PropTypes.func.isRequired,
        onChangeNameText: PropTypes.func.isRequired,
        onChangeDescriptionText: PropTypes.func.isRequired,
        visible: PropTypes.bool.isRequired,
        title: PropTypes.string.isRequired,
        primaryButtonText: PropTypes.string.isRequired,
    };

    _onDismiss = () => this.props.onDismiss();

    _onPrimaryButtonPress = () => this.props.saveActivityActionPress();

    _validNewActivityName = () => this.props.activity.name.length < 1;

    render() {
        return (
            <Portal>
                <Dialog
                    visible={this.props.visible}
                    style={styles.dialogBody}
                    onDismiss={this._onDismiss}>
                    <Dialog.Title >
                        {this.props.title}
                    </Dialog.Title>
                    <Dialog.Content>
                        <PrimaryFormInput
                            label={StringDictionary.activityName}
                            value={this.props.activity.name}
                            onChangeText={this.props.onChangeNameText} />
                        <PrimaryFormInput
                            label={StringDictionary.activityDescription}
                            value={this.props.activity.description}
                            onChangeText={this.props.onChangeDescriptionText} />
                    </Dialog.Content>
                    <Dialog.Actions style={styles.dialogActions}>
                        <PrimaryButton
                            text={this.props.primaryButtonText}
                            onPress={this._onPrimaryButtonPress}
                            disabled={this._validNewActivityName()} />
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        );
    }
}

const styles = StyleSheet.create({
    dialogBody: {
        paddingBottom: 15
    },
    dialogActions: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});
