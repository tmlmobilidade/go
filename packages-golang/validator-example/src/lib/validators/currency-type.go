package validators

import (
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
)

func ValidateCurrencyType(currencyType string) bool {
	return slices.Contains(variables.SupportedCurrencyCodes, strings.ToUpper(currencyType))
}
