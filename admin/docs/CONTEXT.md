# Admin

The Author's own screens for writing content, running only on their machine. It talks to the API and never ships to the public.

## Language

**Interface language**:
The language the admin's own screens are shown in, `en` or `fa`; it sets the text and the direction and is kept in a cookie.
_Avoid_: Locale, UI locale, site language

**Content locale**:
A language an item's text is written in; each content locale has its own tab on an edit form.
_Avoid_: Translation language, interface language

**Language status**:
Whether one content locale of an item is empty, a draft or published.
_Avoid_: Translation state, version status

**Design system**:
The tokens, components and rules every screen is built from: dark, black and white, right to left in Persian and left to right in English.
_Avoid_: Theme, UI kit, style guide

**Token**:
A named design value (a colour, a space, a radius) defined once and used only through its semantic class.
_Avoid_: Variable, constant, CSS value

**Shell**:
The frame around every signed-in screen: the sidebar, the header, the user menu and the language switcher.
_Avoid_: Layout, chrome, frame

**Trash**:
The view of soft-deleted items of one kind, from which an item can be restored.
_Avoid_: Archive, recycle bin, deleted list
