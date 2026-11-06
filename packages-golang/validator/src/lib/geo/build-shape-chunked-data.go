package geo

import (
	"sort"
	"strconv"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
)

/*
* BuildShapeChunkedData prepares one shape for stop-distance checks without
* modifying its input. The caller must group points by shape_id beforehand.
* It returns regularly spaced samples for distance searches and original vertices
* with their source sequences for reports. Empty input or no parsable coordinates
* returns nil. Coordinate ranges and sequence validity are checked by other rules.
 */
func BuildShapeChunkedData(points []types.ShapeCoordinatesValidation) *types.ShapeChunkedData {

	//
	// 1. No source rows means there is no shape geometry to build.

	if len(points) == 0 {
		return nil
	}

	//
	// 2. Sort a copy by numeric shape_pt_sequence (for example, 3 before 20).

	sorted := make([]types.ShapeCoordinatesValidation, len(points))
	copy(sorted, points)
	sort.Slice(sorted, func(i, j int) bool {
		seqI, _ := strconv.Atoi(sorted[i].ShapePtSeq)
		seqJ, _ := strconv.Atoi(sorted[j].ShapePtSeq)
		return seqI < seqJ
	})

	//
	// 3. Parse coordinates in shape order and retain each original sequence.

	orderedCoordinates := make([]types.Coordinates, 0, len(sorted))
	origPoints := make([]types.ShapePointWithSequence, 0, len(sorted))
	for _, p := range sorted {
		lat, err := strconv.ParseFloat(p.ShapePtLat, 64)
		if err != nil {
			continue // This row cannot supply a numeric latitude.
		}
		lon, err := strconv.ParseFloat(p.ShapePtLon, 64)
		if err != nil {
			continue // This row cannot supply a numeric longitude.
		}
		seq, _ := strconv.Atoi(p.ShapePtSeq)
		coord := types.Coordinates{Lat: lat, Lng: lon}
		orderedCoordinates = append(orderedCoordinates, coord)
		origPoints = append(origPoints, types.ShapePointWithSequence{Sequence: seq, Coordinate: coord})
	}

	//
	// 4. Avoid building a shape when every row failed coordinate parsing.

	if len(orderedCoordinates) == 0 {
		return nil
	}

	//
	// 5. Resample at ShapeSegmentLengthMeters (currently 50m) for distance checks.

	chunked := ChunkCoordinates(orderedCoordinates, variables.ShapeSegmentLengthMeters)

	//
	// 6. Keep samples for distance checks and original vertices for reports.

	return &types.ShapeChunkedData{
		ChunkedCoordinates: chunked,
		OriginalPoints:     origPoints,
	}
}
