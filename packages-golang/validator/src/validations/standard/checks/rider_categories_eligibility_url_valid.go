package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func EligibilityUrlValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "rider_categories_eligibility_url_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("eligibility_url", "rider_categories.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the eligibility_url value

	value, err := db.RiderCategories.Field("eligibility_url")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty eligibility_url values

	if value == "" {
		return nil
	}

	//
	// 5. Check if the eligibility_url is a valid URL

	if !lib.ValidateUrl(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
	}

	//
	// 6. Return success

	return nil
}
