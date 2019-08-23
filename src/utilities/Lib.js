import moment from 'moment';

export default Lib = {

    showError(error) {
        try {
            console.log(error);
            setTimeout(() => { alert(error); }, 500);
            //TODO send bugs to bugsnag
        }
        catch{ 
            //do nothing
        }
    },

    getFormattedDate(dateToFormat) {
        return moment.utc(dateToFormat).local().format("hh:mm:ss A - ddd, MMM Do, YYYY");
    },

    getFormattedShortDate(dateToFormat) {
        return moment.utc(dateToFormat).local().format("kk:mm MM/DD/YY");
    },

    getFormattedDateNoTime(dateToFormat) {
        return moment.utc(dateToFormat).local().format("MMM Do, YYYY");
    },

    generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

}