import React, { Component } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  DeviceEventEmitter
} from "react-native";
import * as Icon from "@expo/vector-icons";
import { Col, Grid } from "react-native-easy-grid";
import {
  Colors,
  StringDictionary,
  ApplicationDefaultSettings,
  DeviceEvents,
  AdMobIdentifiers
} from "../constants";
import { Dropdown } from 'react-native-material-dropdown';
import { AdMobBanner, AdMobInterstitial } from "expo-ads-admob";
import { ActivityLogList } from "../components";
import { ActivityLogRepository, ActivityRepository } from "../data";

export default class ActivitiesScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: StringDictionary.history,
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
    activities: [],
    dropDownActivities: []
  };

  activityLogRepository = new ActivityLogRepository();
  activityRepository = new ActivityRepository();

  async componentWillMount() {
    this.props.navigation.setParams({
      showNewActivityDialog: this._showAddNewActivityDialog.bind(this)
    });

    DeviceEventEmitter.addListener(DeviceEvents.updateLogActivities, () => {
      this._getActivities();
      this._getActivityLogs();
    });

    this._getActivities();
    this._getActivityLogs();
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

  _hideEditActivityLogDialog = () => this.setState({ showEditActivityDialog: false });

  _hideActivityStatusDialog = () => this.setState({ showActivityStatusDialog: false });

  _showAddNewActivityDialog = () => this.setState({ showNewActivityDialog: true });

  _getActivityLogs = () => {
    this.setState({ activityLogs: [], loading: true });
    this.activityLogRepository.getActivityLogs(
      this._updateActivityLogs.bind(this)
    );
    this._endLoading();
  };

  _updateActivityLogs = activityLogs => {
    this.setState({ activityLogs, activityLogsClone: activityLogs });
    console.log('ActivityLogsScreen._updateActivityLogs()', activityLogs);
  };

  _activityRefreshCallback = () => {
    const getActivityLogs = this._getActivityLogs.bind(this);

    // TODO for some reason you need to wait before the
    // newly inserted activities can persist in storage

    setTimeout(function () {
      getActivityLogs();
    }, 500);
  };

  _getActivities = () => {
    this.setState({ activities: [], loading: true });
    this.activityRepository.getActivities(this._updateActivities.bind(this));
    this._endLoading();
  };

  _updateActivities = activities => {
    console.log(`ActivityLogsScreen._updateActivities()`, activities);
    let dropDownActivities = [{ value: 'All Activities' }];
    for (i = 0; i < activities.length; i++) {
      const activity = activities[i];
      dropDownActivities.push({ value: activity['name'], 'activity': activity });
    }
    this.setState({ activities, dropDownActivities });
  };


  _selectActivityLog = activityLog => this.setState({ selectedActivityLog: activityLog });

  _selectActivityLogItem = activityLog => {
    this._selectActivityLog(activityLog);
    this.setState({ showActivityStatusDialog: true });
  };

  _deleteActivityLog = activityLog => {
    this._selectActivityLog(activityLog);
    const _deleteConfirmed = this._deleteConfirmed.bind(this);
    Alert.alert(
      StringDictionary.delete,
      StringDictionary.deleteLogConfirmation,
      [
        {
          text: StringDictionary.cancel,
          onPress: () => {/*do nothing*/ },
          style: "cancel"
        },
        { text: StringDictionary.ok, onPress: _deleteConfirmed }
      ],
      { cancelable: true }
    );
  };

  _deleteConfirmed = () => {
    const activityLog = this.state.selectedActivityLog;
    this.activityLogRepository.deleteActivityLog(activityLog, this._activityRefreshCallback.bind(this));

    // TODO hack
    setTimeout(function () {
      DeviceEventEmitter.emit(DeviceEvents.updateActivities);
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

  _dropDownSelectionChanged = (value, index) => {
    console.log(`ActivityLogsScreen._dropDownSelectionChanged() - value: `, value);
    console.log(`ActivityLogsScreen._dropDownSelectionChanged() - index: `, index);

    if (index === 0) {
      const originalLogs = this.state.activityLogsClone;
      this.setState({ activityLogs: originalLogs });
      return;
    }

    const selectedActivity = this.state.dropDownActivities[index].activity;
    console.log(`ActivityLogsScreen._dropDownSelectionChanged() -selected activity`, selectedActivity);
    this._filterActivityLogsByActivity(selectedActivity);
  }

  _filterActivityLogsByActivity = (activity) => {
    console.log(`ActivityLogsScreen._filterActivityLogsByActivity() -activity`, activity);

    let activityLogs = [];

    for (i = 0; i < this.state.activityLogsClone.length; i++) {
      const activityLog = this.state.activityLogsClone[i];
      if (activityLog.activity_id === activity.id) {
        activityLogs.push(activityLog);
      }
    }

    this.setState({ activityLogs });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.box, styles.body]}>
          <Dropdown
            label={StringDictionary.filterByActivity}
            onChangeText={this._dropDownSelectionChanged}
            data={this.state.dropDownActivities}
          />
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={this.state.loading}
                onRefresh={this._getActivityLogs.bind(this)}
              />
            }
          >
            <ActivityLogList
              activityLogs={this.state.activityLogs}
              onSelect={this._selectActivityLogItem.bind(this)}
              onDelete={this._deleteActivityLog.bind(this)}
            />
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
