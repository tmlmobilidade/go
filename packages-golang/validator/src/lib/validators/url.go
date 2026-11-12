package validators

import (
	"net/url"
	"strings"

	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/utils/validators"
)

func ValidateUrl(u string) bool {
	//

	//
	// 1. Trim the URL and check if it is empty

	u = strings.TrimSpace(u)
	if u == "" {
		return false
	}

	//
	// 2. Check if the URL contains disallowed characters

	if strings.ContainsAny(u, ` "<>{}|"'\^`) {
		return false
	}

	//
	// 3. Validate percent-encoding

	for i := 0; i < len(u); i++ {
		if u[i] == '%' {
			if i+2 >= len(u) ||
				!utils.IsHex(u[i+1]) ||
				!utils.IsHex(u[i+2]) {
				return false
			}
			i += 2
		}
	}

	//
	// 4. Parse the URL and check if it is valid

	parsedUrl, err := url.ParseRequestURI(u)
	if err != nil {
		return false
	}

	//
	// 5. Check if the URL scheme is valid

	if parsedUrl.Scheme != "http" && parsedUrl.Scheme != "https" {
		return false
	}

	//
	// 6. Check if the URL host is valid

	if parsedUrl.Host == "" {
		return false
	}

	//
	// 7. Return true if the URL is valid

	return true
}
