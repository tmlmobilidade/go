package shapes

import (
	"math"
	"strconv"
	"strings"
	"testing"

	"main/i18n"
	"main/lib"
	ruleset "main/lib/rules/rules"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	shapeRunner "main/validations/shapes"
	validations "main/validations/shapes/validations"
)

const spacingRuleID = "shape_sequence_position_mismatches_cumulative_traveled_distance"
const segmentRuleID = "shape_dist_traveled_delta_mismatches_haversine_segment"

func geometryFixture() []types.Shape {
	return []types.Shape{
		{Row: lib.Ptr(10), ShapeId: lib.Ptr("shape-a"), ShapePtSequence: lib.Ptr(0), ShapePtLat: lib.Ptr(38.0), ShapePtLon: lib.Ptr(-9.0), ShapeDistTraveled: lib.Ptr(0.0)},
		{Row: lib.Ptr(20), ShapeId: lib.Ptr("shape-a"), ShapePtSequence: lib.Ptr(7), ShapePtLat: lib.Ptr(38.02), ShapePtLon: lib.Ptr(-9.0), ShapeDistTraveled: lib.Ptr(0.5)},
	}
}

func TestShapeGeometryInputs(t *testing.T) {
	checks := []struct {
		id    string
		run   func([]types.Shape, *types.ShapesRules)
		field string
	}{
		{spacingRuleID, validations.ShapePointsCoordinatesConsistentValidation, "shape_pt_sequence"},
		{segmentRuleID, validations.ShapePointsCoordinatesDistancesValidation, "shape_dist_traveled"},
	}
	for _, check := range checks {
		t.Run(check.id, func(t *testing.T) {
			if len(check.id) > 64 {
				t.Fatal("rule ID exceeds 64 characters")
			}
			config := &types.ShapesRules{
				ShapePointsCoordinatesConsistent: types.RuleConfig{Severity: types.SEVERITY_WARNING},
				ShapePointsCoordinatesDistances:  types.RuleConfig{Severity: types.SEVERITY_WARNING},
			}
			cases := []struct {
				name   string
				mutate func([]types.Shape) []types.Shape
				want   int
			}{
				{"first segment from zero", func(s []types.Shape) []types.Shape { return s }, 1},
				{"unsorted input and nonconsecutive sequences", func(s []types.Shape) []types.Shape { return []types.Shape{s[1], s[0]} }, 1},
				{"duplicate zero sequence", func(s []types.Shape) []types.Shape { s[1].ShapePtSequence = lib.Ptr(0); return s }, 0},
				{"missing sequence", func(s []types.Shape) []types.Shape { s[0].ShapePtSequence = nil; return s }, 0},
				{"negative sequence", func(s []types.Shape) []types.Shape { s[0].ShapePtSequence = lib.Ptr(-1); return s }, 0},
				{"separate shapes", func(s []types.Shape) []types.Shape { s[1].ShapeId = lib.Ptr("shape-b"); return s }, 0},
				{"missing coordinate barrier", func(s []types.Shape) []types.Shape {
					middle := s[0]
					middle.ShapePtSequence = lib.Ptr(3)
					middle.ShapePtLat = nil
					return []types.Shape{s[0], middle, s[1]}
				}, 0},
				{"nonfinite coordinate barrier", func(s []types.Shape) []types.Shape {
					middle := s[0]
					middle.ShapePtSequence = lib.Ptr(3)
					middle.ShapePtLat = lib.Ptr(math.NaN())
					return []types.Shape{s[0], middle, s[1]}
				}, 0},
				{"out of range coordinate", func(s []types.Shape) []types.Shape { s[1].ShapePtLon = lib.Ptr(181.0); return s }, 0},
			}
			for _, tc := range cases {
				t.Run(tc.name, func(t *testing.T) {
					services.AppMessageService.Clear()
					check.run(tc.mutate(geometryFixture()), config)
					messages := services.AppMessageService.GetSummary().AllMessages()
					if len(messages) != tc.want {
						t.Fatalf("got %d messages, want %d: %+v", len(messages), tc.want, messages)
					}
					for _, message := range messages {
						if message.RuleID != check.id || message.Field != check.field || message.Severity != types.SEVERITY_WARNING || len(message.Rows) != 1 || message.Rows[0] != 22 {
							t.Fatalf("incorrect diagnostic: %+v", message)
						}
					}
				})
			}
			for _, config := range []*types.ShapesRules{nil, {}, {ShapePointsCoordinatesConsistent: types.RuleConfig{Severity: types.SEVERITY_IGNORE}, ShapePointsCoordinatesDistances: types.RuleConfig{Severity: types.SEVERITY_IGNORE}}} {
				services.AppMessageService.Clear()
				check.run(geometryFixture(), config)
				if len(services.AppMessageService.GetSummary().AllMessages()) != 0 {
					t.Fatal("disabled check emitted a message")
				}
			}
		})
	}
}

