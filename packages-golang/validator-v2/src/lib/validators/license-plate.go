package validators

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validators/regex"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validators/utils"
)

func ValidateLicensePlate(licensePlate string) bool {
	licensePlate = utils.NormalizeLicensePlate(licensePlate)

	if len(licensePlate) != 6 {
		return false
	}

	return regex.PlateRegex.MatchString(licensePlate)
}