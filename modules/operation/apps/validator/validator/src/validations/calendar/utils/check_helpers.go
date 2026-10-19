package calendar_testutils

import (
	"main/types"
	"testing"
)

func CheckPresence(t *testing.T, field string, check Check) {
	t.Helper()
	id := "calendar_" + field + "_field"
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
		{"ForbiddenMissing", "", false, types.SEVERITY_FORBIDDEN, 0},
	} {
		t.Run(tc.name, func(t *testing.T) {
			values := map[string]any{}
			if !tc.missing {
				values[field] = tc.value
			}
			config := Config(id, tc.severity)
			_, ctx := Fixture(t, values, config)
			if err := check(ctx, config); err != nil {
				t.Fatal(err)
			}
			AssertFindings(t, id, field, tc.severity, tc.count)
		})
	}
	for name, config := range map[string]*types.CalendarRules{"NilRules": nil, "MissingRule": {}} {
		t.Run(name, func(t *testing.T) {
			_, ctx := Fixture(t, map[string]any{field: ""}, config)
			if err := check(ctx, config); err != nil {
				t.Fatal(err)
			}
			AssertFindings(t, id, field, types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { AssertReadFailure(t, check, id) })
}

func CheckWeekday(t *testing.T, field string, check Check) {
	t.Helper()
	id := "calendar_" + field + "_valid"
	for _, tc := range []struct {
		name  string
		value any
		count int
	}{
		{"Zero", "0", 0}, {"One", "1", 0}, {"Two", "2", 1}, {"Negative", "-1", 1},
		{"Boolean", "true", 1}, {"Decimal", "1.0", 1}, {"Whitespace", " 1", 1}, {"Empty", "", 1}, {"Null", nil, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := Config(id, types.SEVERITY_ERROR)
			_, ctx := Fixture(t, map[string]any{field: tc.value}, config)
			if err := check(ctx, config); err != nil {
				t.Fatal(err)
			}
			AssertFindings(t, id, field, types.SEVERITY_ERROR, tc.count)
		})
	}
	for _, severity := range []types.Severity{types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN} {
		t.Run(string(severity), func(t *testing.T) {
			config := Config(id, severity)
			_, ctx := Fixture(t, map[string]any{field: "2"}, config)
			if err := check(ctx, config); err != nil {
				t.Fatal(err)
			}
			count := 1
			if severity == types.SEVERITY_IGNORE {
				count = 0
			}
			AssertFindings(t, id, field, severity, count)
		})
	}
	t.Run("MissingRule", func(t *testing.T) {
		_, ctx := Fixture(t, map[string]any{field: "2"}, nil)
		if err := check(ctx, nil); err != nil {
			t.Fatal(err)
		}
		AssertFindings(t, id, field, types.SEVERITY_IGNORE, 0)
	})
	t.Run("ReadFailure", func(t *testing.T) { AssertReadFailure(t, check, id) })
}

func CheckDateSeverities(t *testing.T, id string, check Check, values map[string]any) {
	t.Helper()
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN, ""} {
		t.Run("Severity/"+string(severity), func(t *testing.T) {
			config := Config(id, severity)
			_, ctx := Fixture(t, values, config)
			if err := check(ctx, config); err != nil {
				t.Fatal(err)
			}
			count := 1
			if severity == "" || severity == types.SEVERITY_IGNORE {
				count = 0
			}
			AssertFindings(t, id, "dates", severity, count)
		})
	}
	for name, config := range map[string]*types.CalendarRules{"NilRules": nil, "MissingRule": {}} {
		t.Run(name, func(t *testing.T) {
			_, ctx := Fixture(t, values, config)
			if err := check(ctx, config); err != nil {
				t.Fatal(err)
			}
			AssertFindings(t, id, "dates", types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { AssertReadFailure(t, check, id) })
}
