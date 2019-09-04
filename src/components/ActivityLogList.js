import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'native-base';
import ActivityLogListItem from './ActivityLogListItem';

export default class ActivityLogList extends React.Component {

    static propTypes = {
        activityLogs: PropTypes.array.isRequired,
        onSelect: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired
    };

    render() {
        return (
            <List>
                {
                    this.props.activityLogs.map((activityLog) => (
                        <ActivityLogListItem
                            key={activityLog.id}
                            activityLog={activityLog}
                            onSelect={this.props.onSelect}
                            onEdit={this.props.onEdit}
                            onDelete={this.props.onDelete} />
                    ))
                }
            </List>
        );
    }
}
