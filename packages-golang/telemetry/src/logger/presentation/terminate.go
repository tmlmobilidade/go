package presentation

import (
	"fmt"
	"os"
	"strings"
)

func Terminate(message string) {
	divider := strings.Repeat("-", StringLength(message))
	fmt.Fprintf(os.Stdout, "\n%s\n%s\n%s\n\n", divider, message, divider)
}
