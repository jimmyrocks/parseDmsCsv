var csv = require('csv');
var fs = require('fs');

module.exports = function (fileName, callback) {
  fs.readFile(fileName, 'utf8', function (e, r) {
    if (e) {
      callback(e);
    } else {
      csv.parse(r, function (err, data) {
        callback(err, data);
      });
    }
  });
};
