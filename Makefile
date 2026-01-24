.PHONY: *

VERSION = $(shell grep '"Version":' ./package/metadata.json | grep -o '[0-9\.]*')

install:
	kpackagetool6 --type=KWin/Script -i ./package/ || kpackagetool6 --type=KWin/Script -u ./package/

uninstall:
	kpackagetool6 --type=KWin/Script -r kneko

package:
	zip kneko-${VERSION}.kwinscript -r ./package
