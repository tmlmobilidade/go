package feed_info_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func FeedEndDateFormat(db *services.SQLiteContext, rules *types.FeedInfoRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_feed_end_date_format"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("feed_end_date_format", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the feed_end_date value

	value, err := db.FeedInfo.Field("feed_end_date")
	if err != nil {
		return err
	}

	//
	// 4. Check if the feed_end_date is in the correct format

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