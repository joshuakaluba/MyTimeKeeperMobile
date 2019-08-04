import { SQLite } from 'expo-sqlite';

const databaseFileName = 'db.db';

export default SQLiteUtil = {

    getDatabaseFileName() {
        return databaseFileName;
    }
}