import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import { ListItem, Body, Right, Text } from 'native-base';
import * as Icon from '@expo/vector-icons'
import { StringDictionary, Colors } from '../constants';
import InProgressText from './InProgressText';
import CountingDurationText from './CountingDurationText';

export default class ActivityListItem extends React.Component {

    static propTypes = {
        activity: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired,
        onToggleActivityStarted: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired
    };

    state = {
        menuVisible: false
    };

    _openMenu = () => this.setState({ menuVisible: true });

    _closeMenu = () => this.setState({ menuVisible: false });

    _onEdit = () => {
        this.props.onEdit(this.props.activity);
        this._closeMenu();
    };

    _onSelect = () => {
        this.props.onSelect(this.props.activity);
        this._closeMenu();
    };

    _onToggleActivityStarted = async () => {
        await this.props.onToggleActivityStarted(this.props.activity);
        this._closeMenu();
    };

    _onDelete = () => {
        this.props.onDelete(this.props.activity);
        this._closeMenu();
    };

    render() {
        return (
            <ListItem avatar onPress={this._onSelect}>
                <Body>
                    <Text>
                        {this.props.activity.name}
                    </Text>
                    {
                        this.props.activity.started === 1 ?
                            <InProgressText text={StringDictionary.inProgress} /> :
                            <Text note style={styles.inProgressText}>
                                {''}
                            </Text>
                    }
                    {
                        this.props.activity.started === 1 &&
                        <CountingDurationText startTime={this.props.activity.latest_start_time} />
                    }
                    <Text note >
                        {this.props.activity.description}
                    </Text>
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
                </Right>
            </ListItem>
        );
    }
}

const styles = StyleSheet.create({
    inProgressText: {
        color: Colors.primary,
        fontWeight: 'bold',
        paddingTop: 5
    }
});
