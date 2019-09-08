import { SQLite } from 'expo-sqlite';
import moment from 'moment';
import BaseRepository from "./BaseRepository";
import { SQLiteUtil } from '../utilities';

const db = SQLite.openDatabase(SQLiteUtil.getDatabaseFileName());
const defaultActivityStarted = 0;
const defaultMoment = moment(new Date(-8640000000000000)).toISOString();

export default class ActivityRepository extends BaseRepository {
    constructor() {
        super();
    }

    getActivities = (callBackActivities) => {
        const sql = 'SELECT `id`, `name`, `description`, `started`, `latest_start_time`, `most_recent_log_id` FROM Activities ORDER BY date(`latest_start_time`) DESC;';
        db.transaction(tx => {
            tx.executeSql(
                sql, [],
                (_, { rows: { _array } }) => callBackActivities(_array)
            );
        });
    }

    createActivity = (activity, successCallback) => {
        const params = [activity.name, activity.description, defaultActivityStarted, defaultMoment, ''];
        const sql = 'INSERT INTO `Activities` (`name`, `description`, `started`,\
                     `latest_start_time`, `most_recent_log_id`) VALUES (?, ?, ?, ?, ?);';
        db.transaction(
            tx => { tx.executeSql(sql, params); },
            this.handleDatabaseError,
            successCallback != null && successCallback()
        );
    }

    editActivity = (activity, successCallback) => {

        console.log('ActivityRepository.editActivity() - editing activity', activity);
        const params = [
            activity.name,
            activity.description,
            activity.started,
            activity.latest_start_time,
            activity.most_recent_log_id,
            activity.id];

        const sql = `UPDATE Activities SET name=?, description=?, started=?, latest_start_time=?, most_recent_log_id=? WHERE id=?;`;

        db.transaction(
            tx => { tx.executeSql(sql, params); },
            this.handleDatabaseError,
            successCallback != null && successCallback()
        );
    }

    deleteActivity = (activity, successCallback) => {
        const params = [activity.id];
        const sql = 'DELETE FROM `Activities` WHERE `id` = ?;';
        db.transaction(
            tx => { tx.executeSql(sql, params); },
            this.handleDatabaseError,
            successCallback != null && successCallback()
        );
    }
}