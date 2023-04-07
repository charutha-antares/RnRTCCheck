import RNFetchBlob from 'rn-fetch-blob';

const xhr = {};

const defaultOptions = {
	timeout     : 15000,
	contentType : 'application/json',
};

xhr.get = (url, payload, options) => {
	options = options || {};

	return new Promise (async (resolve, reject) => {

		try {
			let response = await RNFetchBlob.config ({
				timeout   : defaultOptions.timeout,
				trusty    : true,
				...options,
			})
				.fetch (
					'GET',
					url,
					{
						Accept         : 'application/json',
						'Content-Type' : options.contentType || defaultOptions.contentType,
					}
				);

			let statusCode = response.respInfo.status || response.status_code;
			let data       = response.data ? JSON.parse (response.data) : response.data;

			if (statusCode >= 400 && statusCode < 600)
				throw (response);

			resolve (data);
		}
		catch (err) {
			reject (err);
		}
	});
};

xhr.post = (url, payload, options) => {
	options = options || {};

	return new Promise (async (resolve, reject) => {

		try {
			let response = await RNFetchBlob.config ({
				timeout   : defaultOptions.timeout,
				trusty    : true
			})
				.fetch (
					'POST',
					url,
					{
						Accept         : 'application/json',
						'Content-Type' : options.contentType || defaultOptions.contentType,
					},
					JSON.stringify (payload)
				);

			let statusCode = response.respInfo.status || response.status_code;
			let data       = response.data ? JSON.parse (response.data) : null;

			if (statusCode >= 400 && statusCode < 600)
				throw (response);

			resolve (data);
		}
		catch (err) {
			reject (err);
		}
	});
};

xhr.put = (url, payload, options) => {
	options = options || {};

	return new Promise (async (resolve, reject) => {

		try {
			let response = await RNFetchBlob.config ({
				timeout   : defaultOptions.timeout,
				trusty    : true
			})
				.fetch (
					'PUT',
					url,
					{
						Accept         : 'application/json',
						'Content-Type' : options.contentType || defaultOptions.contentType,
					},
					JSON.stringify (payload)
				);

			let statusCode = response.respInfo.status || response.status_code;
			let data       = response.data ? JSON.parse (response.data) : null;

			if (statusCode >= 400 && statusCode < 600)
				throw (response);

			resolve (data);
		}
		catch (err) {
			reject (err);
		}
	});
};

export default xhr;
