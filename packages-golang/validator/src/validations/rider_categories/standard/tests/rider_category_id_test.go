package rider_categories_standard_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/rider_categories/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/rider_categories/utils"
	"main/types"
	"testing"
)

func TestRiderCategoryIdUnique(t *testing.T) {
	const id = "rider_categories_rider_category_id_unique"
	for _, tc := range []struct {
		name  string
		value any
		other any
		count int
	}{
		{"Unique", "A", "B", 0}, {"Duplicate", "A", "A", 1}, {"Quoted", "rider'quoted", "rider'quoted", 1}, {"Empty", "", "", 0}, {"Null", nil, nil, 0}} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			db, ctx := testutils.Fixture(t, map[string]any{"rider_category_id": tc.value}, config)
			if _, err := db.Exec("INSERT INTO rider_categories(rider_category_id) VALUES (?)", tc.other); err != nil {
				t.Fatal(err)
			}
			if err := checks.RiderCategoryIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "rider_category_id", types.SEVERITY_ERROR, tc.count)
			services.AppMessageService.Clear()
			if _, err := db.Exec("UPDATE rider_categories SET rider_category_id='changed' WHERE rowid=4"); err != nil {
				t.Fatal(err)
			}
			if err := checks.RiderCategoryIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "rider_category_id", types.SEVERITY_ERROR, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { testutils.AssertReadFailure(t, checks.RiderCategoryIdUnique, id) })
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.RiderCategoryIdUnique(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "rider_category_id", types.SEVERITY_ERROR, 0)
	})
}
