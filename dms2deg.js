module.exports = dms2deg = function (input) {
  // examples
  // 38°11’17.02”N

  // First, lets get rid of smart quotes
  var replacers = [
    ['“', '"'],
    ['”', '"'],
    ['‘', "'"],
    ['’', "'"],
    ['`', "'"]
  ];
  replacers.forEach(function (replacer) {
    var re = new RegExp(replacer[0], 'g');
    input = input.replace(re, replacer[1]);
  });

  var extract = function (delim, i) {
    var re = new RegExp('[\\d.-]{1,}$', 'g');
    var returnValue = 0;
    try {
      returnValue = parseFloat(i.split(delim)[0].match(re)[0], 10);
    } catch (e) {
      // console.log('Had trouble with the ' + delim + ' delimiter');
    }
    return returnValue;
  };

  var extractors = {
    'degrees': '°',
    'minutes': "'",
    'seconds': '"'
  };

  var coord = {};
  for (var e in extractors) {
    coord[e] = extract(extractors[e], input);
  }

  // Figure out if we need a negative
  var flipped = false;
  var flippers = ['S', 's', 'W', 'w'];
  flippers.forEach(function (n) {
    if (input.indexOf(n) > -1 && !flipped) {
      flipped = true;
    }
  });

  // convert coord to degrees
  var deg = (coord.degrees + (coord.minutes / 60) + (coord.seconds / 3600)) * (flipped ? -1 : 1);
  return deg;
};
