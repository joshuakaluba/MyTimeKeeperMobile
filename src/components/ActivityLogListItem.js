import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Menu } from 'react-native-paper';
import { ListItem, Body, Right, Text } from 'native-base';
import * as Icon from '@expo/vector-icons'
import { StringDictionary, Colors } from '../constants';
import { Lib } from '../utilities';
import InProgressText from './InProgressText';
import CountingDurationText from './CountingDurationText';

export default class ActivityLogListItem extends React.Component {

    static propTypes = {
        activityLog: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired
    };

    state = {
        menuVisible: false
    };

    _openMenu = () => this.setState({ menuVisible: true });

    _closeMenu = () => this.setState({ menuVisible: false });

    _onSelect = () => {
        //this.props.onSelect(this.props.activityLog);
        this._closeMenu();
    };

    _onDelete = () => {
        this.props.onDelete(this.props.activityLog);
        this._closeMenu();
    };

    render() {
        return (
            <ListItem avatar onPress={this._onSelect}>
                <Body>
                    <Text>
                        {this.props.activityLog.name}
                    </Text>
                    <Text note >
                        {Lib.getActivityLogProgressString(this.props.activityLog)}
                    </Text>
                    {
                        this.props.activityLog.completed === 1 ?
                            <Text note style={styles.durationText}>
                                {Lib.getActivityLogDuration(this.props.activityLog)}
                            </Text>
                            :
                            <InProgressText text={StringDictionary.inProgress} />
                    }
                    {
                        this.props.activityLog.completed === 0 &&
                        <CountingDurationText startTime={this.props.activityLog.start_time} />
                    }
                </Body>
                <Right>
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
                            onPress={this._onDelete}
                            title={StringDictionary.delete} />
                    </Menu>
                </Right>
            </ListItem>
        );
    }
}

const styles = StyleSheet.create({
    durationText: {
        color: Colors.black,
        fontWeight: 'bold',
        paddingTop: 5
    }
});
