package feed_info_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func FeedPublisherUrlField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_feed_publisher_url_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("feed_publisher_url", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the feed_publisher_url value

	value, err := db.FeedInfo.Field("feed_publisher_url")
	if err != nil {
		return err
	}

	//
	// 4. Check if the feed_publisher_url is required

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
