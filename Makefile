## Directories and Files
MAIN_TS := oribir.ts
MODULES_TS := simulation.ts graphics.ts plot.ts
MAIN_DIST := index.html style.css README.md LICENSE.txt
D3_DIST := $(addprefix d3/, d3.min.js README.md LICENSE)
I18N_DIST := $(addprefix i18next/,i18next.min.js README.md license)

MAIN_JS := $(subst .ts,.js,${MAIN_TS})
MODULES_JS := $(subst .ts,.js,${MODULES_TS})
MAIN_DIST += ${MAIN_JS} ${MODULES_JS}
PACKAGE := $(notdir $(shell pwd))
DISTFILES := $(addprefix $(PACKAGE)/,${MAIN_DIST} ${D3_DIST} ${I18N_DIST})
VERSION := $(shell git describe --tags 2>/dev/null || echo v0.0)

## Targets
.PHONY: all clean dist open chrome
.DEFAULT_GOAL := all

all: ${MAIN_JS}
	@:

${MAIN_JS}: ${MAIN_TS} ${MODULES_TS}
	tsc $<

clean:
	$(RM) *.tar.gz *.zip

dist: ${MAIN_JS}
	tar -C .. -czf $(PACKAGE)-$(VERSION).tar.gz $(DISTFILES)
	cd .. && zip $(PACKAGE)/$(PACKAGE)-$(VERSION).zip $(DISTFILES)

open:
	git status
	open http://heavywatal.github.io/oribir.js/

safari: ${MAIN_JS}
	open -a Safari index.html

chrome: ${MAIN_JS}
	open -a Google\ Chrome index.html --args --allow-file-access-from-files

firefox: ${MAIN_JS}
	open -a Firefox index.html

test: all
	node simulation.js
