# Lotus Crawler

Lotus Crawler は、ウェブサイトを巡回し、コンテンツをデータベースに記録するクローリングツールです。

## Install

```
npm install --save @tomk79/lotus-crawler;
```

## Usage

```js
const LotusCrawler = require('@tomk79/lotus-crawler');
const lotus = new LotusCrawler({

    // --------------------------------------
    // ユーザーとプロジェクトのID
    // 複数のユーザーやプロジェクトが想定される場合に指定する。
    user_id: 'any_string', // optional
    project_id: 'any_string', // optional

    // --------------------------------------
    // 巡回時に送信される User-Agent 名
	user_agent: 'Mozilla/5.0 Test Agent',

    // --------------------------------------
    // 巡回対象に含める範囲
	ranges: [
		'http://127.0.0.1:3000/',
		'http://127.0.0.1:3001/',
		'http://127.0.0.1:3002/'
	],

    // --------------------------------------
    // 巡回対象から除外する範囲
	ignores: [
		'http://127.0.0.1:3000/',
		'http://127.0.0.1:3001/',
		'http://127.0.0.1:3002/'
	],

    // --------------------------------------
    // データを保存するディレクトリ
    path_data_dir: "/path/to/your/directory/",

    // --------------------------------------
    // データベース接続情報
    db: {
		driver: "sqlite",
		database: "/path/to/your/directory/database.sqlite",
        prefix: "tableNamePrefix",
    }

});
```

最初のURLを登録する。

```js
lotus.add_target_url(
    'http://127.0.0.1:3000/',
    'GET',
    {
        headers: {}
        body: ''
    }
    )
    .them( () => {
        console.log('done.');
    } );
```

巡回を開始する。

```js
lotus.crawl()
    .then( () => {
        console.log('done.');
    } );
```

巡回を開始する。

```js
lotus.export(
    '/path/to/export_dir/'
    )
    .then( () => {
        console.log('done.');
    } );
```


## 更新履歴 - Change log

### Lotus Crawler v0.0.2 (リリース日未定)

- オプション `db.prefix` を追加。

### Lotus Crawler v0.0.1 (2021年5月8日)

- Initial Release.


## ライセンス - License

MIT License


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
