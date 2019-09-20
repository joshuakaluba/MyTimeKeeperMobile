import React, { Component } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Alert,
    Text,
    DeviceEventEmitter
} from "react-native";
import moment from "moment";
import * as Icon from "@expo/vector-icons";
import { Col, Grid } from "react-native-easy-grid";
import {
    Colors,
    StringDictionary,
    ApplicationDefaultSettings,
    DeviceEvents,
    AdMobIdentifiers
} from "../constants";
import {
    ActivityList,
    ActivityInputDialog,
    ActivityStatusDialog, PrimaryButton
} from "../components";
import { AdMobBanner, AdMobInterstitial } from "expo-ads-admob";
import { ActivityRepository, ActivityLogRepository } from "../data";
import { Lib } from '../utilities';

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
                            onPress={() => {
                                params.showNewActivityDialog();
                            }}
                            name={"md-add"}
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
            name: "",
            description: ""
        },
        selectedActivity: {
            name: "",
            description: "",
            latest_start_time: ""
        },
        activities: []
    };

    activityRepository = new ActivityRepository();
    activityLogRepository = new ActivityLogRepository();

    async componentWillMount() {
        this.props.navigation.setParams({
            showNewActivityDialog: this._showAddNewActivityDialog.bind(this)
        });

        DeviceEventEmitter.addListener(DeviceEvents.updateActivities, () => {
            this._getActivities();
        });

        this._getActivities();
    }

    _endLoading = () => this.setState({ loading: false });

    _hideNewActivityDialog = () =>
        this.setState({
            showNewActivityDialog: false,
            newActivity: {
                name: "",
                description: ""
            }
        });

    _hideEditActivityDialog = () =>
        this.setState({ showEditActivityDialog: false });

    _hideActivityStatusDialog = () =>
        this.setState({ showActivityStatusDialog: false });

    _showAddNewActivityDialog = () =>
        this.setState({ showNewActivityDialog: true });

    _getActivities = () => {
        this.setState({ activities: [], loading: true });
        this.activityRepository.getActivities(this._updateActivities.bind(this));
        this._endLoading();
    };

    _updateActivities = activities => {
        if (activities.length > 0) {
            this.setState({ activities });
        }
    };

    _activityRefreshCallback = () => {
        const getActivities = this._getActivities.bind(this);

        // TODO for some reason you need to wait before the
        // newly inserted activities can persist in storage

        setTimeout(function () {
            getActivities();
        }, 500);
    };

    _addNewActivity = () => {
        this._hideNewActivityDialog();
        const activity = this.state.newActivity;
        this.activityRepository.createActivity(
            activity,
            this._activityRefreshCallback.bind(this)
        );
    };

    _editSelectedActivity = () => {
        this._hideEditActivityDialog();
        const activity = this.state.selectedActivity;
        this.activityRepository.editActivity(activity, this._activityRefreshCallback.bind(this));
    };

    _selectActivity = activity => this.setState({ selectedActivity: activity });

    _selectActivityItem = activity => {
        console.log('ActivitiesScreen._selectActivityItem() - selecting activity', activity);
        this._selectActivity(activity);
        this.setState({ showActivityStatusDialog: true });
    };

    _editActivity = activity => {
        this._selectActivity(activity);
        this.setState({ showEditActivityDialog: true });
    };

    _deleteActivity = activity => {
        this.setState({ activityToDelete: activity });
        const deleteConfirmed = this._deleteConfirmed.bind(this);
        Alert.alert(
            StringDictionary.delete,
            `${StringDictionary.deleteConfirmation}${activity.name}`,
            [
                {
                    text: StringDictionary.cancel,
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: StringDictionary.ok, onPress: deleteConfirmed }
            ],
            { cancelable: true }
        );
    };

    _deleteConfirmed = () => {
        const activity = this.state.activityToDelete;
        console.log('ActivitiesScreen._deleteConfirmed() - deleting activity - ', activity);
        this.activityRepository.deleteActivity(activity, this._activityRefreshCallback.bind(this));

        // TODO hack
        setTimeout(function () {
            DeviceEventEmitter.emit(DeviceEvents.updateLogActivities);
        }, 500);
    };

    _showInterstitialAd = async () => {
        try {
            if (AdMobIdentifiers.showAds) {
                AdMobInterstitial.setAdUnitID(AdMobIdentifiers.interstitial);
                AdMobInterstitial.setTestDeviceID("EMULATOR");
                await AdMobInterstitial.requestAdAsync();
                await AdMobInterstitial.showAdAsync();
            }
        } catch (error) {
            //do nothing
        }
    };

    _toggleActivityStarted = async (activity) => {
        this._hideActivityStatusDialog();

        console.log('ActivitiesScreen._toggleActivityStarted() - toggling activity', activity);

        await this._showInterstitialAd();

        if (!!activity) {
            if (activity.started === 0) {
                // starting activity and creating log
                let uuid = Lib.generateGuid();
                activity.started = 1;
                activity.latest_start_time = moment().utc().toISOString();
                activity.most_recent_log_id = uuid

                const activityLog = {
                    activity_id: activity.id,
                    most_recent_log_id: uuid
                };
                this.activityRepository.editActivity(activity, this._activityRefreshCallback.bind(this));
                this.activityLogRepository.createActivityLog(activityLog, this._activityRefreshCallback.bind(this));
            } else {
                // ending activity
                activity.started = 0;
                this.activityRepository.editActivity(activity, this._activityRefreshCallback.bind(this)
                );
                this._completeActivityLog(activity);
            }

            DeviceEventEmitter.emit(DeviceEvents.updateLogActivities);
        }
        else {
            Lib.showError("No activity");
        }
    };

    _completeActivityLog = activity => {
        this.activityLogRepository.completeActivityLog(activity, this._activityRefreshCallback.bind(this));
        this.activityLogRepository.getActivityLogs(this._activityRefreshCallback);
    };

    _bannerError = error => {
        console.error(error);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={[styles.box, styles.body]}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.loading}
                                onRefresh={this._getActivities.bind(this)}
                            />
                        }
                    >
                        {
                            this.state.activities && this.state.activities.length > 0 ?
                                <ActivityList
                                    activities={this.state.activities}
                                    onSelect={this._selectActivityItem.bind(this)}
                                    onEdit={this._editActivity.bind(this)}
                                    onDelete={this._deleteActivity.bind(this)}
                                    onToggleActivityStarted={this._toggleActivityStarted.bind(this)}
                                />
                                :
                                <View style={styles.card}>
                                    <Icon.Entypo
                                        name={"emoji-sad"}
                                        size={35}
                                        color={Colors.lightGrey}
                                    />
                                    <Text style={styles.noActivities}>You currently have no activities</Text>
                                    <PrimaryButton
                                        onPress={() => { this._showAddNewActivityDialog(); }}
                                        text={StringDictionary.addNewActivity} />
                                </View>
                        }
                    </ScrollView>
                </View>
                {
                    AdMobIdentifiers.showAds === true &&
                    <View style={[styles.box, styles.footer, { alignItems: "center" }]}>
                        <AdMobBanner
                            style={styles.bottomBanner}
                            bannerSize="smartBannerPortrait"
                            adUnitID={AdMobIdentifiers.banner}
                            testDeviceID="EMULATOR"
                            didFailToReceiveAdWithError={this._bannerError}
                        />
                    </View>
                }

                <ActivityInputDialog
                    activity={this.state.newActivity}
                    onChangeNameText={value =>
                        this.setState({
                            newActivity: { ...this.state.newActivity, name: value }
                        })
                    }
                    onChangeDescriptionText={value =>
                        this.setState({
                            newActivity: { ...this.state.newActivity, description: value }
                        })
                    }
                    saveActivityActionPress={this._addNewActivity.bind(this)}
                    onDismiss={this._hideNewActivityDialog.bind(this)}
                    visible={this.state.showNewActivityDialog}
                    title={StringDictionary.addNewActivity}
                    primaryButtonText={StringDictionary.addNewActivity}
                />

                <ActivityInputDialog
                    activity={this.state.selectedActivity}
                    onChangeNameText={value =>
                        this.setState({
                            selectedActivity: { ...this.state.selectedActivity, name: value }
                        })
                    }
                    onChangeDescriptionText={value =>
                        this.setState({
                            selectedActivity: {
                                ...this.state.selectedActivity,
                                description: value
                            }
                        })
                    }
                    saveActivityActionPress={this._editSelectedActivity.bind(this)}
                    onDismiss={this._hideEditActivityDialog.bind(this)}
                    visible={this.state.showEditActivityDialog}
                    title={StringDictionary.edit}
                    primaryButtonText={StringDictionary.save}
                />

                <ActivityStatusDialog
                    activity={this.state.selectedActivity}
                    toggleActivityStarted={this._toggleActivityStarted.bind(this)}
                    onDismiss={this._hideActivityStatusDialog.bind(this)}
                    visible={this.state.showActivityStatusDialog}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        flexDirection: "column",
        backgroundColor: Colors.bodyBackgroundColor
    },
    box: {
        flex: 1
    },
    card: {
        margin: 15,
        paddingTop: 50,
        paddingBottom: 50,
        backgroundColor: Colors.white,
        justifyContent: "center",
        alignItems: "center",
        borderColor: Colors.lightGrey,
        borderWidth: 2,
        borderRadius: 12
    },
    noActivities: {
        fontSize: 14,
        fontWeight: "800",
        marginTop: 30,
        marginBottom: 30,
        color: Colors.darkGrey
    },
    bottomBanner: {
        position: "absolute",
        bottom: 0
    },
    body: {
        flex: 10
    },
    footer: {
        flex: 1,
        paddingBottom: 10,
        marginTop: "auto"
    }
});
