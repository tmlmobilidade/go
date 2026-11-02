package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestIsDefaultFareCategoryValid(t *testing.T) {
	const id = "rider_categories_is_default_fare_category_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"1", 0}, {"01", 0}, {"-1", 1}, {"2", 1}, {"bad", 1}, {"1.5", 1}, {"9999999999999999999999999999", 1}, {"", 0}, {nil, 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.RiderCategoriesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.RiderCategoriesFixture(t, map[string]any{"is_default_fare_category": tc.value}, config)
			if err := standard.IsDefaultFareCategoryValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.RiderCategoriesAssertFindings(t, id, "is_default_fare_category", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.RiderCategoriesCheckInvalid(t, id, "is_default_fare_category", standard.IsDefaultFareCategoryValid, map[string]any{"is_default_fare_category": "bad"})
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.RiderCategoriesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.RiderCategoriesFixture(t, nil, config)
		if err := standard.IsDefaultFareCategoryValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.RiderCategoriesAssertFindings(t, id, "is_default_fare_category", types.SEVERITY_ERROR, 0)
	})
}
func TestDefaultOptionsAndMultipleDefaults(t *testing.T) {
	const id = "rider_categories_is_default_fare_category_valid"
	for _, tc := range []struct {
		options []string
		count   int
	}{{[]string{"1"}, 0}, {[]string{"0"}, 1}, {[]string{types.ALL_OPTIONS}, 0}, {[]string{}, 1}} {
		config := validationutils.RiderCategoriesConfig(id, types.SEVERITY_ERROR)
		config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
		db, ctx := validationutils.RiderCategoriesFixture(t, map[string]any{"is_default_fare_category": "01"}, config)
		if _, err := db.Exec("INSERT INTO rider_categories(is_default_fare_category) VALUES ('1')"); err != nil {
			t.Fatal(err)
		}
		if err := standard.IsDefaultFareCategoryValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.RiderCategoriesAssertFindings(t, id, "is_default_fare_category", types.SEVERITY_ERROR, tc.count)
	}
}
