/* * */

/**
 * Represents a shape in the GTFS format.
 * A shape is a sequence of points that defines the path of a transit vehicle.
 * It is used to represent the physical route that a vehicle follows, including
 * the latitude and longitude of each point, the sequence of the points, and
 * the distance traveled along the shape.
 */
export interface GTFS_Shape {
	shape_dist_traveled: number
	shape_id: string
	shape_pt_lat: number
	shape_pt_lon: number
	shape_pt_sequence: number
}

/**
 * Represents a raw shape in the GTFS format.
 * This interface is used to parse raw data from GTFS files,
 * where fields may be optional or represented as strings.
 * It is typically used for data ingestion before validation
 * and transformation into the `GTFS_Shape` format.
 */
export interface GTFS_Shape_Raw {
	shape_dist_traveled?: string
	shape_id: string
	shape_pt_lat?: string
	shape_pt_lon?: string
	shape_pt_sequence?: string
}

/**
 * Validates and transforms a raw GTFS Shape into the GTFS_Shape format.
 * This function checks the types of fields, converts boolean strings to boolean values,
 * and ensures that required fields are present.
 * @param rawData The raw Shape data to validate and transform.
 * @returns A validated GTFS_Shape object.
 */
export function validateGtfsShape(rawData: GTFS_Shape_Raw): GTFS_Shape {
	// Ensure required fields are present
	if (!rawData.shape_dist_traveled) throw new Error('Missing required field "shape_dist_traveled" on GTFS Shape.');
	if (!rawData.shape_id) throw new Error('Missing required field "shape_id" on GTFS Shape.');
	if (!rawData.shape_pt_lat) throw new Error('Missing required field "shape_pt_lat" on GTFS Shape.');
	if (!rawData.shape_pt_lon) throw new Error('Missing required field "shape_pt_lon" on GTFS Shape.');
	if (!rawData.shape_pt_sequence) throw new Error('Missing required field "shape_pt_sequence" on GTFS Shape.');
	// Validate the individual fields
	if (Number.isNaN(rawData.shape_dist_traveled)) throw new Error(`Invalid value for "shape_dist_traveled": "${rawData.shape_dist_traveled}". It must be a number.`);
	if (Number.isNaN(rawData.shape_pt_lat)) throw new Error(`Invalid value for "shape_pt_lat": "${rawData.shape_pt_lat}". It must be a number.`);
	if (Number.isNaN(rawData.shape_pt_lon)) throw new Error(`Invalid value for "shape_pt_lon": "${rawData.shape_pt_lon}". It must be a number.`);
	if (Number.isNaN(rawData.shape_pt_sequence)) throw new Error(`Invalid value for "shape_pt_sequence": "${rawData.shape_pt_sequence}". It must be a number.`);
	// Transform the raw data into the output format
	return {
		shape_dist_traveled: Number(rawData.shape_dist_traveled),
		shape_id: rawData.shape_id,
		shape_pt_lat: Number(rawData.shape_pt_lat),
		shape_pt_lon: Number(rawData.shape_pt_lon),
		shape_pt_sequence: Number(rawData.shape_pt_sequence),
	};
}
