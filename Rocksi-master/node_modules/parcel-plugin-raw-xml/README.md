# parcel-plugin-raw-xml

> Parcel plugin for loading the raw content of an xml file as a string

## Installation

```sh
npm install --save-dev parcel-plugin-raw-xml
```

## Example

- `example.xml`

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <example>
    lorem ipsum
  </example>
  ```

- `index.js`

  ```js
  import xml from './example.xml';

  console.log(xml);
  ```
