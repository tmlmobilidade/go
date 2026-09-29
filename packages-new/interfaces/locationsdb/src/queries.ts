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

/**
 * Find the administrative locations that cover a WGS84 point ($1 lon, $2 lat), plus the nearest
 * `place=locality` point within $3 metres (returned with `admin_level = 'locality'`), in one round-trip.
 * The point is transformed once, up front, so both spatial predicates can use the `way` indexes.
 * ponytail: `way` is Web Mercator, whose metres stretch by 1/cos(lat); dividing the radius by
 * cos(lat) corrects the cap while keeping the index usable. Upgrade path: geography cast.
 */
export const FIND_LOCATIONS_AT_POINT = `
WITH pt AS (
	SELECT ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), Find_SRID('public', 'planet_osm_polygon', 'way')) AS way
)
SELECT
	abs(p.osm_id) AS id,
	COALESCE(p.tags->>'int_name', p.name) AS name,
	p.admin_level,
	p.tags->>'ref:ine' AS code,
	p.tags
FROM planet_osm_polygon p, pt
WHERE p.boundary = 'administrative'
	AND ST_Covers(p.way, pt.way)
UNION ALL
(
	SELECT
		abs(p.osm_id),
		COALESCE(p.tags->>'int_name', p.name),
		'locality',
		NULL,
		p.tags
	FROM planet_osm_point p, pt
	WHERE p.place = 'locality'
		AND p.name IS NOT NULL
		AND ST_DWithin(p.way, pt.way, $3 / cos(radians($2)))
	ORDER BY p.way <-> pt.way
	LIMIT 1
);
`;
