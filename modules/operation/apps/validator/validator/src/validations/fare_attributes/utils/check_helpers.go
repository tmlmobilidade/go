package fare_attributes_utils

import (
	"main/types"
	"testing"
)

func CheckPresence(t *testing.T, field string, check Check) {
	t.Helper()
	id := "fare_attributes_" + field + "_field"
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
			config := Config(id, tc.severity)
			_, ctx := Fixture(t, values, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			AssertFindings(t, id, field, tc.severity, tc.count)
		})
	}
	for name, config := range map[string]*types.GtfsRules{"NilRules": nil, "MissingRule": {}} {
		t.Run(name, func(t *testing.T) {
			_, ctx := Fixture(t, map[string]any{field: ""}, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			AssertFindings(t, id, field, types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { AssertReadFailure(t, check, id) })
}

// CheckInvalid verifies severity overrides, default Ignore, and database errors.
func CheckInvalid(t *testing.T, id, field string, check Check, values map[string]any) {
	t.Helper()
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN, ""} {
		t.Run("Severity/"+string(severity), func(t *testing.T) {
			config := Config(id, severity)
			_, ctx := Fixture(t, values, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			count := 1
			if severity == "" || severity == types.SEVERITY_IGNORE {
				count = 0
			}
			AssertFindings(t, id, field, severity, count)
		})
	}
	for name, config := range map[string]*types.GtfsRules{"NilRules": nil, "MissingRule": {}} {
		t.Run(name, func(t *testing.T) {
			_, ctx := Fixture(t, values, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			AssertFindings(t, id, field, types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { AssertReadFailure(t, check, id) })
}
