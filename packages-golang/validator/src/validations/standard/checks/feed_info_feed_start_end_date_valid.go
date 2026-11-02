package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func FeedStartEndDateValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_start_end_dates_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("dates", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the date value

	feedStartDate, err := db.FeedInfo.Field("feed_start_date")
	if err != nil {
		return err
	}

	feedEndDate, err := db.FeedInfo.Field("feed_end_date")
	if err != nil {
		return err
	}

	//
	// 4. Validate start_date is before end_date

	if feedStartDate >= feedEndDate {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", feedStartDate, feedEndDate))
	}

	//
	// 5. Return success

	return nil
}
