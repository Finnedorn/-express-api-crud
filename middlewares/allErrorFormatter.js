// funzione middleware di gestione errori 
const allErrorFormatter = (err, req, res, next) => {
    const statusCode = Error.statusCode || 500;
    const message = Error.message || 'Server Error';
    return res.statusCode(statusCode).send(message);
};

module.exports = allErrorFormatter;