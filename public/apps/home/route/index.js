;(function(){
    var Route = vaspa.RG()
    Route('/').name('index').view('index').label('首页')
    Route('/user').view('user/wrapper', true).group(function () {
        Route('index').view('user/index')
        Route('info/:userid').view('user/info1')
        Route('info').view('user/info')
    });
    Route('*').name('notfound').view('404').label('页面不存在')

    module.exports = Route.create();
})();