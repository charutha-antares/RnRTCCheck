import DeviceInfo            from 'react-native-device-info';

import { Transport }         from './';

const EventController = {};
let transport         = {};

EventController.create = (payload, options) => {

	return new Promise (async (resolve, reject) => {

		try {
			if (!payload)
				throw new Error ('session join fail : payload undefined');

			let uuid = DeviceInfo.getUniqueId ();
			
			if (!uuid)
				throw new Error ('session join fail : no unique identification provided');

			transport = new Transport ({
				type           : options.type,
				socket_url     : options.socketUrl,
				on_req         : options.onReq,
				on_info        : options.onInfo,
				on_close       : options.onClose,
				ping_interval  : options.pingInterval,
				max_ping_drops : options.maxPingDrops
			});

			await transport.connect ();

			await transport.authenticate ({ identity : {
				id          : uuid,
				displayName : payload.user,
				avatar      : payload.avatar,
				entityType  : 'participant'
			}});

			resolve ();
		}
		catch (err) {
			reject (err);		
		}
	});
};

EventController.authenticate = (payload) => {
	return new Promise (async (resolve, reject) => {

		try {
			if (!payload)
				throw new Error('session join fail : payload undefined');

			let uuid = DeviceInfo.getUniqueId();

			if (!uuid)
				throw new Error('session join fail : no unique identification provided');

			await transport.authenticate ({ identity : {
				id          : uuid,
				displayName : payload.user,
				avatar      : payload.avatar,
				entityType  : 'participant'
			}});

			resolve ();
		} catch (err) {
			reject (err);
		}
	});
};

EventController.terminate = () => {
	return transport.terminate ();
};

EventController.sendRequest = (to, command, data, from) => {
	return transport.request (to, command, data, from);
};

EventController.sendInfo = (to, command, data, from) => {
	return transport.info (to, command, data, from);
};

export default EventController;
