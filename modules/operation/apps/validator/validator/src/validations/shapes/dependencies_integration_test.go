package shapes_test

import (
	"main/lib/rules"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	"main/validations/shapes"
	"testing"
)

func TestShapeDAGBlocksOnlyAffectedGroupAndPreservesSourceRows(t *testing.T) {
	services.AppMessageService.Clear()
	data := []map[string]string{
		{"shape_id": "bad", "shape_pt_lat": "100", "shape_pt_lon": "-9", "shape_pt_sequence": "1", "shape_dist_traveled": "1"},
		{"shape_id": "good", "shape_pt_lat": "38", "shape_pt_lon": "-9", "shape_pt_sequence": "1", "shape_dist_traveled": "1"},
		{"shape_id": "bad", "shape_pt_lat": "38.1", "shape_pt_lon": "-9", "shape_pt_sequence": "2", "shape_dist_traveled": "2"},
		{"shape_id": "good", "shape_pt_lat": "38.1", "shape_pt_lon": "-9", "shape_pt_sequence": "2", "shape_dist_traveled": "2"},
	}
	gtfs, cleanup, err := (test_helpers.MockGtfs{TableData: map[string][]map[string]string{"shapes": data}}).ToGtfsWithDB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(cleanup)
	config := rules.DefaultConfig()
	config.Shapes.ShapeId.Severity = types.SEVERITY_ERROR
	config.Shapes.ShapePtLat.Severity = types.SEVERITY_WARNING
	config.Shapes.ShapePtLon.Severity = types.SEVERITY_ERROR
	config.Shapes.ShapePtSequence.Severity = types.SEVERITY_ERROR
	config.Shapes.ShapeDistTraveled.Severity = types.SEVERITY_ERROR
	config.Shapes.ShapeIdAndPointSequenceRequired.Severity = types.SEVERITY_ERROR
	config.Shapes.ShapePtSequenceStrictlyIncreasing.Severity = types.SEVERITY_ERROR
	config.Shapes.ShapePointsCoordinatesDistances.Severity = types.SEVERITY_ERROR
	rules.ConfigureMessageSeverities(&config)
	t.Cleanup(func() { rules.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
	shapes.RunValidations(*gtfs, &config)
	summary := services.AppMessageService.GetSummary()
	if summary.TotalErrors != 1 || summary.TotalWarnings != 1 {
		t.Fatalf("summary: %+v", summary)
	}
	for _, message := range summary.Messages {
		if message.RuleID == "shape_dist_traveled_delta_mismatches_haversine_segment" {
			if len(message.Rows) != 1 || message.Rows[0] != 5 {
				t.Fatalf("group/row leaked: %+v", message)
			}
		}
	}
}
