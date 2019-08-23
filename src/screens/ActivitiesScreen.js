import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, DeviceEventEmitter } from 'react-native';
import moment from 'moment';
import { Text } from 'native-base';
import * as Icon from '@expo/vector-icons';
import { Col, Grid } from "react-native-easy-grid";
import { Colors, StringDictionary, ApplicationDefaultSettings, DeviceEvents } from '../constants';
import { ActivityList, ActivityInputDialog, ActivityStatusDialog } from '../components';
import { ActivityRepository, ActivityLogRepository } from '../data';


export default class ActivitiesScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: StringDictionary.myActivities,
            headerStyle: ApplicationDefaultSettings.headerStyle,
            headerTintColor: ApplicationDefaultSettings.headerTintColor,
            headerTitleStyle: ApplicationDefaultSettings.headerTitleStyle,
            headerRight: (
                <Grid style={{ marginBottom: -3, marginRight: 10 }}>
                    <Col>
                        <Icon.Ionicons
                            onPress={() => { params.showNewActivityDialog() }}
                            name={'md-add'}
                            size={35}
                            color={Colors.headerTintColor}
                        />
                    </Col>
                </Grid>
            )
        };
    };

    state = {
        loading: true,
        showNewActivityDialog: false,
        showEditActivityDialog: false,
        showActivityStatusDialog: false,
        newActivity: {
            name: '',
            description: ''
        },
        selectedActivity: {
            name: '',
            description: '',
            latest_start_time: ''
        },
        activities: []
    };

    activityRepository = new ActivityRepository();
    activityLogRepository = new ActivityLogRepository();

    async componentWillMount() {
        this.props.navigation.setParams({
            showNewActivityDialog: this._showAddNewActivityDialog.bind(this),
        });

        this._getActivities();
    }

    _endLoading = () => this.setState({ loading: false });

    _hideNewActivityDialog = () => this.setState({
        showNewActivityDialog: false,
        newActivity: {
            name: '',
            description: ''
        }
    });

    _hideEditActivityDialog = () => this.setState({ showEditActivityDialog: false });

    _hideActivityStatusDialog = () => this.setState({ showActivityStatusDialog: false });

    _showAddNewActivityDialog = () => this.setState({ showNewActivityDialog: true });

    _getActivities = () => {
        this.setState({ activities: [], loading: true });
        this.activityRepository.getActivities(this._updateActivities.bind(this));
        this._endLoading();
    }

    _updateActivities = (activities) => {
        if (activities.length > 0) {
            this.setState({ activities })
        }
    }

    _activityRefreshCallback = () => {
        const getActivities = this._getActivities.bind(this);

        // TODO for some reason you need to wait before the 
        // newly inserted activities can persist in storage

        setTimeout(function () {
            getActivities();
        }, 500);
    }

    _addNewActivity = () => {
        this._hideNewActivityDialog();
        const activity = this.state.newActivity;
        this.activityRepository.createActivity(activity, this._activityRefreshCallback.bind(this));
    }

    _editSelectedActivity = () => {
        this._hideEditActivityDialog();
        const activity = this.state.selectedActivity;
        this.activityRepository.editActivity(activity, this._activityRefreshCallback.bind(this));
    }

    _selectActivity = (activity) => this.setState({ selectedActivity: activity });

    _selectActivityItem = (activity) => {
        this._selectActivity(activity);
        this.setState({ showActivityStatusDialog: true });
    }

    _editActivity = (activity) => {
        this.setState({ showEditActivityDialog: true });
        this._selectActivity(activity);
    };

    _deleteActivity = (activity) => {
        this._selectActivity(activity);
        const deleteConfirmed = this._deleteConfirmed.bind(this);
        Alert.alert(
            StringDictionary.delete,
            `${StringDictionary.deleteConfirmation}${activity.name}`,
            [
                { text: StringDictionary.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: StringDictionary.ok, onPress: deleteConfirmed },
            ],
            { cancelable: true }
        );
    };

    _deleteConfirmed = () => {
        const activity = this.state.selectedActivity;
        this.activityRepository.deleteActivity(activity, this._activityRefreshCallback.bind(this));
    }

    _toggleActivityStarted = () => {
        this._hideActivityStatusDialog();
        const activity = this.state.selectedActivity;

        if (activity.started === 0) {
            activity.started = 1;
            activity.latest_start_time = moment().toISOString();

            this.activityRepository.editActivity(activity, this._activityRefreshCallback.bind(this));

            const activityLog = {
                activity_id: activity.id
            };

            this.activityLogRepository.createActivityLog(activityLog, this._activityRefreshCallback.bind(this));
        } else {
            // ending activity
            activity.started = 0;
            this.activityRepository.editActivity(activity, this._activityRefreshCallback.bind(this));
            this._completeActivityLog(activity);

            // Find incomplete log

            // Complete log

        }

        DeviceEventEmitter.emit(DeviceEvents.updateLogActivities);
    };

    _completeActivityLog = (activity) => {
        this.activityLogRepository.completeActivityLog(activity, this._activityRefreshCallback.bind(this));

        this.activityLogRepository.getActivityLogs(this._activityRefreshCallback);
        //update t1 set value1 = (select value2 from t2 where t2.id = t1.id) where t1.value1 = 0;
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={[styles.box, styles.body]}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.loading}
                                onRefresh={this._getActivities.bind(this)} />
                        }>
                        <ActivityList
                            activities={this.state.activities}
                            onSelect={this._selectActivityItem.bind(this)}
                            onEdit={this._editActivity.bind(this)}
                            onDelete={this._deleteActivity.bind(this)}
                            onToggleActivityStarted={this._toggleActivityStarted.bind(this)} />
                    </ScrollView>
                </View>
                <View style={[styles.box, styles.footer, { alignItems: 'center' }]}>
                    <Text>Hello Ad Space</Text>
                </View>

                <ActivityInputDialog
                    activity={this.state.newActivity}
                    onChangeNameText={(value) => this.setState({ newActivity: { ...this.state.newActivity, name: value } })}
                    onChangeDescriptionText={(value) => this.setState({ newActivity: { ...this.state.newActivity, description: value } })}
                    saveActivityActionPress={this._addNewActivity.bind(this)}
                    onDismiss={this._hideNewActivityDialog.bind(this)}
                    visible={this.state.showNewActivityDialog}
                    title={StringDictionary.addNewActivity}
                    primaryButtonText={StringDictionary.addNewActivity} />

                <ActivityInputDialog
                    activity={this.state.selectedActivity}
                    onChangeNameText={(value) => this.setState({ selectedActivity: { ...this.state.selectedActivity, name: value } })}
                    onChangeDescriptionText={(value) => this.setState({ selectedActivity: { ...this.state.selectedActivity, description: value } })}
                    saveActivityActionPress={this._editSelectedActivity.bind(this)}
                    onDismiss={this._hideEditActivityDialog.bind(this)}
                    visible={this.state.showEditActivityDialog}
                    title={StringDictionary.edit}
                    primaryButtonText={StringDictionary.save} />

                <ActivityStatusDialog
                    activity={this.state.selectedActivity}
                    toggleActivityStarted={this._toggleActivityStarted.bind(this)}
                    onDismiss={this._hideActivityStatusDialog.bind(this)}
                    visible={this.state.showActivityStatusDialog} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        flexDirection: 'column',
        backgroundColor: Colors.bodyBackgroundColor,
    },
    box: {
        flex: 1
    },
    dialogBody: {
        paddingBottom: 15
    },
    dialogActions: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    grid: {
        paddingLeft: 5,
        paddingRight: 5
    },
    body: {
        flex: 10
    },
    footer: {
        flex: 1.5,
        paddingBottom: 10,
        marginTop: 'auto'
    }
});
