import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import { ListItem, Body, Right, Text } from 'native-base';
import * as Icon from '@expo/vector-icons'
import { StringDictionary, Colors } from '../constants';

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

    _onToggleActivityStarted = () => {
        this.props.onToggleActivityStarted(this.props.activity);
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
                    <Text note >
                        {this.props.activity.description}
                    </Text>
                    <Text note style={styles.inProgressText}>
                        {this.props.activity.started === 1 ? StringDictionary.inProgress : ''}
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
        color: Colors.danger,
        paddingTop: 5
    }
});
