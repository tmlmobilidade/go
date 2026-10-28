package feed_info_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func FeedStartDateFormat(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_feed_start_date_format"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("feed_start_date_format", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the feed_start_date value

	value, err := db.FeedInfo.Field("feed_start_date")
	if err != nil {
		return err
	}

	//
	// 4. Check if the feed_start_date is in the correct format

	if !lib.IsValidServiceDate(value) {
		if ctx.ShouldIgnore() {
			return nil
		}

		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("invalid", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
