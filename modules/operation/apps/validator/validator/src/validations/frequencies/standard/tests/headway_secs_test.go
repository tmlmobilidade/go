package frequencies_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/frequencies/standard/checks"
	testutils "main/validations/frequencies/utils"
	"testing"
)

func TestHeadwaySecsValid(t *testing.T) {
	const id = "frequencies_headway_secs_positive_and_aligns_trip"
	for _, tc := range []struct {
		value any
		count int
	}{{"1", 0}, {"0600", 0}, {"0", 1}, {"-1", 1}, {"1.5", 1}, {"bad", 1}, {"99999999999999999999999", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"headway_secs": tc.value}, config)
			if err := checks.HeadwaySecsValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "headway_secs", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.HeadwaySecsValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "headway_secs", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "headway_secs", checks.HeadwaySecsValid, map[string]any{"headway_secs": "bad"})
}
