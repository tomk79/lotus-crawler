module.exports = function( main ){
    const options = main.get_options();
    const utils79 = require('utils79');
    const fs = require('fs');
    const fsEx = require('fs-extra');
    const request = require('request');
    const dateformat = require('dateformat');

    this.download = function(urlInfo, callback){

        const uri = urlInfo.scheme+'://'+urlInfo.host+urlInfo.path;
        const tmpFilename = options.path_data_dir + 'tmp.download';

        // console.log('--- Downloading:', urlInfo.id, uri);

        let start_time = Date.now();
        let request_datetime = dateformat(new Date(), 'isoDateTime');


        request.head(uri, function(err, res, body){
            // console.log(err, res, body);
            // console.log('content-type:', res.headers['content-type']);
            // console.log('content-length:', res.headers['content-length']);

            request(uri)
                .pipe(fs.createWriteStream(tmpFilename))
                .on('close', function(){

                    let end_time = Date.now();
                    let bin = fs.readFileSync( tmpFilename ).toString();
                    let base64 = utils79.base64_encode(bin);
                    fs.unlinkSync( tmpFilename );

                    let contentType = res.headers['content-type'];
                    contentType = contentType.replace( /\;[\s\S]*$/, '' );

                    callback( {
                        "request_datetime": request_datetime,
                        "status_code": res.statusCode,
                        "status_message": res.statusMessage,
                        "content_type": contentType,
                        "size": bin.length,
                        "base64": base64,
                        "headers": res.headers,
                        "time": (end_time - start_time) * 1000,
                    } );
                });
        });

        // setTimeout(function(){
        //     callback();
        // }, 1000);
    }
}
