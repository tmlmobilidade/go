package messages

import (
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables/i18n"
)

// GenericRuleMessage returns the rule's generic sentence, used as the summary line
// that stands in for the rule's individual messages.
//
// Rules whose sentence has not been translated yet fall back to their humanised id,
// so a missing entry reads as a plain description instead of leaking a raw key.
func GenericRuleMessage(ruleID string) string {
	//

	//
	// 1. Resolve a file notice or rule summary translation

	if table, found := strings.CutSuffix(ruleID, "_file_missing"); found {
		return i18n.AppTranslator.Get("file_missing.message", table+".txt")
	}
	key := ruleID + ".generic"
	if message := i18n.AppTranslator.Get(key); message != key {
		return message
	}

	return humanizeRuleID(ruleID)
}

// humanizeRuleID makes a lowercase rule ID readable by replacing underscores with spaces.
func humanizeRuleID(ruleID string) string {
	//

	//
	// 1. Turn the untranslated rule ID into a readable fallback

	return strings.ReplaceAll(ruleID, "_", " ")
}
