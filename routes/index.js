const apiRouter = require('./api');
function route(app) {
    app.use('/user', apiRouter);
}
module.exports = route;