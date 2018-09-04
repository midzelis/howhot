const { Router } = require('express');
const bodyParser = require('body-parser');

const { isProduction, isTest } = require('../config');
const { notFound } = require('../utils');
const { router: temperatureRouter } = require('./temperature/temperature');

const router = Router();

router.use(bodyParser.json());

router.use('/temperature', temperatureRouter);

router.use((req, res) => {
    return notFound(res);
});

router.use((err, req, res) => {
    if (!isTest) {
        console.error(err.stack);
    }

    const status = err.status || 500;
    const message = err.message || 'Something went wrong!';

    const response = { message };
    if (!isProduction) {
        response.stack = err.stack;
    }

    res.status(status).send(response);
});

module.exports = { router };
