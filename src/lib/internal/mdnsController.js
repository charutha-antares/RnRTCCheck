import Zeroconf             from 'react-native-zeroconf';

import {commonConfig}           from '../../common/config';

class MdnsController {

	constructor (options) {
		if (!options.onServiceResolve)
			throw new Error ('mdns controller error : "onServiceResolve" not defined.');

		if (!options.onServiceRemove)
			throw new Error ('mdns controller error : "onServiceRemove" not defined.');

		if (!options.onServiceStop)
			throw new Error ('mdns controller error : "onServiceStop" not defined.');
		
		if (!options.onServiceStart)
			throw new Error ('mdns controller error : "onServiceStart" not defined.');

		this.onResolve = options.onServiceResolve;
		this.onRemove  = options.onServiceRemove;
		this.onStop    = options.onServiceStop;
		this.onStart   = options.onServiceStart;

		this.serviceType      = 'biamp-dp';
		this.serviceprotocol  = 'tcp';
		this.servicedomain    = 'local';

		this.deviceListenersActive = false;
		this.active = false;

		this.init ();
	}

	init () {
		let __this = this;

		this.zeroconf = new Zeroconf ();
	
		this.zeroconf.on ('start', () => {
			console.log ('zeroconf : scan started');

			__this.active = true;
			
			__this.onStart ();
		});

		this.zeroconf.on ('stop', () => {
			console.log ('zeroconf : scan stopped');

			__this.zeroconf.removeDeviceListeners ();

			__this.deviceListenersActive = false;
			__this.active = false;

			__this.onStop ();
		});

		this.zeroconf.on ('resolved', service => {
			console.log ('zeroconf : scan resolved', service);
			let __host  = service.txt ? service.txt.us : service.host;
			let __name  = service.name;
			let __proto = __this.serviceProto || commonConfig.sessionProto;
			let __port  = __this.servicePort || commonConfig.sessionPort;

			if (__host === '0.0.0.0')
				__host = service.addresses[0];

			__this.onResolve ({
				host  : __host,
				proto : __proto,
				port  : __port,
				name  : __name
			});
		});

		this.zeroconf.on ('remove', service => {
			console.log ('zeroconf : service removed', service);

			__this.onRemove (service);
		});

		this.zeroconf.on ('error', err => {
			console.log ('zeroconf : error', err);
		});

		this.deviceListenersActive = true;
	}

	deinit () {
		this.stop ();
	}

	start () {
		if (this.active)
			return;

		if (!this.deviceListenersActive)
			this.zeroconf.addDeviceListeners ();
		
		this.zeroconf.scan (this.serviceType, this.protocol, this.domain);
	}

	stop () {
		this.zeroconf.stop ();
	}

}

export default MdnsController;
