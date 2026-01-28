# JSON Editor (Tree View)

Angular + Material + Tailwind 的 JSON 字符串编辑/树状展示小站。

## 功能

- 左侧：JSON 纯文本编辑，可一键隐藏；JSON 语法错误位置红色背景高亮。
- 右侧：可展开的树状结构，默认只展开第一层。
- 右侧类型高亮：string / number / boolean / null / array / object。
- 标签与增强展示：
	- 数字：尝试识别 `phone`、秒/毫秒时间戳（`time`），并在数字后方展示格式化时间。
	- 字符串：尝试识别时间戳/ISO 8601 时间（`time`）、网址（`link`）、邮箱（`email`）、颜色（`color`）。
	- `link`/`email` 会显示下划线，点击新标签页打开（邮箱为 `mailto:`）。

## 技术栈

- Angular (standalone)
- Angular Material
- Tailwind CSS

## Development server

To start a local development server, run:

```bash
pnpm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
pnpm build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
pnpm test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
