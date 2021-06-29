(function(global, factory) {
    if(typeof module !== 'undefined' && module){
        module.exports = factory()
        return
    }
    global.MiniPromise = factory()
}(this || window, function(){


    var STATUS_PENDING = 0, STATUS_RESOLVED = 1, STATUS_REJECTED = 2;
    function __miniPromise(delegate_){
        this.status = STATUS_PENDING;
        this.userToken = null;
        this.exception = null;
        this._then = null;
        this._catch = null;
        this._next = null;

        if(!delegate_) return;
        _this = this;
        delegate_(function resolve(result){
            _this.resolve(result);
        }, function reject(throwable){
            _this.reject(throwable);
        });
    }
    __miniPromise.prototype.reject = function(throwable){
        this.exception = throwable
        this.status = STATUS_REJECTED
        if(this._next && this._next._catch){
            this._next._catch(this.exception);
            return;
        }
        if(this._catch){
            this._catch(this.exception);
            return;
        }
        throw throwable
    }
    __miniPromise.prototype.resolve = function(userToken){
        this.userToken = userToken
        this.status = STATUS_RESOLVED
        if(this._then){
            var returned = this._then(userToken)
            var that = this;
            if(returned instanceof __miniPromise){
                returned.then(function (res) {
                    that._next.resolve(res);
                }).catch(function(throwable) {
                    that._next.reject(throwable);
                })
                return;
            }
            this._next.resolve(returned);
        }
    }
    __miniPromise.prototype.then = function(cb) {
        if(this.status === STATUS_RESOLVED){
            var returned = cb(_this.userToken)
            if(returned instanceof __miniPromise){
                return this._next = returned;
            }
            return this._next = __miniPromise.resolve(returned);
        }
        
        if(this.status === STATUS_REJECTED){
            return this._next = __miniPromise.reject(this.exception);
        }
        this._then = cb;
        return this._next = new __miniPromise();
    };
    __miniPromise.prototype.catch = function(cb){
        this._catch = cb;
    }

    __miniPromise.resolve = function(userToken){
        var promise = new __miniPromise();
        setTimeout(() => {
            promise.resolve(userToken)
        }, 0);
        return promise;
    }

    __miniPromise.reject = function(userToken){

        var promise = new __miniPromise();
        setTimeout(() => {
            promise.reject(userToken)
        }, 0);
        return promise;
    }
    return __miniPromise;
}));