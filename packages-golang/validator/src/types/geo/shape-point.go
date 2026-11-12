package geo_types

type ShapePoint struct {
	ShapeID          string
	Row              int
	Sequence         int
	Coordinates      Coordinates
	ValidCoordinates bool
	Distance         *float64
}
