JS_FILES = \
	src/start.js \
	src/core.js \
	src/donut.js \
	src/line.js \
	src/end.js

all: clean chartme.js

chartme.js: $(JS_FILES)

chartme.js: Makefile
	# @rm -f $@
	cat $(filter %.js,$^) > $@

clean:
	rm -f chartme*.js
