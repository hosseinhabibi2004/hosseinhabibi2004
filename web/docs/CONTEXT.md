# Web

The public site: a static export in English and Persian that reads the Django API once, at build time. This glossary names what the code and the docs mean.

## Language

**Snapshot**:
The JSON per locale and the images that `pnpm sync` writes from the API into `.content/` and `public/media/`, and the only thing a page reads.
_Avoid_: Cache, dump, fixture (a fixture is a snapshot kept for tests)

**Twin page**:
The same page in the other locale, linked from the locale switch and listed as an hreflang alternate only when it is published there.
_Avoid_: Translation, counterpart, alternate

**Band**:
A full-width section of the page in the template's black (a step lighter than the page in dark mode), drawn with the `band` tokens.
_Avoid_: Dark section, banner, strip

**Paper**:
An always-light panel, in both themes, that holds the black-and-white illustrations, drawn with the `paper` tokens.
_Avoid_: Card, white box, light panel
