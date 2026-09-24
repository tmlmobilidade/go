package rider_categories

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/rider_categories/validations"
)

func init() {
	registry.Register("rider_categories", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.RiderCategoriesRules
	if rules != nil {
		section = &rules.RiderCategories
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
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
		runner.Run(services.RuleActions{
			"rider_category_id_unique":          func() { validations.RiderCategoryIdValidation(&riderCategory, i, &gtfs, &rules.RiderCategories) },
			"rider_category_name_non_empty":     func() { validations.RiderCategoryNameValidation(&riderCategory, i, &rules.RiderCategories) },
			"rider_categories_at_most_one_default_fare_category": func() { validations.IsDefaultFareCategoryValidation(&riderCategory, i, &rules.RiderCategories) },
			"rider_categories_eligibility_url_valid_http_url":    func() { validations.EligibilityUrlValidation(&riderCategory, i, &rules.RiderCategories) },
		}, nil)

		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating over rider categories: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed rider_categories.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
