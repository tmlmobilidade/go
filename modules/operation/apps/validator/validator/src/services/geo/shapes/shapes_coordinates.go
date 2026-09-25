package services

import (
	"math"
	"sort"
	"strconv"

	"main/lib"
	"main/types"
)

const SEGMENT_LENGTH = 50.0 // 50m segments reduce Haversine calls 5x vs 10m while still validating 100m stop distance
const MAX_SHAPE_POINT_DISTANCE_METERS = 1000.0
const SHAPE_DIST_TRAVELED_KILOMETERS_THRESHOLD = 800.0

type shapePointWithSequence struct {
	sequence   int
	coordinate types.Coordinates
}

type ShapeChunkedData struct {
	ChunkedCoordinates []types.Coordinates
	OriginalPoints     []shapePointWithSequence
}

// FindClosestOriginalPoint finds the original shape point in the slice whose coordinates are closest to the provided stopPoint.
// It returns the sequence number, latitude, and longitude of this closest original point.
// This is primarily used to map a chunked/interpolated coordinate back to its source GTFS shape row for generating clear validation messages.
//
// Args:
//
//	stopPoint (types.Coordinates): The stop point to find the closest original point to.
//
// Returns:
//
//	seq (int): The sequence number of the closest original point.
//	lat (float64): The latitude of the closest original point.
//	lon (float64): The longitude of the closest original point.
func (d *ShapeChunkedData) FindClosestOriginalPoint(stopPoint types.Coordinates) (seq int, lat, lon float64) {
	// Initialize minimum distance to the highest possible value.
	minDist := math.MaxFloat64

	// Iterate through each original shape point and find the one closest to stopPoint.
	for _, pt := range d.OriginalPoints {
		dist := lib.HaversineDistance(stopPoint, pt.coordinate)
		if dist < minDist {
			minDist = dist
			seq = pt.sequence
			lat = pt.coordinate.Lat
			lon = pt.coordinate.Lng
		}
	}
	return seq, lat, lon
}

// hasConsecutiveShapeDistanceInconsistency checks if there is a large distance between two consecutive shape coordinates.
// It returns true if the distance between the two points exceeds MAX_SHAPE_POINT_DISTANCE_METERS.
//
// Args:
//
//	orderedCoordinates ([]types.Coordinates): A slice containing exactly two consecutive shape coordinates.
//
// Returns:
//
//	bool: True if the distance between the consecutive coordinates is inconsistent (too large), false otherwise.
func hasConsecutiveShapeDistanceInconsistency(orderedCoordinates []types.Coordinates, maxShapePointDistanceMeters float64) bool {
	if len(orderedCoordinates) != 2 {
		return false
	}

	distanceMeters := lib.HaversineDistance(orderedCoordinates[0], orderedCoordinates[1])
	if distanceMeters > maxShapePointDistanceMeters {
		return true
	}

	return false
}

