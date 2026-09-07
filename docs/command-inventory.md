# Official command inventory

Reference: Obsidian 1.13.7 (installer 1.12.4), captured September 7, 2026.

102 command names were extracted from [native help](../tests/fixtures/native-help.txt).
The classifications below are planning judgments, not evidence that unimplemented
commands have been tested. Their detailed output and failure contracts remain
uncharacterized. The reference help records each command's stated purpose.

| Command | Native parameters/flags | Nitride disposition | Dependency / remaining work |
| --- | --- | --- | --- |
| `aliases` | `file=<name>`; `path=<path>`; `total`; `verbose`; `active` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `append` | `file=<name>`; `path=<path>`; `content=<text>`; `inline` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `backlinks` | `file=<name>`; `path=<path>`; `counts`; `total`; `format=json\|tsv\|csv` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `base:create` | `file=<name>`; `path=<path>`; `view=<name>`; `name=<name>`; `content=<text>`; `open`; `newtab` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `base:query` | `file=<name>`; `path=<path>`; `view=<name>`; `format=json\|csv\|tsv\|md\|paths` | Supported subset | See the command contract and recorded Base cases. |
| `base:views` | — | Supported subset | See the command contract and recorded Base cases. |
| `bases` | — | Supported subset | See the command contract and recorded Base cases. |
| `bookmark` | `file=<path>`; `subpath=<subpath>`; `folder=<path>`; `search=<query>`; `url=<url>`; `title=<title>` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `bookmarks` | `total`; `verbose`; `format=json\|tsv\|csv` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `command` | `id=<command-id>` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `commands` | `filter=<prefix>` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `create` | `name=<name>`; `path=<path>`; `content=<text>`; `template=<name>`; `overwrite`; `open`; `newtab` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `daily` | `paneType=tab\|split\|window` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `daily:append` | `content=<text>`; `inline`; `open`; `paneType=tab\|split\|window` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `daily:path` | — | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `daily:prepend` | `content=<text>`; `inline`; `open`; `paneType=tab\|split\|window` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `daily:read` | — | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `deadends` | `total`; `all` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `delete` | `file=<name>`; `path=<path>`; `permanent` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `diff` | `file=<name>`; `path=<path>`; `from=<n>`; `to=<n>`; `filter=local\|sync` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `file` | `file=<name>`; `path=<path>` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `files` | `folder=<path>`; `ext=<extension>`; `total` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `folder` | `path=<path>`; `info=files\|folders\|size` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `folders` | `folder=<path>`; `total` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `help` | `<command>` | Supported subset | See the command contract and recorded Base cases. |
| `history` | `file=<name>`; `path=<path>` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `history:list` | — | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `history:open` | `file=<name>`; `path=<path>` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `history:read` | `file=<name>`; `path=<path>`; `version=<n>` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `history:restore` | `file=<name>`; `path=<path>`; `version=<n>` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `hotkey` | `id=<command-id>`; `verbose` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `hotkeys` | `total`; `verbose`; `format=json\|tsv\|csv`; `all` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `links` | `file=<name>`; `path=<path>`; `total` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `move` | `file=<name>`; `path=<path>`; `to=<path>` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `open` | `file=<name>`; `path=<path>`; `newtab` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `orphans` | `total`; `all` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `outline` | `file=<name>`; `path=<path>`; `format=tree\|md\|json`; `total` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `plugin` | `id=<plugin-id>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `plugin:disable` | `id=<id>`; `filter=core\|community` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `plugin:enable` | `id=<id>`; `filter=core\|community` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `plugin:install` | `id=<id>`; `enable` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `plugin:reload` | `id=<id>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `plugin:uninstall` | `id=<id>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `plugins` | `filter=core\|community`; `versions`; `format=json\|tsv\|csv` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `plugins:enabled` | `filter=core\|community`; `versions`; `format=json\|tsv\|csv` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `plugins:restrict` | `on`; `off` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `prepend` | `file=<name>`; `path=<path>`; `content=<text>`; `inline` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `properties` | `file=<name>`; `path=<path>`; `name=<name>`; `total`; `sort=count`; `counts`; `format=yaml\|json\|tsv`; `active` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `property:read` | `name=<name>`; `file=<name>`; `path=<path>` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `property:remove` | `name=<name>`; `file=<name>`; `path=<path>` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `property:set` | `name=<name>`; `value=<value>`; `type=text\|list\|number\|checkbox\|date\|datetime`; `file=<name>`; `path=<path>` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `random` | `folder=<path>`; `newtab` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `random:read` | `folder=<path>` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `read` | `file=<name>`; `path=<path>` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `recents` | `total` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `reload` | — | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `rename` | `file=<name>`; `path=<path>`; `name=<name>` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `restart` | — | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `search` | `query=<text>`; `path=<folder>`; `limit=<n>`; `total`; `case`; `format=text\|json` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `search:context` | `query=<text>`; `path=<folder>`; `limit=<n>`; `case`; `format=text\|json` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `search:open` | `query=<text>` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `snippet:disable` | `name=<name>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `snippet:enable` | `name=<name>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `snippets` | — | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `snippets:enabled` | — | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `sync` | `on`; `off` | Service-coupled; excluded | Separate provider/state contract; no service implementation. |
| `sync:deleted` | `total` | Service-coupled; excluded | Separate provider/state contract; no service implementation. |
| `sync:history` | `file=<name>`; `path=<path>`; `total` | Service-coupled; excluded | Separate provider/state contract; no service implementation. |
| `sync:open` | `file=<name>`; `path=<path>` | Service-coupled; excluded | Separate provider/state contract; no service implementation. |
| `sync:read` | `file=<name>`; `path=<path>`; `version=<n>` | Service-coupled; excluded | Separate provider/state contract; no service implementation. |
| `sync:restore` | `file=<name>`; `path=<path>`; `version=<n>` | Service-coupled; excluded | Separate provider/state contract; no service implementation. |
| `sync:status` | — | Service-coupled; excluded | Separate provider/state contract; no service implementation. |
| `tab:open` | `group=<id>`; `file=<path>`; `view=<type>` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `tabs` | `ids` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `tag` | `name=<tag>`; `total`; `verbose` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `tags` | `file=<name>`; `path=<path>`; `total`; `counts`; `sort=count`; `format=json\|tsv\|csv`; `active` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `task` | `ref=<path:line>`; `file=<name>`; `path=<path>`; `line=<n>`; `toggle`; `done`; `todo`; `daily`; `status="<char>"` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `tasks` | `file=<name>`; `path=<path>`; `total`; `done`; `todo`; `status="<char>"`; `verbose`; `format=json\|tsv\|csv`; `active`; `daily` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `template:insert` | `name=<template>` | Later; mutation/design | Needs write, naming, settings, or recovery semantics. |
| `template:read` | `name=<template>`; `resolve`; `title=<title>` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `templates` | `total` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `theme` | `name=<name>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `theme:install` | `name=<name>`; `enable` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `theme:set` | `name=<name>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `theme:uninstall` | `name=<name>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `themes` | `versions` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `unresolved` | `total`; `counts`; `verbose`; `format=json\|tsv\|csv` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `vault` | `info=name\|path\|files\|folders\|size` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `vaults` | `total`; `verbose` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `version` | — | Supported subset | See the command contract and recorded Base cases. |
| `wordcount` | `file=<name>`; `path=<path>`; `words`; `characters` | Needs design | Unimplemented; characterize filesystem/settings/history dependencies. |
| `workspace` | `ids` | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `dev:cdp` | `method=<CDP.method>`; `params=<json>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `dev:console` | `clear`; `limit=<n>`; `level=log\|warn\|error\|info\|debug` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `dev:css` | `selector=<css>`; `prop=<name>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `dev:debug` | `on`; `off` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `dev:dom` | `selector=<css>`; `total`; `text`; `inner`; `all`; `attr=<name>`; `css=<prop>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `dev:errors` | `clear` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `dev:mobile` | `on`; `off` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `dev:screenshot` | `path=<filename>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
| `devtools` | — | Desktop-coupled; excluded | Requires active desktop UI or registered app state. |
| `eval` | `code=<javascript>` | Plugin/developer/UI; excluded | Requires desktop runtime or extension state. |
