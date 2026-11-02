package standard_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
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
			config := validationutils.RiderCategoriesConfig(id, types.SEVERITY_ERROR)
			db, ctx := validationutils.RiderCategoriesFixture(t, map[string]any{"rider_category_id": tc.value}, config)
			if _, err := db.Exec("INSERT INTO rider_categories(rider_category_id) VALUES (?)", tc.other); err != nil {
				t.Fatal(err)
			}
			if err := standard.RiderCategoryIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.RiderCategoriesAssertFindings(t, id, "rider_category_id", types.SEVERITY_ERROR, tc.count)
			services.AppMessageService.Clear()
			if _, err := db.Exec("UPDATE rider_categories SET rider_category_id='changed' WHERE rowid=4"); err != nil {
				t.Fatal(err)
			}
			if err := standard.RiderCategoryIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.RiderCategoriesAssertFindings(t, id, "rider_category_id", types.SEVERITY_ERROR, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) {
		validationutils.RiderCategoriesAssertReadFailure(t, standard.RiderCategoryIdUnique, id)
	})
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.RiderCategoriesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.RiderCategoriesFixture(t, nil, config)
		if err := standard.RiderCategoryIdUnique(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.RiderCategoriesAssertFindings(t, id, "rider_category_id", types.SEVERITY_ERROR, 0)
	})
}
