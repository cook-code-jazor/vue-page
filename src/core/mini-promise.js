(function(global, factory) {
    if(typeof module !== 'undefined' && module){
        module.exports = factory()
        return
    }
    global.MiniPromise = factory()
}(this || window, function(){   
    'use strict';

    var STATUS_PENDING = 0, STATUS_RESOLVED = 1, STATUS_REJECTED = 2;
    var idGen = 0;
    function __miniPromise(delegate_){
        this.id = idGen++;
        this.status = STATUS_PENDING;
        this.userToken = null;
        this.exception = null;
        this._then = null;
        this._catch = null;
        this._finally = null;
        this._next = null;

        if(!delegate_) return;
        var _this = this;
        delegate_(function (result){
            _this.resolve(result);
        }, function (throwable){
            _this.reject(throwable);
        });
    }
    __miniPromise.prototype.__checkCatch = function(throwable){
        if(this._next){
            this._next.__checkCatch(throwable);
            return;
        }
        try{
            if(this._catch){
                this._catch(throwable)
                return;
            }
            throw throwable
        }finally{
            this._finally && this._finally();
        }
    }
    __miniPromise.prototype.reject = function(throwable){
        this.exception = throwable
        this.status = STATUS_REJECTED
        var this_ = this;
        setTimeout(function() {this_.__checkCatch(throwable) ;}, 0);
    }
    __miniPromise.prototype.resolve = function(userToken){
        this.userToken = userToken
        this.status = STATUS_RESOLVED
        var this_ = this;
        setTimeout(function(){
            if(!this_._then) {
                this_._finally && this_._finally();
                return;
            }
            try{
                    var returned = this_._then(userToken);
                    if(returned instanceof __miniPromise){
                        returned.then(function (res) {
                            this_._next.resolve(res);
                        }).catch(function(throwable) {
                            this_._next.reject(throwable);
                        })
                        return;
                    }
                    this_._next.resolve(returned);
            }catch(ex){
                this_._next.reject(ex);
            }
        }, 0);
    }
    __miniPromise.prototype.then = function(cb) {
        if(this.status === STATUS_RESOLVED){
            try{
                var returned = cb(this.userToken)
                if(returned instanceof __miniPromise){
                    return this._next = returned;
                }
                return this._next = __miniPromise.resolve(returned);
            }catch(ex){
                return this._next = __miniPromise.reject(ex);
            }
        }
        
        if(this.status === STATUS_REJECTED){
            return this._next = new __miniPromise();
        }
        this._then = cb;

        return this._next = new __miniPromise();
    };
    __miniPromise.prototype.catch = function(cb){
        this._catch = cb;
        return this;
    }
    __miniPromise.prototype.finally = function(cb){
        this._finally = cb;
    }

    __miniPromise.resolve = function(userToken){
        return new __miniPromise(function(resolve, reject){
            resolve(userToken)
        });
    }

    __miniPromise.reject = function(throwable){
        return new __miniPromise(function(resolve, reject){
            reject(throwable)
        });
    }
    __miniPromise.all = function(promise){
        var promises = [];
        if(promise instanceof Array){
            promises = promise;
        }else{
            promises = Array.prototype.slice.call(arguments, 0);
        }

        return new __miniPromise(function(resolve, reject){

            var succeed = [];
            var failed = [];
            var finished = 0;

            function setResult(){
                finished++;
                if(finished === promises.length ){
                    if(failed.length > 0) reject(failed)
                    else resolve(succeed)
                }
            }


            for(var i = 0; i < promises.length; i++){
                (function(p, idx){
                    p.then(function(res) {
                        succeed[idx] = res;
                        setResult();
                    }).catch(function(throwable){
                        failed[idx] = throwable;
                        setResult();
                    })
                })(promises[i], i);
            }

        });

    };
    return __miniPromise;
}));