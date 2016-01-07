var readCsv = require('./readCsv');
var dms2deg = require('./dms2deg');

readCsv('./larned.csv', function (e, r) {
  var cleaned = r.map(clean);
  var collection = {
    'type': 'FeatureCollection',
    'features': cleaned.filter(function (r, i) {
      return i > 0;
    }).map(function (row, index) {
      var properties = {};
      var geometry = {};
      var whitelist = ['eq_1', 'eq_2', 'location', 'pdop', 'haf'];
      row.forEach(function (column, i) {
        var columnName = cleaned[0][i].toString();
        if (whitelist.indexOf(columnName.toLowerCase()) > -1) {
          properties[columnName] = column;
        }
        if (columnName === '[object Object]') {
          geometry = column;
        }
      });
      return {
        'type': 'Feature',
        'properties': properties,
        'geometry': geometry
      };
    })
  };
  console.log(JSON.stringify(collection, null, 2));
});

var arrayify = function (obj) {
  var returnArray = [];
  for (var index = 0; index < Object.keys(obj).length; index++) {
    returnArray.push(obj[index]);
  }
  return returnArray;
};

var removeNewLines = function (d) {
  // new line to semicolon
  return d.replace(/\n/g, ';').split(';').filter(function (r, i, a) {
    return a.indexOf(r) === i;
  }).join(';');
};

var readDms = function (d) {
  var re = new RegExp('^[NS][EW]', 'g');
  return removeNewLines(d).split(';').map(function (s) {
    return s.replace(re, '');
  }).map(dms2deg);
};

var clean = function (d, i, a) {
  var geog = {};
  var order = ['NW', 'NE', 'SE', 'SW'];
  var newOrder = [];
  var type = 'point';
  var firstPass = d.map(function (c, ci) {
    var columnName = a[0][ci];
    var returnValue = removeNewLines(c);
    if (['lat', 'lon'].indexOf(columnName.toLowerCase()) > -1) {
      readDms(returnValue).forEach(function (g, i) {
        geog[i] = geog[i] || {};
        geog[i][columnName.toLowerCase()] = g;
      });

      // Sometimes we need to reorder these things
      removeNewLines(returnValue).split(';').forEach(function (r) {
        if (r.match(/^[NS][EW]/g)) {
          newOrder.push(order.indexOf(r.substr(0, 2)));
        }
      });
    }
    if (columnName.toLowerCase() === 'type') {
      type = returnValue;
    }
    return returnValue;
  });

  if (newOrder.length > 0) {
    geog = newOrder.map(function (r) {
      return geog[r];
    });
  }

  firstPass.push(arrayToJsonGeom(arrayify(geog), type));

  return firstPass;
};

var arrayToJsonGeom = function (array, type) {
  var types = {
    'point': function (a) {
      return {
        'type': 'Point',
        'coordinates': [a[0].lon, a[0].lat]
      };
    },
    'line': function (a) {
      return {
        'type': 'LineString',
        'coordinates': a.map(function (x) {
          return [x.lon, x.lat];
        })

      };
    },
    'polygon': function (a) {
      // Duplicate the array and add the last point as the first
      var b = JSON.parse(JSON.stringify(a));
      b.push(b[0]);
      return {
        'type': 'Polygon',
        'coordinates': [b.map(function (x) {
          return [x.lon, x.lat];
        })]
      };
    }
  };
  return types[type] ? types[type](array) : {};
};
