(function(global, factory) {
    if(typeof module !== 'undefined' && module){
        module.exports = factory()
        return
    }
    global.PollfillDependence = factory()
}(this || window, function(){
    function __construcor(){
	    var dependences = [];
	    var dependenced = 0;
	    var then_;

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
	    function checkThen(){
	        if(dependenced == dependences.length){
	            then_ && then_();
	        }
	    }
	    function require(dependence){
	        loadScript(dependence.url, function(){
	            dependence.dependenced = true;
	            dependenced++;
	            checkThen();
	        });
	    }
	    function when(condition, url){
	        if(!condition){
	            dependenced++;
	            dependences.push({url: url, dependenced: true});
	            return instance_;
	        }
	        var dependence = {url: url, dependenced: false};
	        dependences.push(dependence);
	        require(dependence);
            return instance_;
	    }

	    function then(cb){
	        if(dependenced == dependences.length){
	            cb();
	            return;
	        }
	        then_ = cb;
        }
        var instance_ = {
		    when: when,
		    then: then
	    };

	    return instance_
    }
    __construcor.create = function(){
        return __construcor();
    };


    return __construcor;
}));