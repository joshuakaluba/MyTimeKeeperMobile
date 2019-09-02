import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import PrimaryButton from './PrimaryButton';
import { Dialog, Portal } from 'react-native-paper';
import { StringDictionary } from '../constants';
import CountingDurationText from './CountingDurationText';

export default class ActivityStatusDialog extends React.Component {

    static propTypes = {
        activity: PropTypes.object.isRequired,
        toggleActivityStarted: PropTypes.func.isRequired,
        onDismiss: PropTypes.func.isRequired,
        visible: PropTypes.bool.isRequired,
    };

    _onDismiss = () => this.props.onDismiss();

    _onPrimaryButtonPress = () => this.props.toggleActivityStarted(this.props.activity);

    render() {
        return (
            <Portal>
                <Dialog
                    visible={this.props.visible}
                    style={styles.dialogBody}
                    onDismiss={this._onDismiss}>
                    <Dialog.Title>
                        {this.props.activity.name}
                    </Dialog.Title>
                    <Dialog.Content>
                        <View style={styles.dialogContent}>
                            {
                                this.props.activity.started === 1 ?
                                    <CountingDurationText startTime={this.props.activity.latest_start_time} />
                                    :
                                    <Text>{''}</Text>
                            }
                            <Text>{this.props.activity.description}</Text>
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions style={styles.dialogActions}>
                        <PrimaryButton
                            text={this.props.activity.started === 0 ? StringDictionary.startActivity : StringDictionary.stopActivity}
                            onPress={this._onPrimaryButtonPress}
                            disabled={false} />
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
    },
    dialogContent: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});
