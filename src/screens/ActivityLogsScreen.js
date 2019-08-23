import React, { Component } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  DeviceEventEmitter
} from "react-native";
import moment from "moment";
import * as Icon from "@expo/vector-icons";
import { Col, Grid } from "react-native-easy-grid";
import {
  Colors,
  StringDictionary,
  ApplicationDefaultSettings,
  DeviceEvents
} from "../constants";
import { List, ListItem, Body, Right, Text } from "native-base";
import {
  ActivityList,
  ActivityInputDialog,
  ActivityStatusDialog
} from "../components";
import { ActivityRepository, ActivityLogRepository } from "../data";

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
    activities: []
  };

  activityLogRepository = new ActivityLogRepository();

  async componentWillMount() {
    this.props.navigation.setParams({
      showNewActivityDialog: this._showAddNewActivityDialog.bind(this)
    });

    DeviceEventEmitter.addListener(DeviceEvents.updateLogActivities, () => {
      this._getActivityLogs();
    });

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

  _hideEditActivityDialog = () =>
    this.setState({ showEditActivityDialog: false });

  _hideActivityStatusDialog = () =>
    this.setState({ showActivityStatusDialog: false });

  _showAddNewActivityDialog = () =>
    this.setState({ showNewActivityDialog: true });

  _getActivityLogs = () => {
    this.setState({ activityLogs: [], loading: true });
    this.activityLogRepository.getActivityLogs(
      this._updateActivityLogs.bind(this)
    );
    this._endLoading();
  };

  _updateActivityLogs = activityLogs => {
    if (activityLogs.length > 0) {
      this.setState({ activityLogs });
    }
  };

  _activityRefreshCallback = () => {
    const getActivities = this._getActivityLogs.bind(this);

    // TODO for some reason you need to wait before the
    // newly inserted activities can persist in storage

    setTimeout(function() {
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
    this.activityRepository.editActivity(
      activity,
      this._activityRefreshCallback.bind(this)
    );
  };

  _selectActivity = activity => this.setState({ selectedActivity: activity });

  _selectActivityItem = activity => {
    this._selectActivity(activity);
    this.setState({ showActivityStatusDialog: true });
  };

  _editActivity = activity => {
    this.setState({ showEditActivityDialog: true });
    this._selectActivity(activity);
  };

  _deleteActivity = activity => {
    this._selectActivity(activity);
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
    const activity = this.state.selectedActivity;
    this.activityRepository.deleteActivity(
      activity,
      this._activityRefreshCallback.bind(this)
    );
  };

  _toggleActivityStarted = () => {
    this._hideActivityStatusDialog();
    const activity = this.state.selectedActivity;

    if (activity.started === 0) {
      activity.started = 1;
      activity.latest_start_time = moment().toISOString();

      this.activityRepository.editActivity(
        activity,
        this._activityRefreshCallback.bind(this)
      );

      const activityLog = {
        activity_id: activity.id
      };

      this.activityLogRepository.createActivityLog(
        activityLog,
        this._activityRefreshCallback.bind(this)
      );
    } else {
      // ending activity
      activity.started = 0;
      this.activityRepository.editActivity(
        activity,
        this._activityRefreshCallback.bind(this)
      );
      this._completeActivityLog(activity);

      // Find incomplete log

      // Complete log
    }
  };

  _completeActivityLog = activity => {
    this.activityLogRepository.completeActivityLog(
      activity,
      this._activityRefreshCallback.bind(this)
    );

    this.activityLogRepository.getActivityLogs(this._activityRefreshCallback);
    //update t1 set value1 = (select value2 from t2 where t2.id = t1.id) where t1.value1 = 0;
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.box, styles.body]}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={this.state.loading}
                onRefresh={this._getActivityLogs.bind(this)}
              />
            }
          >
            <List>
              {this.state.activityLogs.map(activityLog => (
                <ListItem
                  avatar
                  onPress={() => {
                    console.log(`on select`);
                  }}
                  key={activityLog.id}
                >
                  <Body>
                    <Text>{activityLog.name}</Text>
                    <Text note>
                      {activityLog.completed !== 1
                        ? StringDictionary.inProgress
                        : ""}
                    </Text>
                  </Body>
                  <Right>
                    {/*
                                                                                            <Menu
                                                visible={this.state.menuVisible}
                                                onDismiss={this._closeMenu}
                                                anchor={
                                                    <Icon.Entypo
                                                        name={'dots-three-vertical'}
                                                        onPress={this._openMenu}
                                                        size={20}
                                                    />
                                                }>
                                                <Menu.Item
                                                    onPress={this._onToggleActivityStarted}
                                                    title={this.props.activity.started === 1 ? StringDictionary.stopActivity : StringDictionary.startActivity} />
                                                <Divider />
                                                <Menu.Item
                                                    onPress={this._onEdit}
                                                    title={StringDictionary.edit} />
                                                <Divider />
                                                <Menu.Item
                                                    onPress={this._onDelete}
                                                    title={StringDictionary.delete} />
                                            </Menu>
                                                
                                                */}

                    <Text>
                      {`${activityLog.start_time} \n \t ${
                        activityLog.end_time
                      }`}
                    </Text>
                  </Right>
                </ListItem>
              ))}
            </List>
          </ScrollView>
        </View>
        <View style={[styles.box, styles.footer, { alignItems: "center" }]}>
          <Text>Hello Ad Space</Text>
        </View>
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
  dialogBody: {
    paddingBottom: 15
  },
  dialogActions: {
    justifyContent: "center",
    alignItems: "center"
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
    marginTop: "auto"
  }
});
