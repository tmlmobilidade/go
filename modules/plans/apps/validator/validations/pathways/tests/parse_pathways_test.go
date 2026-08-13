package pathways_tests

import (
	"testing"

	"main/types"
	pathways "main/validations/pathways/validations"
)

func TestParsePathways_ValidAndInvalidValues(t *testing.T) {

	t.Run("valid values", func(t *testing.T) {
		raw := types.PathwaysRaw{
			FromStopId:      "STOP1",
			ToStopId:        "STOP2",
			PathwayId:       "P1",
			PathwayMode:     "1",
			IsBidirectional: "1",
			TraversalTime:   "120",
			Length:          "15.5",
			StairCount:      "10",
		}

		result := pathways.ParsePathways(raw, 1)

		if result.FromStopId == nil || *result.FromStopId != "STOP1" {
			t.Errorf("expected FromStopId=STOP1, got %+v", result.FromStopId)
		}

		if result.PathwayMode == nil || *result.PathwayMode != 1 {
			t.Errorf("expected PathwayMode=1, got %+v", result.PathwayMode)
		}

		if result.Length == nil || *result.Length != 15.5 {
			t.Errorf("expected Length=15.5, got %+v", result.Length)
		}

		if result.StairCount == nil || *result.StairCount != 10 {
			t.Errorf("expected StairCount=10, got %+v", result.StairCount)
		}
	})

	t.Run("invalid values", func(t *testing.T) {
		raw := types.PathwaysRaw{
			FromStopId:      "STOP1",
			ToStopId:        "STOP2",
			PathwayId:       "P1",
			PathwayMode:     "invalid", // invalid int
			IsBidirectional: "1",
		}

		result := pathways.ParsePathways(raw, 1)

		// Because there is a parsing error,
		// the function must return an empty Pathways struct
		if result.FromStopId != nil ||
			result.ToStopId != nil ||
			result.PathwayId != nil ||
			result.PathwayMode != nil {
			t.Errorf("expected empty Pathways due to parse error, got %+v", result)
		}
	})
}
