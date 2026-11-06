package geo

import (
	"math"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/geo"
)

/*
* FindClosestOriginalPoint returns the sequence, latitude, and longitude of the
* original shape vertex nearest to stopPoint. Coordinates are returned in degrees.
* Reports use this vertex to identify a real input row rather than an interpolated
* sample. It may differ from the nearest sample used to measure the stop's distance.
* d must be non-nil. No original points yields zero values; ties keep the first point.
 */
func FindClosestOriginalPoint(d *types.ShapeChunkedData, stopPoint types.Coordinates) (seq int, lat, lon float64) {
	//

	//
	// 1. Start above any expected geographic distance so the first point can win.

	minDist := math.MaxFloat64

	//
	// 2. Compare the stop directly with each original vertex, using meters.

	for _, pt := range d.OriginalPoints {
		dist := HaversineDistance(stopPoint, pt.Coordinate)

		//
		// 3. Replace the result only for a strictly closer vertex. Keeping its
		// source sequence and coordinates together makes the report traceable.

		if dist < minDist {
			minDist = dist
			seq = pt.Sequence
			lat = pt.Coordinate.Lat
			lon = pt.Coordinate.Lng
		}
	}

	//
	// 4. Named return values remain zero when there were no original points.

	return seq, lat, lon
}
