# lum.tax.js

Some fairly basic financial math functions. 

The original version of this package was a port of my old tax calculator.
As of version 2.0 it has been overhauled to be a more general collection
of financial related formulas and algorithms. Despite it no longer being
just tax related, the package name was already set and I don't feel like
changing it. I kinda wanna nickname it `tax++`, LOL. Math is funny, but
taxes, capitalism, and most everything to do with finances are summed up
best by the common description of money itself: _the root of all evil_!

Well this package makes all that evil just a little easier to handle. Yay!

## Documentation note

So I just realised that projects that have `{type: 'module'}` don't work
with [jsdoc] which up til now has been my go-to for generating documentation.

They've had at least 3 issues open about this (one since 2022) and it's still
not resolved, which leads me to think jsdoc has been abandoned. A one-line
workaround to let jsdoc handle the .cjs extension was posted in January 2023,
and apparently has never been actually merged.

So I guess my options are try to fork jsdoc, or find an alternative package.
I'm leaning toward the latter, maybe something that supports both regular JS
and TypeScript all at once as that'd be really damn useful.

I guess a third option is write my own documentation generator, but I've done
more than enough of writing my own libraries for silly things (like this tax
package which is ridiculous) and don't feel like adding yet another to my list.

Until I can update [@lumjs/build] to support an alternative to jsdoc, I guess
the official source of documentation is: "read the code". Have fun!

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.tax.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/tax)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)


[jsdoc]: https://github.com/jsdoc/jsdoc
[@lumjs/build]: https://github.com/supernovus/lum.build.js

