package validators

import (
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

func ValidateCurrencyType(currencyType string) bool {
	//

	//
	// 1. Check if the currency type is supported

	return slices.Contains(variables.SupportedCurrencyCodes, strings.ToUpper(currencyType))
}
