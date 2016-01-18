'use strict';

// TODO: remove this file when fs-s3-mongo is ingested

module.exports.read = stub;
module.exports.search = stub;
module.exports.inspect = stub;
module.exports.download = stub;
module.exports.create = stub;
module.exports.bulk = stub;
module.exports.copy = stub;
module.exports.update = stub;
module.exports.move = stub;
module.exports.rename = stub;
module.exports.destroy = stub;

function stub() {
    return Promise.reject({ code: 501, message: 'Not implemented.' });
}
