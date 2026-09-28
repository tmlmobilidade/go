/* * */

/** List locations at a given admin_level, with GeoJSON geometry. */
export const FIND_LOCATIONS_BY_COUNTRY_AND_ADMIN_LEVEL = `
SELECT
    abs(p.osm_id) AS id,
    p.name,
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
  AND p.way && (
      SELECT c.way
      FROM planet_osm_polygon c
      WHERE c.boundary = 'administrative'
        AND c.admin_level = '2'
        AND c.tags->>'ISO3166-1' = $2
      LIMIT 1
  )
  AND ST_Within(
      p.way,
      (
          SELECT c.way
          FROM planet_osm_polygon c
          WHERE c.boundary = 'administrative'
            AND c.admin_level = '2'
            AND c.tags->>'ISO3166-1' = $2
          LIMIT 1
      )
  )
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
