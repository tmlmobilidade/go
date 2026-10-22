package rider_categories_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/rider_categories/standard/checks"
	testutils "main/validations/rider_categories/utils"
	"testing"
)

func TestEligibilityUrlValid(t *testing.T) {
	const id = "rider_categories_eligibility_url_valid_http_url"
	for _, tc := range []struct {
		value any
		count int
	}{{"https://example.org/eligibility", 0}, {"http://example.org", 0}, {"bad", 1}, {"ftp://example.org", 1}, {"https://example.org/%XX", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"eligibility_url": tc.value}, config)
			if err := checks.EligibilityUrlValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "eligibility_url", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "eligibility_url", checks.EligibilityUrlValid, map[string]any{"eligibility_url": "bad"})
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.EligibilityUrlValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "eligibility_url", types.SEVERITY_ERROR, 0)
	})
}
