package feed_info_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func DefaultLangValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_default_lang_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("default_lang", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the default_lang value

	value, err := db.FeedInfo.Field("default_lang")
	if err != nil {
		return err
	}

	//
	// 4. Check if the default_lang is valid

	if !lib.ValidateLanguage(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
