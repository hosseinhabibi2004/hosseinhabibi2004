# Backend

The Django API behind the author's local admin app and the static public site. It stores the portfolio and blog content and serves it two ways: to the author, and to the site build.

## Language

**Author**:
The one person who writes and publishes the content; the only signed-in account.
_Avoid_: Admin, editor, user, owner

**Content item**:
One piece of content the Author maintains: a Post, Project, Tag, Profile, Skill group, Experience, Education or Image.
_Avoid_: Entry, record, document, page

**Locale**:
A language the content is written in: `en` or `fa`.
_Avoid_: Language code, lang, translation language

**Translation**:
The text of one Content item in one Locale, stored in its own row apart from the language-independent fields.
_Avoid_: Version, localization, copy

**Draft**:
A Translation of a Post or Project that is not yet visible on the public site.
_Avoid_: Unpublished, hidden, pending

**Published translation**:
A Translation of a Post or Project marked published, with a publish date; only these reach the public site.
_Avoid_: Live, released, public post

**Slug**:
The one ASCII URL name a Post, Project or Tag keeps in every Locale; fixed once any of its Translations is published.
_Avoid_: URL name, permalink, path

**Author API**:
The endpoints under `/api/author/` that create, change and delete content, behind the Author's session.
_Avoid_: Admin API, private API, write API

**Public API**:
The read-only endpoints under `/api/public/` that the static site reads at build time; they return only Published translations and never anything deleted.
_Avoid_: Site API, open API, read API

**Soft delete**:
Deleting a Content item by hiding it, never by removing the row; it stays recoverable.
_Avoid_: Archive, trash, remove

**Profile**:
The single Content item describing the Author (name, headline, summary, email, links); it has no phone number.
_Avoid_: About, bio, resume

**Skill group**:
A titled, ordered set of skills (for example "Backend & Web"); each skill has a single name that is the same in every Locale.
_Avoid_: Category, skill set, tech stack

**Experience**:
A job the Author held, with a company, dates, and a role and description per Locale.
_Avoid_: Work history, job, position

**Education**:
A degree or course the Author took, with an institution, dates, and a degree and description per Locale.
_Avoid_: School, study

**Project**:
Something the Author built, shown on the site; it has a Slug, links, skills and Translations, and is published like a Post.
_Avoid_: Work, portfolio item, case study

**Post**:
A blog article with a Slug, tags, a cover Image and Translations whose body is Markdown.
_Avoid_: Article, blog entry, story

**Image**:
An uploaded picture with its dimensions and an alt text per Locale.
_Avoid_: Photo, media, file, attachment
