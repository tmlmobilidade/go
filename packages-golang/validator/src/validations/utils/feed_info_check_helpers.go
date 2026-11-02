package validationutils

import (
	"main/types"
	"testing"
)

func FeedInfoCheckPresence(t *testing.T, field string, check FeedInfoCheck) {
	t.Helper()
	id := "feed_info_" + field + "_field"
	for _, tc := range []struct {
		name     string
		value    any
		missing  bool
		severity types.Severity
		count    int
	}{
		{"MissingColumn", nil, true, types.SEVERITY_ERROR, 1},
		{"Null", nil, false, types.SEVERITY_ERROR, 1},
		{"Empty", "", false, types.SEVERITY_ERROR, 1},
		{"Present", "1", false, types.SEVERITY_ERROR, 0},
		{"ZeroPresent", "0", false, types.SEVERITY_ERROR, 0},
		{"Warning", "", false, types.SEVERITY_WARNING, 1},
		{"Info", "", false, types.SEVERITY_INFO, 1},
		{"Ignore", "", false, types.SEVERITY_IGNORE, 0},
		{"UnspecifiedSeverity", "", false, "", 0},
		{"ForbiddenMissing", "", false, types.SEVERITY_FORBIDDEN, 1},
		{"ForbiddenPresent", "1", false, types.SEVERITY_FORBIDDEN, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{}
			if !tc.missing {
				values[field] = tc.value
			}
			config := FeedInfoConfig(id, tc.severity)
			_, ctx := FeedInfoFixture(t, values, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			FeedInfoAssertFindings(t, id, field, tc.severity, tc.count)
		})
	}
	for name, config := range map[string]*types.GtfsRules{"NilRules": nil, "MissingRule": {}} {
		t.Run(name, func(t *testing.T) {
			_, ctx := FeedInfoFixture(t, map[string]any{field: ""}, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			FeedInfoAssertFindings(t, id, field, types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { FeedInfoAssertReadFailure(t, check, id) })
}

// CheckInvalid verifies severity overrides, default Ignore, and database errors.
func FeedInfoCheckInvalid(t *testing.T, id, field string, check FeedInfoCheck, values map[string]any) {
	t.Helper()
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN, ""} {
		t.Run("Severity/"+string(severity), func(t *testing.T) {
			config := FeedInfoConfig(id, severity)
			_, ctx := FeedInfoFixture(t, values, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			count := 1
			if severity == "" || severity == types.SEVERITY_IGNORE {
				count = 0
			}
			FeedInfoAssertFindings(t, id, field, severity, count)
		})
	}
	for name, config := range map[string]*types.GtfsRules{"NilRules": nil, "MissingRule": {}} {
		t.Run(name, func(t *testing.T) {
			_, ctx := FeedInfoFixture(t, values, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			FeedInfoAssertFindings(t, id, field, types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { FeedInfoAssertReadFailure(t, check, id) })
}
