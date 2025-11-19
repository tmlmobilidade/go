Location Types Definition

This file defines two distinct type categories:

1.	DATABASE TYPES: These maintain the complete GeoJSON Feature structure with geometry
	and properties nested within the Feature object. This structure is optimized for
	MongoDB's spatial indexing and querying capabilities, allowing for efficient
	geospatial operations directly on the database.

2.	CODEBASE TYPES: These flatten the GeoJSON structure by extracting properties to the
	top level and moving the complete Feature to a separate 'geojson' field. This makes
	them much easier to work with in application code since you can directly access
	properties like location.name instead of location.properties.name.