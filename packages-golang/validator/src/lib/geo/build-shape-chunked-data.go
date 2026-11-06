package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
	"sort"
	"strconv"
)

// BuildShapeChunkedData orders and densifies imported shape coordinates.
func BuildShapeChunkedData(points []types.ShapeCoordinatesValidation) *types.ShapeChunkedData {
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
	origPoints := make([]types.ShapePointWithSequence, 0, len(sorted))
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
		origPoints = append(origPoints, types.ShapePointWithSequence{Sequence: seq, Coordinate: coord})
	}

	// Return nil if no valid points were parsed
	if len(orderedCoordinates) == 0 {
		return nil
	}

	// Densify the shape using ChunkCoordinates (gap-filling interpolation)
	chunked := ChunkCoordinates(orderedCoordinates, variables.ShapeSegmentLengthMeters)

	return &types.ShapeChunkedData{
		ChunkedCoordinates: chunked,
		OriginalPoints:     origPoints,
	}
}