// ShapePointIsCloseToBeforeShapePoint checks if two consecutive GTFS shape points are "close" to each other,
// as defined by maxShapePointDistanceMeters.
// It returns true if the points are not too far apart, false otherwise.
//
// Args:
//
//	beforeShapePoint (*types.Shape): The previous shape point (must not be nil, and lat/lon fields must not be nil).
//	shapePoint (*types.Shape): The current shape point (must not be nil, and lat/lon fields must not be nil).
//
// Returns:
//
//	bool: True if the distance between the points is less than or equal to maxShapePointDistanceMeters and
//	      the points are not considered to have an inconsistent gap according to hasConsecutiveShapeDistanceInconsistency,
//	      false otherwise.
func ShapePointIsCloseToBeforeShapePoint(beforeShapePoint *types.Shape, shapePoint *types.Shape, maxShapePointDistanceMeters float64) bool {
	// Defensive check for nil pointers and fields
	if shapePoint == nil || beforeShapePoint == nil ||
		shapePoint.ShapePtLat == nil || shapePoint.ShapePtLon == nil ||
		beforeShapePoint.ShapePtLat == nil || beforeShapePoint.ShapePtLon == nil {
		return false
	}

	if maxShapePointDistanceMeters <= 0 {
		maxShapePointDistanceMeters = MAX_SHAPE_POINT_DISTANCE_METERS
	}

	// Convert GTFS shape points to types.Coordinates
	beforeShapePointCoordinate := types.Coordinates{
		Lat: float64(*beforeShapePoint.ShapePtLat),
		Lng: float64(*beforeShapePoint.ShapePtLon),
	}
	shapePointCoordinate := types.Coordinates{
		Lat: float64(*shapePoint.ShapePtLat),
		Lng: float64(*shapePoint.ShapePtLon),
	}

	// Validate there is no excessive jump between consecutive points
	coordinatesToValidate := []types.Coordinates{
		shapePointCoordinate,
		beforeShapePointCoordinate,
	}
	if hasConsecutiveShapeDistanceInconsistency(coordinatesToValidate, maxShapePointDistanceMeters) {
		return false
	}

	// Check if distance between points is within allowed threshold
	distanceMeters := lib.HaversineDistance(shapePointCoordinate, beforeShapePointCoordinate)
	return distanceMeters <= maxShapePointDistanceMeters
}

func ShapeDistTraveledToMeters(value float64, maxInShape float64) float64 {
	if maxInShape < SHAPE_DIST_TRAVELED_KILOMETERS_THRESHOLD {
		return value * 1000 // km to m
	}
	return value // already in meters
}

// BuildShapeChunkedData constructs shape chunk data by sorting points, parsing their coordinates,
// and densifying the shape into regularly spaced segments.
//
// Args:
//
//	points ([]types.ShapeCoordinatesValidation): GTFS shape point records (possibly unsorted).
//
// Returns:
//
//	*ShapeChunkedData:  Pointer to a data struct including the densified chunked coordinates
//	                    and the original points with GTFS sequence number.
//	nil:                If input empty or no valid coordinates parsed.
func BuildShapeChunkedData(points []types.ShapeCoordinatesValidation) *ShapeChunkedData {
	if len(points) == 0 {
		return nil
	}

	// First, sort input by shape_pt_sequence as integer ascending
	sorted := make([]types.ShapeCoordinatesValidation, len(points))
	copy(sorted, points)
	sort.Slice(sorted, func(i, j int) bool {
		seqI, _ := strconv.Atoi(sorted[i].ShapePtSeq)
		seqJ, _ := strconv.Atoi(sorted[j].ShapePtSeq)
		return seqI < seqJ
	})

	// Parse valid coordinates and collect both ordered coordinates and original sequences
	orderedCoordinates := make([]types.Coordinates, 0, len(sorted))
	origPoints := make([]shapePointWithSequence, 0, len(sorted))
	for _, p := range sorted {
		lat, err := strconv.ParseFloat(p.ShapePtLat, 64)
		if err != nil {
			continue // skip invalid latitude
		}
		lon, err := strconv.ParseFloat(p.ShapePtLon, 64)
		if err != nil {
			continue // skip invalid longitude
		}
		seq, _ := strconv.Atoi(p.ShapePtSeq)
		coord := types.Coordinates{Lat: lat, Lng: lon}
		orderedCoordinates = append(orderedCoordinates, coord)
		origPoints = append(origPoints, shapePointWithSequence{sequence: seq, coordinate: coord})
	}

	// Return nil if no valid points were parsed
	if len(orderedCoordinates) == 0 {
		return nil
	}

	// Densify the shape using lib.ChunkCoordinates (gap-filling interpolation)
	chunked := lib.ChunkCoordinates(orderedCoordinates, SEGMENT_LENGTH)

	return &ShapeChunkedData{
		ChunkedCoordinates: chunked,
		OriginalPoints:     origPoints,
	}
}
