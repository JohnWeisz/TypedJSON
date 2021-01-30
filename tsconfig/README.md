# TypedJSON's tsconfig
**[../tsconfig.json](../tsconfig.json)**    
Used by IDEs for languages services.

**[tsconfig.app.json](tsconfig.app.json)**    
Used by language services to interpret and check library source code.

**[tsconfig.app-base.json](tsconfig.app-base.json)**    
Governs all library source files. Used as base for production bundles and `tsconfig.app.json`.

**[tsconfig.app-strict.json](tsconfig.app-strict.json)**    
A more strict TypeScript configuration which might be annoying if used during development.

**[tsconfig.base.json](tsconfig.base.json)**    
tsconfig.json on which all other configs are based. Used to define settings across the whole
library.

**[tsconfig.bundle.cjs.json](tsconfig.bundle.cjs.json)**    
Production bundle. CommonJS module. Used by Node. `main` field in `package.json`.

**[tsconfig.bundle.esm.json](tsconfig.bundle.esm.json)**    
Production bundle. ECMAScript module with es2015 target. Used by bundlers. `es2015` field in
`package.json`.

**[tsconfig.bundle.esm5.json](tsconfig.bundle.esm5.json)**    
Production bundle. ECMAScript module with es5 target. Used by bundlers. `module` field in
`package.json`.

**[tsconfig.bundle.types.json](tsconfig.bundle.types.json)**  
Production bundle. Generates types.

**[tsconfig.lint.json](tsconfig.lint.json)**    
Used by eslint, see [.eslintrc.yaml](../.eslintrc.yaml).

**[tsconfig.spec.json](tsconfig.spec.json)**    
Governs all test files.

**[tsconfig.spec-strict.json](tsconfig.spec-strict.json)**    
A more strict TypeScript configuration which might be annoying if used during development.
