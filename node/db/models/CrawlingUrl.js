// --------------------------------------
// Models: Crawling Url
module.exports = function( main, sequelize, Model, DataTypes ){

	class CrawlingUrl extends Model {}

	CrawlingUrl.init({
		// 使用者識別情報
		"user_id": {
			type: DataTypes.STRING,
		},
		"project_id": {
			type: DataTypes.STRING,
		},

		// URLスキーマ
		// 例: http, https
		"scheme": {
			type: DataTypes.STRING,
			allowNull: false
		},

		// ホスト名
		// ポート番号が指定される場合はそれも含む
		// 例: example.com
		// 例: example.com:3000
		// 例: user:passwd@example.com:3000
		"host": {
			type: DataTypes.STRING,
			allowNull: false
		},

		// ポート番号
		// 例: 80
		// 例: 443
		"port": {
			type: DataTypes.INTEGER,
			allowNull: false
		},

		// パス名
		// Getパラメータがある場合はそれも含む
		// 例: /foobar.html
		// 例: /foobar.html?a=b&c=d
		"path": {
			type: DataTypes.STRING,
			allowNull: false
		},

		// リクエストメソッド
		"request_method": {
			type: DataTypes.STRING,
		},

		// リクエストヘッダ
		"request_headers": {
			type: DataTypes.STRING,
		},

		// リクエストボディ
		"request_body": {
			type: DataTypes.TEXT,
		},

		// 状態
		// - null = 未取得
		// - progress = 実行中
		// - done = 実行済み
		"status": {
			type: DataTypes.STRING,
		},

		// 実行結果
		// - null = 未取得
		// - ok = 完了
		// - errored = エラーが発生
		// - ignored = 対象範囲外
		"result": {
			type: DataTypes.STRING,
		},

		// エラーメッセージ
		"error_message": {
			type: DataTypes.STRING,
		},

		// リクエスト日時
		"request_datetime": {
			type: DataTypes.DATE,
		},

		// レスポンスヘッダ
		"response_headers": {
			type: DataTypes.STRING,
		},

		// レスポンス Content-type
		"response_content_type": {
			type: DataTypes.STRING,
		},

		// レスポンス ドキュメントフォーマット
		// リンクを抽出する際のパーサーの選択に使います。
		// リンクの抽出をしない種類の場合、nullを格納します。
		// 例: html
		// 例: css
		"response_document_format": {
			type: DataTypes.STRING,
		},

		// レスポンスステータスコード
		"response_status": {
			type: DataTypes.INTEGER,
		},

		// レスポンスステータスメッセージ
		"response_status_message": {
			type: DataTypes.STRING,
		},

		// レスポンスボディ(base64)
		"response_body_base64": {
			type: DataTypes.TEXT,
		},

		// レスポンスサイズ
		"response_body_size": {
			type: DataTypes.INTEGER,
		},

		// レスポンスタイム (sec)
		"response_time": {
			type: DataTypes.FLOAT,
		},
	}, {
		sequelize,
		modelName: 'CrawlingUrl',
	});
	CrawlingUrl.sync({
		alter: true,
	});
	return CrawlingUrl;
}
