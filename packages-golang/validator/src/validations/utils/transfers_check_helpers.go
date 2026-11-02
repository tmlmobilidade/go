package validationutils

import (
	"main/types"
	"strings"
	"testing"
)

func TransfersCheckPresence(t *testing.T, field string, check TransfersCheck) {
	t.Helper()
	id := "transfers_" + field + "_field"
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
			if strings.HasSuffix(field, "stop_id") {
				values["transfer_type"] = "2"
			}
			if !tc.missing {
				values[field] = tc.value
			}
			config := TransfersConfig(id, tc.severity)
			_, ctx := TransfersFixture(t, values, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			TransfersAssertFindings(t, id, field, tc.severity, tc.count)
		})
	}
	for name, config := range map[string]*types.GtfsRules{"NilRules": nil, "MissingRule": {}} {
		t.Run(name, func(t *testing.T) {
			_, ctx := TransfersFixture(t, map[string]any{field: ""}, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			TransfersAssertFindings(t, id, field, types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { TransfersAssertReadFailure(t, check, id) })
}

// CheckInvalid verifies severity overrides, default Ignore, and database errors.
func TransfersCheckInvalid(t *testing.T, id, field string, check TransfersCheck, values map[string]any) {
	t.Helper()
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN, ""} {
		t.Run("Severity/"+string(severity), func(t *testing.T) {
			config := TransfersConfig(id, severity)
			_, ctx := TransfersFixture(t, values, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			count := 1
			if severity == "" || severity == types.SEVERITY_IGNORE {
				count = 0
			}
			TransfersAssertFindings(t, id, field, severity, count)
		})
	}
	for name, config := range map[string]*types.GtfsRules{"NilRules": nil, "MissingRule": {}} {
		t.Run(name, func(t *testing.T) {
			_, ctx := TransfersFixture(t, values, config)
			if err := check(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			TransfersAssertFindings(t, id, field, types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { TransfersAssertReadFailure(t, check, id) })
}
