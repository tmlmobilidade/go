/* * */

/** List locations at a given admin_level, with GeoJSON geometry. */
export const FIND_LOCATIONS_BY_ADMIN_LEVEL = `
SELECT
	abs(osm_id) AS id,
	name,
	admin_level,
	tags->>'ref:ine' AS code,
	tags,
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
FROM planet_osm_polygon
WHERE boundary = 'administrative'
	AND admin_level = $1
GROUP BY id, name, admin_level, code, tags;
`;

/** Find locations that cover a WGS84 point. */
export const FIND_LOCATIONS_AT_POINT = `
SELECT
	abs(osm_id) AS id,
	name,
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
