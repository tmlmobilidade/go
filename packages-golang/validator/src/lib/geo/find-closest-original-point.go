package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"math"
)

// FindClosestOriginalPoint preserves the source sequence used in diagnostics.
func FindClosestOriginalPoint(d *types.ShapeChunkedData, stopPoint types.Coordinates) (seq int, lat, lon float64) {
	// Initialize minimum distance to the highest possible value.
	minDist := math.MaxFloat64

	// Iterate through each original shape point and find the one closest to stopPoint.
	for _, pt := range d.OriginalPoints {
		dist := HaversineDistance(stopPoint, pt.Coordinate)
		if dist < minDist {
			minDist = dist
			seq = pt.Sequence
			lat = pt.Coordinate.Lat
			lon = pt.Coordinate.Lng
		}
	}
	return seq, lat, lon
}
