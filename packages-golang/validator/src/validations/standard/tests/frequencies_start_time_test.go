package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestStartTimeValid(t *testing.T) {
	const id = "frequencies_start_time_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"00:00:00", 0}, {"24:00:00", 0}, {"25:30:00", 0}, {"99:99:99", 0}, {"7:00:00", 1}, {"100:00:00", 1}, {"12:ab:00", 1}, {"12-00-00", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FrequenciesFixture(t, map[string]any{"start_time": tc.value}, config)
			if err := standard.StartTimeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.FrequenciesAssertFindings(t, id, "start_time", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.FrequenciesFixture(t, nil, config)
		if err := standard.StartTimeValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.FrequenciesAssertFindings(t, id, "start_time", types.SEVERITY_ERROR, 0)
	})
	validationutils.FrequenciesCheckInvalid(t, id, "start_time", standard.StartTimeValid, map[string]any{"start_time": "bad"})
}
