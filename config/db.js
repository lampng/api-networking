const mongoose = require('mongoose');
const log = console.log;

async function connect() {
    try {
        mongoose.Promise = global.Promise
        await mongoose.connect('mongodb+srv://lampng:vhoOvRTkwH8oWxst@nodejs-server.omzznkp.mongodb.net/api-asm?retryWrites=true&w=majority', {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        log("| ".rainbow.bold + "Database connected!".green.underline.bold + "      |".rainbow.bold);
        log(`============================`.rainbow.bold)
    } catch (error) {
        log("Database connect failure!".red.strikethrough.bold);
    }
}
module.exports = {
    connect
};