import {
	Linking, Alert
}                                   from 'react-native';
import {
	PERMISSIONS, RESULTS,
	openSettings, check,
	request
}                                   from 'react-native-permissions';
import i18n                         from '../../common/i18n';

const permManager = {};

permManager.validateMicPermission = async function () {
	const permissionQuery = Platform.select({
		android : PERMISSIONS.ANDROID.RECORD_AUDIO,
		ios     : PERMISSIONS.IOS.MICROPHONE,
	});
	try {
		await this.validatePermission(permissionQuery);
	}
	catch (err) {
		this.permAlert(i18n.t("alert:title.mic_perm"), i18n.t("alert:desc.mic_perm"));
		throw (err);
	}
}

permManager.validateLocationPermission = async function () {
	const permissionQuery = Platform.select({
		android : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
		ios     : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
	});
	try {
		await this.validatePermission(permissionQuery);
	}
	catch (err) {
		this.permAlert(i18n.t("alert:title.loc_perm"), i18n.t("alert:desc.loc_perm"));
		throw (err);
	}
}

permManager.validateCameraPermission = async function () {
	const permissionQuery = Platform.select({
		android : PERMISSIONS.ANDROID.CAMERA,
		ios     : PERMISSIONS.IOS.CAMERA
	});
	try {
		await this.validatePermission(permissionQuery);
	}
	catch (err) {
		this.permAlert(i18n.t("alert:title.camera_perm"), i18n.t("alert:desc.camera_perm"));
		throw (err);
	}
}

permManager.validatePermission = async function (permissionQuery) {
	let permStatus;
	try {
		permStatus = await check (permissionQuery);

		if (permStatus === RESULTS.GRANTED)
			return;

		if (permStatus !== RESULTS.DENIED)
			throw 'permission denied';

		let permissionResponse = await request (permissionQuery);

		if (permissionResponse !== RESULTS.GRANTED)
			throw 'permission denied';
	}
	catch (err) {
		console.log(err, { permStatus });
		throw err;
	}
}

permManager.permAlert = function (title, msg) {
	let alertButtons = [
		{
			text    : i18n.t("alert:action.settings"),
			onPress : Linking.openSettings
		},
		{
			text    : i18n.t("alert:action.cancel"),
			onPress : () => {}
		}
	];

	Alert.alert (title, msg,
		alertButtons,
		{ cancelable : false }
	);
}

export default permManager;
