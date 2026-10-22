package rider_categories_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func EligibilityUrlValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "rider_categories_eligibility_url_valid_http_url"
	ctx := lib.NewValidationContext("eligibility_url", "rider_categories.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.RiderCategories.Field("eligibility_url")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	if !lib.ValidateUrl(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
	}
	return nil
}
