package geo

import (
	"math"
	"strconv"
	"strings"
)

const earthRadiusMeters = 6371008.8

type vector [3]float64

// Point represents a geographic location as a unit vector on the sphere.
type Point struct {
	position vector
}

// ParsePoint parses decimal latitude and longitude in degrees.
func ParsePoint(latitude, longitude string) (Point, bool) {
	lat, latErr := strconv.ParseFloat(strings.TrimSpace(latitude), 64)
	lon, lonErr := strconv.ParseFloat(strings.TrimSpace(longitude), 64)
	if latErr != nil || lonErr != nil || math.IsNaN(lat) || math.IsNaN(lon) || math.Abs(lat) > 90 || math.Abs(lon) > 180 {
		return Point{}, false
	}
	sinLat, cosLat := math.Sincos(lat * (math.Pi / 180))
	sinLon, cosLon := math.Sincos(lon * (math.Pi / 180))
	return Point{vector{cosLat * cosLon, cosLat * sinLon, sinLat}}, true
}

// DistanceMeters returns the spherical great-circle distance. The chord
// formulation is equivalent to the haversine formula.
func DistanceMeters(a, b Point) float64 {
	chord := subtract(a.position, b.position)
	return earthRadiusMeters * (2 * math.Asin(min(1, math.Sqrt(dot(chord, chord))/2)))
}

// SegmentDistanceMeters returns the shortest spherical distance from a point
// to the minor great-circle arc connecting two endpoints.
func SegmentDistanceMeters(point, start, end Point) float64 {
	p, a, b := point.position, start.position, end.position
	// Using the endpoint difference keeps the normal accurate for short segments.
	normal := cross(a, subtract(b, a))
	normalLength := math.Sqrt(dot(normal, normal))
	// The projection lies on the arc when it is between the endpoint tangent planes.
	if normalLength > 1e-15 && dot(p, cross(normal, a)) >= 0 && dot(p, cross(b, normal)) >= 0 {
		return earthRadiusMeters * math.Asin(min(1, math.Abs(dot(subtract(p, a), normal))/normalLength))
	}
	return min(DistanceMeters(point, start), DistanceMeters(point, end))
}

// OutsidePolylineBufferMeters returns the nearest segment distance and true
// when every segment is farther away than the radius. It returns zero and
// false as soon as a segment is within range or if the line has no segments.
func OutsidePolylineBufferMeters(point Point, line []Point, radius float64) (float64, bool) {
	if len(line) < 2 {
		return 0, false
	}

	// ponytail: Scan segments once per query. Add a spatial index if this becomes a bottleneck.
	nearest := math.Inf(1)
	for i := 1; i < len(line); i++ {
		meters := SegmentDistanceMeters(point, line[i-1], line[i])
		if meters <= radius {
			return 0, false
		}
		nearest = min(nearest, meters)
	}
	return nearest, true
}

func dot(a, b vector) float64 {
	return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
}

func cross(a, b vector) vector {
	return vector{a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]}
}

func subtract(a, b vector) vector {
	return vector{a[0] - b[0], a[1] - b[1], a[2] - b[2]}
}
