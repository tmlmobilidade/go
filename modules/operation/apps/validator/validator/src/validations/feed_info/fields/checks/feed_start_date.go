package feed_info_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func FeedStartDateField(db *services.SQLiteContext, rules *types.FeedInfoRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_feed_start_date_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("feed_start_date", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the feed_start_date value

	value, err := db.FeedInfo.Field("feed_start_date")
	if err != nil {
		return err
	}

	//
	// 4. Check if the feed_start_date is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}