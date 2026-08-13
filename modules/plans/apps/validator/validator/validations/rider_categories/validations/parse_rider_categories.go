package rider_categories

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseRiderCategories(rawRiderCategories types.RiderCategoryRaw, row int) types.RiderCategory {
	var (
		riderCategory                                      types.RiderCategory = types.RiderCategory{}
		eligibilityUrl, riderCategoryId, riderCategoryName string
		isDefaultFareCategory                              int
		messages                                           []types.Message
	)

	stringFields := map[string]*string{
		"eligibility_url":     &eligibilityUrl,
		"rider_category_id":   &riderCategoryId,
		"rider_category_name": &riderCategoryName,
	}

	intFields := map[string]*int{
		"is_default_fare_category": &isDefaultFareCategory,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:        field,
			FileName:     "rider_categories.txt",
			Rows:         []int{row},
			Message:      msg,
			Severity:     types.SEVERITY_ERROR,
			RuleID:       "rider_categories_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawRiderCategories, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawRiderCategories, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return riderCategory
	}

	// Required fields
	riderCategory.RiderCategoryId = lib.IfThenElse(rawRiderCategories.RiderCategoryId != "", &riderCategoryId, nil)
	riderCategory.RiderCategoryName = lib.IfThenElse(rawRiderCategories.RiderCategoryName != "", &riderCategoryName, nil)
	riderCategory.IsDefaultFareCategory = lib.IfThenElse(rawRiderCategories.IsDefaultFareCategory != "", &isDefaultFareCategory, nil)

	// Optional fields
	riderCategory.EligibilityUrl = lib.IfThenElse(rawRiderCategories.EligibilityUrl != "", &eligibilityUrl, nil)

	return riderCategory
}
