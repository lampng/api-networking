const userAPI = require('./userAPI');
const postAPI = require('./postAPI');

function route(app) {
    app.use('/user', userAPI);
    app.use('/post', postAPI);
}
module.exports = route;