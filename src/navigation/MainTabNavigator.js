import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";
import { ApplicationDefaultSettings, StringDictionary } from "../constants";
import TabBarIcon from "../components/TabBarIcon";
import * as Icon from "@expo/vector-icons";
import { ActivitiesScreen, ActivityLogsScreen } from "../screens";

const config = Platform.select({
  web: { headerMode: "screen" },
  default: {}
});

const ActivityStack = createStackNavigator({ Home: ActivitiesScreen }, config);

ActivityStack.path = "";

ActivityStack.navigationOptions = {
  tabBarLabel: StringDictionary.myActivities,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-clock" : "md-clock"}
    />
  )
};

const ActivityLogStack = createStackNavigator(
  { Home: ActivityLogsScreen },
  config
);

ActivityLogStack.path = "";

ActivityLogStack.navigationOptions = {
  tabBarLabel: StringDictionary.history,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-menu" : "md-menu"}
    />
  )
};

const tabNavigator = createBottomTabNavigator(
  {
    ActivityStack,
    ActivityLogStack
  },
  {
    tabBarOptions: ApplicationDefaultSettings.tabBarOptions
  }
);

tabNavigator.path = "";

export default tabNavigator;
