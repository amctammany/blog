# Tocular

> A table of contents generator for markdown.


## Getting Started

```js
var tocular = require('tocular');

\\ From markdown file
var mdPath = '../path/to/markdown.md';
var toc = tocular.open(mdPath);

\\ Or from text
var md = '# Heading \n ## Subheading'
var toc = tocular(md);

```


## Example
```md
# Heading 1
## Sub-Heading 1A
## Sub-Heading 1B
# Heading 2
## Sub-Heading 2A
### Sub-Sub-Heading 2A1
## Sub-Heading 2B
```

Feeding the above markdown block into `tocular()` will produce the following markdown
```
*  [Heading 1](#heading1)
  *  [Sub-Heading 1A](#subheading1a)
  *  [Sub-Heading 1B](#subheading1b)
*  [Heading 2](#heading2)
  *  [Sub-Heading 2A](#subheading2a)
    *  [Sub-Heading 2A1](#subheading2a1)
  *  [Sub-Heading 2B](#subheading2b)
```

Resulting in a properly formatted table of contents.

*  [Heading 1](#heading1)
  *  [Sub-Heading 1A](#subheading1a)
  *  [Sub-Heading 1B](#subheading1b)
*  [Heading 2](#heading2)
  *  [Sub-Heading 2A](#subheading2a)
    *  [Sub-Heading 2A1](#subheading2a1)
  *  [Sub-Heading 2B](#subheading2b)

