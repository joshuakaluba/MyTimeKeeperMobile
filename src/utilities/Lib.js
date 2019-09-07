import moment from 'moment';
import countdown from 'countdown';

export default Lib = {

    showError(error) {
        try {
            console.error(error);
            setTimeout(() => { alert(error); }, 500);
            //TODO send bugs to bugsnag
        }
        catch{ }
    },

    getFormattedShortDate(dateToFormat) {
        return moment.utc(dateToFormat).local().format("hh:mma MMM/DD/YY");
    },

    getActivityLogProgressString(activityLog) {
        let output = `${Lib.getFormattedShortDate(activityLog.start_time)}`;
        if (activityLog.completed === 1) {
            output = output + ` - ${Lib.getFormattedShortDate(activityLog.end_time)}`;
        }
        return output;
    },

    getElapsedTime(startTime) {
        return Lib.formatCountdownString(countdown(new Date(startTime)).toString());
    },

    getActivityLogDuration(activityLog) {
        return Lib.formatCountdownString(countdown(new Date(activityLog.start_time), new Date(activityLog.end_time)).toString());
    },

    formatCountdownString(stringToFormat) {
        return stringToFormat.replace(/\s/g, '')
            .replace('years', 'y ')
            .replace('year', 'y ')
            .replace('months', 'm ')
            .replace('month', 'm ')
            .replace('weeks', 'w ')
            .replace('week', 'w ')
            .replace('days', 'd ')
            .replace('day', 'd ')
            .replace('hours', 'h ')
            .replace('hour', 'h ')
            .replace('minutes', 'm ')
            .replace('minute', 'm ')
            .replace('seconds', 's ')
            .replace('second', 's ')
            .replace(/,/g, '')
            .replace('and', '');
    },

    generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

}