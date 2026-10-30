package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestEligibilityUrlValid(t *testing.T) {
	const id = "rider_categories_eligibility_url_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"https://example.org/eligibility", 0}, {"http://example.org", 0}, {"bad", 1}, {"ftp://example.org", 1}, {"https://example.org/%XX", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.RiderCategoriesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.RiderCategoriesFixture(t, map[string]any{"eligibility_url": tc.value}, config)
			if err := standard.EligibilityUrlValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.RiderCategoriesAssertFindings(t, id, "eligibility_url", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.RiderCategoriesCheckInvalid(t, id, "eligibility_url", standard.EligibilityUrlValid, map[string]any{"eligibility_url": "bad"})
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.RiderCategoriesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.RiderCategoriesFixture(t, nil, config)
		if err := standard.EligibilityUrlValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.RiderCategoriesAssertFindings(t, id, "eligibility_url", types.SEVERITY_ERROR, 0)
	})
}
