package feed_info_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func FeedVersionField(db *services.SQLiteContext, rules *types.FeedInfoRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_feed_version_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("feed_version", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the feed_version value

	value, err := db.FeedInfo.Field("feed_version")
	if err != nil {
		return err
	}

	//
	// 4. Check if the feed_version is required

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