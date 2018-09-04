function notFound(res) {
    return sendError(res, 404, 'not found');
}

function sendError(res, code, message) {
    return res.status(code).send({ message });
}

function catchAsyncErrors(fn) {
    return (req, res, next) => {
        const routePromise = fn(req, res, next);
        if (routePromise.catch) {
            routePromise.catch(err => next(err));
        }
    };
}

module.exports = {
    catchAsyncErrors,
    notFound,
};
