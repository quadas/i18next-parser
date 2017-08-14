This is forked from [i18next-parser](https://github.com/i18next/i18next-parser) for particular use.

Additional Features:

* respect gitignore
* use key name as its default value
* generate `_add.json` files for additional records
* `--patch` argument which automates the process of appending new translations

Known issues:

* As a quick hack, it relies on `git ls-files`, so the lib won't work out of git repo and untracked files cannot be seen by the tool


## Example
Assume we have a repo structured as below, and you have added another `i18n.t('Anything')` to `src/main.js`.

```
demo
├── locales
│   ├── cn
│   │   └── common.json
│   └── en
│       └── common.json
└── src
    └── main.js
```

### To generate `_add.json` file which only contains new translation records

`i18next src -o locales -n 'common' -l en,cn -r --write-old false -f 'i18n.t'`

After execution, a `common_add.json` file will get generated under `demo/locales/cn/`. And both `en/common.json`
and `cn/common.json` will get `"Anything": "Anything"` appended

```
// locales/en/common.json
{
  "Anything": "Anything",
  "Hello World": "Hello World"
}
```

```
// locales/cn/common.json
{
  "Anything": "Anything",
  "Hello World": "你好世界"
}
```

```
// locales/cn/common_add.json
{
  "Anything": "Anything"
}
```

### To update locale files with new translations

`i18next locales/cn --patch ./patch.json` where `patch.json` indicates:

```
{
  "Anything": "啥都行"
}
```

After execution, you'll find `locales/cn/common.json` updated to

```
{
  "Anything": "啥都行",
  "Hello World": "你好世界"
}
```
