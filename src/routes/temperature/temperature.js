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

        const [
            temp1,
            rh1,
            pressure1,
            temp2,
            rh2,
            pressure2,
            temp3,
            rh3,
            pressure3,
        ] = req.body.data.split(';');
        if (!isNaN(temp1)) {
            const createdAt = new Date(req.body.published_at);
            const data = await db
                .returning('id')
                .insert({
                    temp1,
                    rh1,
                    pressure1,
                    temp2,
                    rh2,
                    pressure2,
                    temp3,
                    rh3,
                    pressure3,
                    createdAt,
                })
                .into('temperature')
                .then(inserted => getMeasurementById(inserted[0]));
            if (data) {
                res.set('Content-Type', 'application/json');
            }
            return res.send(data);
        } else {
            return res.send('no data');
        }
    }),
);

module.exports = {
    router,
};
