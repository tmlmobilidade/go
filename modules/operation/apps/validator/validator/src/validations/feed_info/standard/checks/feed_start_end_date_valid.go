package feed_info_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func FeedStartEndDateValid(db *services.SQLiteContext, rules *types.FeedInfoRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_start_end_dates_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("dates", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
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
