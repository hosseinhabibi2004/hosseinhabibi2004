# API conventions

Rules for `api/src/`. IDs are append-only: a new rule takes the next free
number, and a removed rule's number retires with it. The checks that always
apply: `uv run ruff check .`, `uv run ruff format --check .`, `uv run ty check`
(0 errors) and `uv run pytest`.

Rule IDs: `dj-mod-` models, `dj-api-` api.

## Models

- **dj-mod-01** — Text that differs per language lives in a `*Translation` row, never in
  paired columns. The row has `parent` (`related_name="translations"`), `locale`
  (limited to `LANGUAGES`) and a unique `(parent, locale)` among live rows.
  Build it from `core/translations.py` and `content/models/common.py:live_unique`.
  ✓ `PostTranslation(post, locale, title, …)`; ✗ `title_en`, `title_fa` on `Post`.
- **dj-mod-02** — Content models extend `SoftDeleteModel`; deleting hides the row. Any unique
  constraint on a soft-deletable model is conditional on `is_deleted=False`, or a deleted
  item blocks a new one. `Model.objects` is the live manager and the default (so reverse
  relations hide deleted rows); `Model.objects_default` sees everything.
  ✓ `live_unique(["slug"], "content_post_live_slug")`; ✗ `unique=True` on `slug`.
- **dj-mod-03** — A foreign key to an `Image` is `SET_NULL`, never `CASCADE`: the soft-delete
  cascade follows `CASCADE` links, and removing a picture must not remove a post.

## API

- **dj-api-01** — A Public endpoint subclasses `PublicView`, is GET-only, and reads only
  through `content/selectors.py`, which alone decides what is public (published, live,
  in the locale). `core/tests/test_route_security.py` fails for any route that answers
  without a session and is not on its allowlist.
  ✓ `selectors.published_posts(locale)`; ✗ `Post.objects.all()` in a public view.
- **dj-api-02** — An Author endpoint is `IsAuthenticated`, addressed by `uuid`, and `DELETE`
  soft-deletes (answers 200, not 204: the response envelope needs a body).
