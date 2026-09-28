/* * */

/** The admin_level 2 polygon of a country, by ISO 3166-1 alpha-2 code ($2). */
const COUNTRY_WAY = `
	SELECT c.way
	FROM planet_osm_polygon c
	WHERE c.boundary = 'administrative'
		AND c.admin_level = '2'
		AND c.tags->>'ISO3166-1' = $2
	LIMIT 1
`;

/** List locations at a given admin_level ($1) inside a country ($2), without geometry. */
export const FIND_LOCATIONS_BY_COUNTRY_AND_ADMIN_LEVEL = `
SELECT
	abs(p.osm_id) AS id,
	COALESCE(p.tags->>'int_name', p.name) AS name,
	p.admin_level,
	p.tags->>'ref:ine' AS code,
	p.tags
FROM planet_osm_polygon p
WHERE p.boundary = 'administrative'
	AND p.admin_level = $1
	AND p.way && (${COUNTRY_WAY})
	AND ST_Within(p.way, (${COUNTRY_WAY}))
ORDER BY name;
`;

/** List locations at a given admin_level ($1) inside a country ($2), with GeoJSON geometry. */
export const FIND_LOCATIONS_WITH_GEOJSON_BY_COUNTRY_AND_ADMIN_LEVEL = `
SELECT
	abs(p.osm_id) AS id,
	COALESCE(p.tags->>'int_name', p.name) AS name,
	p.admin_level,
	p.tags->>'ref:ine' AS code,
	p.tags,
	json_build_object(
		'type', 'FeatureCollection',
		'features', json_agg(
			json_build_object(
				'type', 'Feature',
				'id', abs(osm_id),
				'properties', json_build_object(
					'name', name,
					'admin_level', admin_level,
					'code', tags->>'ref:ine',
					'tags', tags
				),
				'geometry', ST_AsGeoJSON(
					ST_Transform(way, 4326)
				)::json
			)
		)
	) AS geojson
FROM planet_osm_polygon p
WHERE p.boundary = 'administrative'
	AND p.admin_level = $1
	AND p.way && (${COUNTRY_WAY})
	AND ST_Within(p.way, (${COUNTRY_WAY}))
GROUP BY id, name, admin_level, code, tags;
`;

/** Find administrative locations that cover a WGS84 point ($1 lon, $2 lat). */
export const FIND_LOCATIONS_AT_POINT = `
SELECT
	abs(osm_id) AS id,
	COALESCE(tags->>'int_name', name) AS name,
	admin_level,
	tags->>'ref:ine' AS code,
	tags
FROM planet_osm_polygon
WHERE boundary = 'administrative'
	AND ST_Covers(
		way,
		ST_Transform(
			ST_SetSRID(
				ST_MakePoint($1, $2),
				4326
			),
			ST_SRID(way)
		)
	);
`;

/**
 * Find the nearest `place=locality` point within $3 metres of a WGS84 point ($1 lon, $2 lat).
 * ponytail: `way` is Web Mercator, whose metres stretch by 1/cos(lat); dividing the radius by
 * cos(lat) corrects the cap so the index is still used. Upgrade path: geography cast.
 */
export const FIND_NEAREST_LOCALITY = `
WITH pt AS (
	SELECT ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), Find_SRID('public', 'planet_osm_point', 'way')) AS way
)
SELECT
	abs(p.osm_id) AS id,
	COALESCE(p.tags->>'int_name', p.name) AS name,
	'locality' AS admin_level,
	NULL AS code,
	p.tags
FROM planet_osm_point p, pt
WHERE p.place = 'locality'
	AND p.name IS NOT NULL
	AND ST_DWithin(p.way, pt.way, $3 / cos(radians($2)))
ORDER BY p.way <-> pt.way
LIMIT 1;
`;
