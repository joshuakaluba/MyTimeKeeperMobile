import { SQLite } from "expo-sqlite";
import moment from "moment";
import BaseRepository from "./BaseRepository";
import { SQLiteUtil } from "../utilities";

const db = SQLite.openDatabase(SQLiteUtil.getDatabaseFileName());
const defaultActivityLogStarted = 0;
const defaultDate = new Date(-8640000000000000).toISOString();
const defaultMoment = moment(defaultDate).utc().toISOString();

export default class ActivityLogRepository extends BaseRepository {
  constructor() {
    super();
  }

  getActivityLogs = (activityLogCallback, activityIdToFilterBy) => {
    let sql =
      "SELECT ActivityLogs.id AS `id`, start_time, ActivityLogs.most_recent_log_id AS `most_recent_log_id`, \
                    end_time, completed, activity_id, Activities.name AS `name`, Activities.description \
                    FROM`ActivityLogs` \
                    INNER JOIN`Activities` ON Activities.id = ActivityLogs.activity_id ";

    if (activityIdToFilterBy != null) {
      sql = sql + ` WHERE activity_id = ${activityIdToFilterBy.id} `;
    }

    sql = sql + "ORDER BY completed ASC, date(`end_time`) ASC;";

    db.transaction(tx => {
      tx.executeSql(sql, [], (_, { rows: { _array } }) => {
        activityLogCallback(_array);
      });
    });
  };

  createActivityLog = (activityLog, successCallback) => {

    console.log('ActivityLogRepository.createActivityLog() creating activity log', activityLog);

    const currentMoment = moment().utc().toISOString();
    const params = [
      currentMoment,
      defaultMoment,
      defaultActivityLogStarted,
      activityLog.activity_id,
      activityLog.most_recent_log_id
    ];

    const updateSql = `UPDATE ActivityLogs SET completed=1 WHERE activity_id=${activityLog.activity_id};`;
    const insertSql =
      "INSERT INTO `ActivityLogs` (`start_time`, `end_time`, `completed`, `activity_id`, `most_recent_log_id`) VALUES (?, ?, ?, ?, ?);";

    db.transaction(
      tx => {
        tx.executeSql(updateSql);
        tx.executeSql(insertSql, params);
      },
      this.handleDatabaseError,
      successCallback != null && successCallback()
    );
  };

  editActivityLog = (activityLog, successCallback) => {
    const params = [
      activityLog.start_time,
      activityLog.end_time,
      activityLog.completed,
      activityLog.id
    ];

    const sql =
      "UPDATE `ActivityLogs` SET `start_time`=?, `end_time`=?, `completed`=? WHERE id=?";
    db.transaction(
      tx => {
        tx.executeSql(sql, params);
      },
      this.handleDatabaseError,
      successCallback != null && successCallback()
    );
  };

  completeActivityLog = (activity, successCallback) => {
    const currentMoment = moment().toISOString();
    const params = [currentMoment, 1, activity.id];
    const sql = `UPDATE ActivityLogs SET end_time=?, completed=? WHERE id=(SELECT id FROM ActivityLogs WHERE completed = 0 AND activity_id = ? LIMIT 1)`;

    db.transaction(
      tx => {
        tx.executeSql(sql, params);
      },
      this.handleDatabaseError,
      successCallback != null && successCallback()
    );
  };

  deleteActivityLog = (activityLog, successCallback) => {
    const params = [activityLog.id];
    const sql = "DELETE FROM `ActivityLogs` WHERE `id` = ?;";
    const updateSql = `UPDATE Activities SET started = 0, most_recent_log_id='' WHERE most_recent_log_id ='${activityLog.most_recent_log_id}'; `;

    console.log('ActivityLogRepository.deleteActivityLog() update sql', updateSql);
    console.log('ActivityLogRepository.deleteActivityLog() activity log', activityLog);

    db.transaction(
      tx => {
        tx.executeSql(sql, params);
        tx.executeSql(updateSql);
      },
      this.handleDatabaseError,
      successCallback != null && successCallback()
    );
  };
}