const userAPI = require('./userAPI');
const categoryAPI = require('./categoryAPI');
const productAPI = require('./productAPI');
function route(app) {
    app.use('/user', userAPI);
    app.use('/category', categoryAPI);
    app.use('/product', productAPI);
}
module.exports = route;