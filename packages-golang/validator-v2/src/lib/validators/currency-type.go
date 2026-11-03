package validators

import (
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
)

func ValidateCurrencyType(currencyType string) bool {
	return slices.Contains(variables.SupportedCurrencyCodes, strings.ToUpper(currencyType))
}
