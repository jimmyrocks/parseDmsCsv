# parseDmsCsv

A quick a dirty project that takes three columns (type, lat, lon)
Where type is point, line, or polygon
lat is one or many latitudes in Degrees Minutes Seconds
lon is one or many longitudes in Degrees Minutes Seconds

If the lat starts with a corner (NE, NW, SE, SW), it will reorder them so that a rectangular polygon can be made with points going in a clockwise order
