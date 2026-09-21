package rider_categories

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/rider_categories/validations"
)

func init() {
	registry.Register("rider_categories", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running RiderCategories Validations...")

	lib.AppLogger.Debug("Pre-computing rider_categories data...")
	riderCategoriesCache := make(map[string]types.RiderCategoryRaw)
	err := gtfs.IterateRiderCategories(func(i int, rawRiderCategory types.RiderCategoryRaw) error {
		if rawRiderCategory.RiderCategoryId == "" {
			return nil
		}
		riderCategoriesCache[rawRiderCategory.RiderCategoryId] = rawRiderCategory
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error pre-computing rider categories: %v", err))
	}
	lib.AppLogger.Debug(fmt.Sprintf("Pre-computed rider categories for %d rider categories", len(riderCategoriesCache)))

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "rider_categories", config.ProgressThresholdLarge)

	// Iterate over all rider categories
	err = gtfs.IterateRiderCategories(func(i int, rawRiderCategory types.RiderCategoryRaw) error {
		tracker.Track()
		riderCategory := validations.ParseRiderCategories(rawRiderCategory, i)

		if riderCategory == (types.RiderCategory{}) {
			return nil
		}

		// Validate rider_category_id
		validations.RiderCategoryIdValidation(&riderCategory, i, &gtfs, &rules.RiderCategories)

		// Validate rider_category_name
		validations.RiderCategoryNameValidation(&riderCategory, i, &rules.RiderCategories)

		// Validate is_default_fare_category
		validations.IsDefaultFareCategoryValidation(&riderCategory, i, &rules.RiderCategories)

		// Validate eligibility_url
		validations.EligibilityUrlValidation(&riderCategory, i, &rules.RiderCategories)

		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating over rider categories: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed rider_categories.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
