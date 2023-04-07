import NetInfo                     from '@react-native-community/netinfo';
import { NetworkInfo }             from 'react-native-network-info';
import { permManager }             from './';

class NetworkController {

	constructor (options) {
		if (!options.onNetworkChange)
			throw new Error ('app state controller error : "onAppStateChange" handle not defined.');

		this.myInfo              = null;
		this.onChange            = options.onNetworkChange;

		this.requestLocationPermission ();
		this.init ();
	}

	init () {
		let __this = this;

		NetInfo.addEventListener (state => {
			__this.update (state);
		});
	}

	deinit () {
		let __this = this;

		NetInfo.removeEventListener (state => {
			__this.update (state);
		});
	}

	async update () {

		try {
			let ssid         = await fetchSSIDInfo ();
			let networkState = await fetchNetworkState ();

			this.onChange ({
				...networkState,
				...ssid
			});
		}
		catch (err) {
			console.error (err);
		}
	}

	async requestLocationPermission () {
		try {
			await permManager.validateLocationPermission();
		}
		catch (err) {
			console.log ({err}, 'requestLocationPermission failed');
		}
		this.update();
	}

}

async function fetchSSIDInfo () {
	let wifiSSID = await NetworkInfo.getSSID ();

	return { ssid : wifiSSID };
}

async function fetchNetworkState () {
	let networkState = await NetInfo.fetch ();

	return networkState;
}

export default NetworkController;
