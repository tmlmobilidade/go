package stops

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	shapes "github.com/tmlmobilidade/go/packages-golang/validator/src/services/geo/shapes"
	"main/types"
	"math"
	"math/rand"
	"reflect"
	"strconv"
	"testing"
)

func TestStopShapeDistanceViolationMatchesFullScan(t *testing.T) {
	data := shapes.BuildShapeChunkedData([]types.ShapeCoordinatesValidation{
		{ShapePtSeq: "2", ShapePtLat: "38.71", ShapePtLon: "-9.11"},
		{ShapePtSeq: "1", ShapePtLat: "38.7", ShapePtLon: "-9.1"},
		{ShapePtSeq: "3", ShapePtLat: "38.72", ShapePtLon: "-9.1"},
	})
	random := rand.New(rand.NewSource(42))
	for i := 0; i < 300; i++ {
		point := types.Coordinates{Lat: 38.695 + random.Float64()*0.03, Lng: -9.115 + random.Float64()*0.02}
		stop := types.StopCoordinatesValidation{StopId: "stop", StopLat: strconv.FormatFloat(point.Lat, 'g', -1, 64), StopLon: strconv.FormatFloat(point.Lng, 'g', -1, 64)}
		minimum := math.Inf(1)
		for _, coordinate := range data.ChunkedCoordinates {
			minimum = math.Min(minimum, lib.HaversineDistance(point, coordinate))
		}
		var want *types.StopClosestShapePointsInfo
		if minimum > 100 {
			seq, lat, lon := data.FindClosestOriginalPoint(point)
			want = &types.StopClosestShapePointsInfo{ShapeID: "shape", DistanceMeters: minimum, ClosestShapePtSeq: seq, ClosestShapePtLat: lat, ClosestShapePtLon: lon}
		}
		if got := StopShapeDistanceViolation(stop, "shape", data); !reflect.DeepEqual(got, want) {
			t.Fatalf("point %+v: got %+v, want %+v", point, got, want)
		}
	}
}

func TestStopShapeDistanceViolationBoundaryAndInvalidInput(t *testing.T) {
	data := shapes.BuildShapeChunkedData([]types.ShapeCoordinatesValidation{{ShapePtSeq: "7", ShapePtLat: "0", ShapePtLon: "0"}})
	for _, distance := range []float64{0, 99.999, 100, 100.001} {
		lat := distance / lib.EARTH_RADIUS_METERS * 180 / math.Pi
		stop := types.StopCoordinatesValidation{StopId: "stop", StopLat: strconv.FormatFloat(lat, 'g', -1, 64), StopLon: "0"}
		got := StopShapeDistanceViolation(stop, "shape", data)
		if (got != nil) != (distance > 100) {
			t.Fatalf("distance %v: got %+v", distance, got)
		}
	}
	for _, stop := range []types.StopCoordinatesValidation{
		{StopLat: "1", StopLon: "1"}, {StopId: "stop", StopLat: "invalid", StopLon: "0"},
		{StopId: "stop", StopLat: "0", StopLon: "invalid"}, {StopId: "stop", StopLat: "NaN", StopLon: "0"},
	} {
		if got := StopShapeDistanceViolation(stop, "shape", data); got != nil {
			t.Fatalf("invalid stop %+v: %+v", stop, got)
		}
	}
	stop := types.StopCoordinatesValidation{StopId: "stop", StopLat: "1", StopLon: "1"}
	for _, shape := range []*shapes.ShapeChunkedData{nil, {}} {
		if got := StopShapeDistanceViolation(stop, "shape", shape); got != nil {
			t.Fatalf("empty shape: %+v", got)
		}
	}
}
