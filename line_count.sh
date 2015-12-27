#!/bin/bash
DIR="$(dirname "${BASH_SOURCE}")"
cloc --exclude-list-file="$DIR/line_count.sh" "$DIR"
return 2>/dev/null || exit
############################
line_count.sh
.git
bower_components
node_modules
package.json
bower.json
