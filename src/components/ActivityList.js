import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'native-base';
import ActivityListItem from './ActivityListItem';

export default class ActivityList extends React.Component {

    static propTypes = {
        activities: PropTypes.array.isRequired,
        onSelect: PropTypes.func.isRequired,
        onToggleActivityStarted: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired
    };

    render() {
        return (
            <List>
                {
                    this.props.activities.map((activity) => (
                        <ActivityListItem
                            key={activity.id}
                            activity={activity}
                            onSelect={this.props.onSelect}
                            onToggleActivityStarted={this.props.onToggleActivityStarted}
                            onEdit={this.props.onEdit}
                            onDelete={this.props.onDelete} />
                    ))
                }
            </List>
        );
    }
}
