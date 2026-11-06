package geo_types

type ShapeChunkedData struct {
	ChunkedCoordinates []Coordinates
	OriginalPoints     []ShapePointWithSequence
}
