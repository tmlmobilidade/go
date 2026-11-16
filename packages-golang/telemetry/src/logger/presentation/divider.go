package presentation

import (
	"fmt"
	"os"
	"strings"
	"unicode/utf16"
)

// StringLength matches JavaScript string.length, including surrogate pairs.
func StringLength(message string) int { return len(utf16.Encode([]rune(message))) }

func Divider(message string, sizes ...int) {
	size := 75
	if len(sizes) > 0 {
		size = sizes[0]
	}
	fmt.Fprintln(os.Stdout)
	if message != "" {
		hyphenCount := max(1, size-2-StringLength(message))
		fmt.Fprintf(os.Stdout, "- %s %s\n", message, strings.Repeat("-", hyphenCount))
	} else {
		fmt.Fprintln(os.Stdout, strings.Repeat("-", max(0, size)))
	}
	fmt.Fprintln(os.Stdout)
}
