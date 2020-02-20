# Webpack Custom Path Resolver

.  
└── src  
    ├── assets  
    │   └── sample-icon.jpg  
    ├── components  
    │   └── sample-component.js  
    ├── custom-dir  
    │   ├── assets  
    │   │   └── sample-icon.jpg  
    │   └── components  
    │       └── sample-component.js  
    └── index.js  

Content index.js:
```js
import image from 'assets/sample-icon.jpg';
import { DemoComponent } from 'components/sample-component.js';

...
```

This module, resolve original ``sample-icon.jpg`` and ``sample-component.js`` from `custom-dir`, if they exist.

**NOTE:**  
Using babel module resolver plugin (`.babelrc`)
```js
[
    "module-resolver",
    {
        "alias": {
            "assets": "./src/assets",
            "components": "./src/components",
        }
    }
]
```

PS: For import original module from resolved, use relative path instead alias, in other cases, use aliases.

## Installation & Usage

First, install the npm module.

```sh
npm install --save-dev @lomray/webpack-custom-path-resolver
```

Next, enable hot reloading in your webpack config:  
1. Import in webpack.config.js:
    ```js
    const CustomPathResolver = require('@lomray/webpack-custom-path-resolver')
    ```
2. Add the module to the `resolve` / `plugins` array:
    ```js
    resolve: {
       symlinks: false,
       plugins: [
           new CustomPathResolver({
                customizationDir: path.resolve(`./src/custom-dir`),
                sourceDir:        path.resolve('./src'),
           }),
       ],
    }
    ```

And you're all set!
