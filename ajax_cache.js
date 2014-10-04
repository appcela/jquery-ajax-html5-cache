// comes from this repository: github.com/paulirish/jquery-ajax-localstorage-cache

$.ajaxPrefilter(function(options, originalOptions, jqXHR){
	// Cache it ?
	if( ! window.localStorage || ! options.localCache)
		return;

	// cache ttl in seconds
	var ttl = options.cacheTTL || 60,
	    cached = localStorage.getItem(options.cacheKey);

	if( ! options.forceCache){
		if(cached){
                        var cachedTTL = localStorage.getItem(options.cacheKey+".ttl");
			// if cache expired
			if(cachedTTL < new Date().getTime()){
				localStorage.removeItem(options.cacheKey);
                                localStorage.removeItem(options.cacheKey+".ttl");
			}else{
				options.success(cached);
				// Abort is broken on JQ 1.5 :(
				jqXHR.abort();
				return;
			}
		}
	}

	// start the request
	//If it not in the cache, we change the success callback, just put data on localstorage and after that apply the initial callback
	if(options.success){
		options.realsuccess = options.success;
	}

	options.success = function(data){
		var strdata = data,
		    cacheTTL = new Date().getTime() + 1000 * ttl;
                    
		// Save the data to localStorage catching exceptions (possibly QUOTA_EXCEEDED_ERR)
		try{
			localStorage.setItem(options.cacheKey, strdata);
                        localStorage.setItem(options.cacheKey+".ttl", cacheTTL);
		}catch(e){
			// Remove any incomplete data that may have been saved before the exception was caught
			localStorage.removeItem(options.cacheKey);
                        localStorage.removeItem(options.cacheKey+".ttl");
			if(options.cacheError)
				options.cacheError(e, options.cacheKey, strdata);
		}

		if (options.realsuccess)
			options.realsuccess(data);
	}
})