func TestShapeGeometryToleranceAndUnits(t *testing.T) {
	for _, option := range []string{"NaN", "+Inf", "-Inf", "invalid", "-1"} {
		t.Run("invalid tolerance "+option, func(t *testing.T) {
			config := &types.ShapesRules{
				ShapePointsCoordinatesConsistent: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: lib.Ptr([]string{option})},
				ShapePointsCoordinatesDistances:  types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: lib.Ptr([]string{option})},
			}
			services.AppMessageService.Clear()
			validations.ShapePointsCoordinatesConsistentValidation(geometryFixture(), config)
			validations.ShapePointsCoordinatesDistancesValidation(geometryFixture(), config)
			if got := services.AppMessageService.GetSummary().TotalErrors; got != 2 {
				t.Fatalf("invalid tolerance bypassed validation: %d errors", got)
			}
		})
	}
	t.Run("spacing limit includes its boundary", func(t *testing.T) {
		points := geometryFixture()
		distance := lib.HaversineDistance(types.Coordinates{Lat: 38, Lng: -9}, types.Coordinates{Lat: 38.02, Lng: -9})
		services.AppMessageService.Clear()
		validations.ShapePointsCoordinatesConsistentValidation(points, &types.ShapesRules{ShapePointsCoordinatesConsistent: types.RuleConfig{
			Severity: types.SEVERITY_ERROR, Options: lib.Ptr([]string{strconv.FormatFloat(distance, 'g', -1, 64)}),
		}})
		if len(services.AppMessageService.GetSummary().AllMessages()) != 0 {
			t.Fatal("exact boundary rejected")
		}
	})
	for _, unit := range []string{"m", "km"} {
		t.Run("explicit "+unit, func(t *testing.T) {
			points := shapeDistancesSegmentShapes(0)
			if unit == "m" {
				for i := range points {
					points[i].ShapeDistTraveled = lib.Ptr(*points[i].ShapeDistTraveled * 1000)
				}
			}
			services.AppMessageService.Clear()
			validations.ShapePointsCoordinatesDistancesValidation(points, &types.ShapesRules{ShapePointsCoordinatesDistances: types.RuleConfig{
				Severity: types.SEVERITY_ERROR, Options: lib.Ptr([]string{"0", unit}),
			}})
			if got := services.AppMessageService.GetSummary(); len(got.AllMessages()) != 0 {
				t.Fatalf("correct %s distances rejected: %+v", unit, got)
			}
		})
	}
	for _, distance := range []float64{math.NaN(), math.Inf(1), -1} {
		points := geometryFixture()
		points[1].ShapeDistTraveled = lib.Ptr(distance)
		services.AppMessageService.Clear()
		validations.ShapePointsCoordinatesDistancesValidation(points, &types.ShapesRules{ShapePointsCoordinatesDistances: types.RuleConfig{Severity: types.SEVERITY_ERROR}})
		if len(services.AppMessageService.GetSummary().AllMessages()) != 0 {
			t.Fatal("invalid distance produced a geometric diagnostic")
		}
	}
}

func TestShapeGeometryMessagesRenderInBothLanguages(t *testing.T) {
	previous := i18n.AppTranslator
	t.Cleanup(func() { i18n.AppTranslator = previous; services.AppMessageService.Clear() })
	for _, language := range []string{"en", "pt"} {
		i18n.AppTranslator = i18n.NewTranslator(language)
		services.AppMessageService.Clear()
		config := &types.ShapesRules{ShapePointsCoordinatesConsistent: types.RuleConfig{Severity: types.SEVERITY_ERROR}, ShapePointsCoordinatesDistances: types.RuleConfig{Severity: types.SEVERITY_ERROR}}
		validations.ShapePointsCoordinatesConsistentValidation(geometryFixture(), config)
		validations.ShapePointsCoordinatesDistancesValidation(geometryFixture(), config)
		messages := services.AppMessageService.GetSummary().AllMessages()
		if len(messages) != 2 {
			t.Fatalf("%s: expected two diagnostics", language)
		}
		for _, message := range messages {
			if strings.Contains(message.Message, "%!") || !strings.Contains(message.Message, "shape-a") {
				t.Fatalf("%s: invalid message: %s", language, message.Message)
			}
			limit := "1000.00"
			if message.RuleID == segmentRuleID {
				limit = "20.00"
			}
			if !strings.Contains(message.Message, limit) {
				t.Fatalf("%s: missing limit: %s", language, message.Message)
			}
		}
	}
}

func TestShapeSpacingRunsWithoutRecordedDistances(t *testing.T) {
	services.AppMessageService.Clear()
	gtfs, cleanup, err := (test_helpers.MockGtfs{TableData: map[string][]map[string]string{"shapes": {
		{"shape_id": "S1", "shape_pt_lat": "38", "shape_pt_lon": "-9", "shape_pt_sequence": "0"},
		{"shape_id": "S1", "shape_pt_lat": "38.02", "shape_pt_lon": "-9", "shape_pt_sequence": "7"},
	}}}).ToGtfsWithDB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(cleanup)
	config := ruleset.DefaultConfig()
	for _, rule := range []*types.RuleConfig{&config.Shapes.ShapeId, &config.Shapes.ShapePtLat, &config.Shapes.ShapePtLon, &config.Shapes.ShapePtSequence, &config.Shapes.ShapeIdAndPointSequenceRequired, &config.Shapes.ShapePtSequenceStrictlyIncreasing, &config.Shapes.ShapePointsCoordinatesConsistent} {
		rule.Severity = types.SEVERITY_ERROR
	}
	ruleset.ConfigureMessageSeverities(&config)
	t.Cleanup(func() { ruleset.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
	shapeRunner.RunValidations(*gtfs, &config)
	messages := services.AppMessageService.GetSummary().AllMessages()
	if len(messages) != 1 || messages[0].RuleID != spacingRuleID || len(messages[0].Rows) != 1 || messages[0].Rows[0] != 3 {
		t.Fatalf("spacing check was blocked by optional distances: %+v", messages)
	}
}
