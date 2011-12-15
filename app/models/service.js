TuckerboxService.identifier = 'palm://com.apptuckerbox.service';

function TuckerboxService(){};

TuckerboxService.impersonate = function(callback, id, service, method, params)
{
    var request = new Mojo.Service.Request(TuckerboxService.identifier,
	{
	    method: 'impersonate',
		parameters:
		{
			"id": id,
			"service": service,
			"method": method,
			"params": params,
			"subscribe": params.subscribe? true : false
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TuckerboxService.encrypt = function(callback, userdata)
{
    var request = new Mojo.Service.Request(TuckerboxService.identifier,
	{
	    method: 'encrypt',
		parameters:
		{
			"userdata": userdata,
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TuckerboxService.getFile = function(callback, url, filename)
{
	var request = new Mojo.Service.Request(TuckerboxService.identifier,
	{
		method: 'getFile',
		parameters: {"url": url, "filename": filename},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
};

TuckerboxService.putFile = function(callback, contents, filename)
{
	var request = new Mojo.Service.Request(TuckerboxService.identifier,
	{
		method: 'putFile',
		parameters: {"contents": contents, "filename": filename},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
};

// Local Variables:
// tab-width: 4
// End:
