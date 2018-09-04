const { Router } = require('express');

const router = Router();
const { catchAsyncErrors } = require('../../utils');
const { db } = require('../../db');

function getMeasurementById(id) {
    console.log(`id ${id}`);
    return db
        .first()
        .from('temperature')
        .where('id', id);
}

function getLatestMeasurement() {
    return db
        .first()
        .from('temperature')
        .orderBy('createdAt', 'desc');
}

router.get(
    '/latest',
    catchAsyncErrors(async (req, res) => {
        const project = await getLatestMeasurement();
        if (project) {
            res.set('Content-Type', 'application/json');
        }
        return res.send(project);
    }),
);

router.post(
    '/',
    catchAsyncErrors(async (req, res) => {
        const data = await db
            .insert(req.body)
            .into('temperature')
            .then(inserted => getMeasurementById(inserted[0]));
        if (data) {
            res.set('Content-Type', 'application/json');
        }
        return res.send(data);
    }),
);

router.post(
    '/webhook',
    catchAsyncErrors(async (req, res) => {
        console.log(JSON.stringify(req.body));

        const [temp, humidity, pressure] = req.body.data.split[';'];
        const createdAt = Date.parse(req.body.published_at);
        const data = await db
            .insert({
                temp1: temp,
                rh1: humidity,
                pressure1: pressure,
                createdAt,
            })
            .into('temperature')
            .then(inserted => getMeasurementById(inserted[0]));
        if (data) {
            res.set('Content-Type', 'application/json');
        }
        return res.send(data);
    }),
);

module.exports = {
    router,
};
