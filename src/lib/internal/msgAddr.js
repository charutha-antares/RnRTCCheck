const MsgAddr = {};

MsgAddr.prepend = function (a, resource, instance) {
	let _a = a;
	let _instance = '';

	if (!_a)
		_a = '';

	if (instance)
		_instance = ':' + instance;

	return resource + _instance + '.' + _a;
};

MsgAddr.append = function (a, resource, instance) {
	let _a = a;
	let _instance = '';

	if (!_a)
		_a = '';

	if (instance)
		_instance = ':' + instance;

	return _a + '.' + resource + _instance;
};

MsgAddr.inspect_top = function (a) {
	if (!a)
		return null;

	let _a = a.split('.');
	let _o = _a[0].split(':');
	let _r = _o[0];
	let _i = _o[1] || 0; /* if there is no instance specified,default to zero */

	return {
		resource : _r,
		instance : _i
	};
};

MsgAddr.pop = function (a) {
	if (!a)
		return null;

	let _a = a.split('.');

	_a.splice(0, 1);
	return _a.join('.');
};

MsgAddr.user = function (a) {
	if (!a)
		return null;

	let _a = a.split('.');
	let user = _a.splice(0, 1)[0].split(':');
	if (user[0] !== 'user')
		return null;

	return user[1];
};


export default MsgAddr;
