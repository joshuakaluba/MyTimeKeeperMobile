import { AsyncStorage } from 'react-native';

const TOKEN_STORAGE_KEY = 'TOKEN_STORAGE_KEY';
const USER_STORAGE_KEY = 'USER_STORAGE_KEY';
const PUSH_NOTIFICATION_KEY = 'PUSH_NOTIFICATION_KEY';
const SERVER_ADDRESS_KEY = 'SERVER_ADDRESS_KEY';

export default StorageHelper = {

    async saveToken(user) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, user.accessToken);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    },

    async savePushNotificationToken(token) {
        await AsyncStorage.setItem(PUSH_NOTIFICATION_KEY, token);
    },

    async saveServerAddress(address) {
        await AsyncStorage.setItem(SERVER_ADDRESS_KEY, address);
    },

    async getServerAddress() {
        const serverAddress = await AsyncStorage.getItem(SERVER_ADDRESS_KEY);
        return serverAddress;
    },

    async getPushNotificationToken() {
        const token = await AsyncStorage.getItem(PUSH_NOTIFICATION_KEY);
        return token;
    },

    async getUser() {
        const user = await AsyncStorage.getItem(USER_STORAGE_KEY);
        return JSON.parse(user);
    },

    async getAccessToken() {
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        return token;
    },

    async getAuthenticatedRestData() {
        let token = await this.getAccessToken();
        let serverAddress = await this.getServerAddress();

        var data = {
            token: token,
            serverAddress: serverAddress
        };

        return data;
    },

    async clear() {
        await AsyncStorage.clear();
    },

    async validTokenExists() {
        let token = await this.getAccessToken();
        return ((token != null) && (token.length > 0)) ? true : false;
    }
}