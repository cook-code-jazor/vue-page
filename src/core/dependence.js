(function(global, factory) {
    if(typeof module !== 'undefined' && module){
        module.exports = factory()
        return
    }
    global.Dependence = factory()
}(this || window, function(){
    function __construcor(){
		var requires = [];
		function loadScript(url, charset, callback) {
			var script = document.createElement("script"),
				head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

			function dispose() {
				script.onload = script.onreadystatechange = null;
				if (script.parentNode) {
					script.parentNode.removeChild(script)
				}
				script = null
			}
			script.async = true;
			if (charset) {
				script.charset = charset
			}
			script.src = url;
			script.onload = script.onreadystatechange = function() {
				if (!script.readyState || /loaded|complete/.test(script.readyState)) {
					dispose();
					callback && callback(200)
				}
			};
			head.insertBefore(script, head.firstChild)
		}
		function when(condition, url){
			if(!condition) return instance_;
			requires.push(url);
			return instance_;
		}
	    function require(url){
            if(!(url instanceof Array)){
                url = Array.prototype.slice.call(arguments, 0);
            }
			Array.prototype.push.apply(requires, url);

            if(url.length == 0) return MiniPromise.resolve();

            var promises = [];
            for(var i = 0; i < requires.length;i++){
				(function(u){
					promises.push(new MiniPromise(function(resolve, reject){
						loadScript(u, 'utf-8', function(){
							resolve();
						});
					}));
				})(requires[i]);
            }
            return MiniPromise.all(promises).then(function(){ return __construcor()});
	    }
		
        var instance_ = {
		    require: require,
			when: when
	    };

	    return instance_
    }
    __construcor.require = function(){
        return __construcor().require.apply(null, arguments);
    };


    return __construcor;
}));