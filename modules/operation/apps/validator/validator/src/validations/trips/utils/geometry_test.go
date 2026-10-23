package trips_utils

import (
	"main/types"
	"testing"
)

func TestGeometryCachesValidInvalidAndMissingPairs(t *testing.T) {
	db, ctx := Fixture(t, map[string]any{"trip_id": "T1"}, nil)
	geometry := &Geometry{}
	stops := []types.StopCoordinatesValidation{
		{StopId: "on", StopLat: "38.7", StopLon: "-9.1"},
		{StopId: "off", StopLat: "40", StopLon: "-9.1"},
	}
	var results []*types.StopClosestShapePointsInfo
	for _, stop := range stops {
		info, err := geometry.Distance(ctx, stop, "R1_0")
		if err != nil {
			t.Fatal(err)
		}
		results = append(results, info)
	}
	if results[0] != nil || results[1] == nil {
		t.Fatalf("unexpected pair results: %+v", results)
	}
	missing, err := geometry.Distance(ctx, stops[1], "missing")
	if err != nil || missing != nil {
		t.Fatalf("missing shape: %+v, %v", missing, err)
	}
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	// Both successful checks and violations must be served from the pair cache.
	for i, stop := range stops {
		info, err := geometry.Distance(ctx, stop, "R1_0")
		if err != nil || info != results[i] {
			t.Fatalf("cached pair: %+v, %v", info, err)
		}
	}
	if info, err := geometry.Distance(ctx, stops[1], "missing"); err != nil || info != nil {
		t.Fatalf("cached missing shape: %+v, %v", info, err)
	}
	// A new stop can reuse the cached shape even when its pair was not yet seen.
	newStop := stops[1]
	newStop.StopId = "new"
	if info, err := geometry.Distance(ctx, newStop, "R1_0"); err != nil || info == nil {
		t.Fatalf("cached shape: %+v, %v", info, err)
	}
	if _, err := geometry.Distance(ctx, newStop, "uncached"); err == nil {
		t.Fatal("uncached shape swallowed database error")
	}
}
