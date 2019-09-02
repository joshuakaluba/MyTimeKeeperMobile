import { SQLite } from 'expo-sqlite';
import { Lib, SQLiteUtil } from '../utilities';

const db = SQLite.openDatabase(SQLiteUtil.getDatabaseFileName());

export default class BaseRepository {

    constructor() {
        this.createDatabase();
    }

    createDatabase = () => {
        const activitiesSql = 'CREATE TABLE IF NOT EXISTS `Activities` (\
                        `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
                        `name` TEXT, \
                        `description` TEXT, \
                        `started` INTEGER, \
                        `most_recent_log_id` TEXT, \
                        `latest_start_time` TEXT \
                    );';

        const activityLogsSql = 'CREATE TABLE IF NOT EXISTS `ActivityLogs` ( \
                        `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
                        `start_time`	TEXT, \
                        `end_time`	TEXT, \
                        `completed`	INTEGER NOT NULL, \
                        `most_recent_log_id` TEXT, \
                        `activity_id`	INTEGER NOT NULL, \
                        FOREIGN KEY(activity_id) REFERENCES Activities(id) \
                    );';

        db.transaction(tx => {
            tx.executeSql(activitiesSql);
            tx.executeSql(activityLogsSql);
        });
    }

    handleDatabaseError = (error) => {
        Lib.showError(error);
    }
}