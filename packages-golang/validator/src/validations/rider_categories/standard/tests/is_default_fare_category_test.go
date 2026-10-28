package rider_categories_standard_test

import (
	"fmt"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/rider_categories/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/rider_categories/utils"
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
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"is_default_fare_category": tc.value}, config)
			if err := checks.IsDefaultFareCategoryValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "is_default_fare_category", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "is_default_fare_category", checks.IsDefaultFareCategoryValid, map[string]any{"is_default_fare_category": "bad"})
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.IsDefaultFareCategoryValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "is_default_fare_category", types.SEVERITY_ERROR, 0)
	})
}
func TestDefaultOptionsAndMultipleDefaults(t *testing.T) {
	const id = "rider_categories_is_default_fare_category_valid"
	for _, tc := range []struct {
		options []string
		count   int
	}{{[]string{"1"}, 0}, {[]string{"0"}, 1}, {[]string{types.ALL_OPTIONS}, 0}, {[]string{}, 1}} {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
		db, ctx := testutils.Fixture(t, map[string]any{"is_default_fare_category": "01"}, config)
		if _, err := db.Exec("INSERT INTO rider_categories(is_default_fare_category) VALUES ('1')"); err != nil {
			t.Fatal(err)
		}
		if err := checks.IsDefaultFareCategoryValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "is_default_fare_category", types.SEVERITY_ERROR, tc.count)
	}
}
