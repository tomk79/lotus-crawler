module.exports = function( main ){
    this.download = function(urlInfo, callback){

        console.log('TODO: ダウンロード機能は未実装。');
        console.log(urlInfo.id, urlInfo.scheme+'://'+urlInfo.host+urlInfo.path);

        setTimeout(function(){
            callback();
        }, 1000);
    }
}
