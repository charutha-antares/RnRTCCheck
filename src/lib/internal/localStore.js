import AsyncStorage       from '@react-native-community/async-storage';

const LocalStore = {};

LocalStore.set = (key, value) => {

	return new Promise (async (resolve, reject) => {

		try {
			value = JSON.stringify (value);

			await AsyncStorage.setItem (key, value);

			resolve ('localstore : set ok');
		}
		catch (err) {
			reject ({ message : 'localstore : set fail', error : err });	
		}
	});
};

LocalStore.get = (key) => {

	return new Promise (async (resolve, reject) => {

		try {
			let result = await AsyncStorage.getItem (key);

			result = JSON.parse (result); 

			resolve (result);
		}
		catch (err) {
			reject ({ message : 'localstore : get fail', error : err });	
		}
	});
};

LocalStore.multiRemove = (arrayOfKeys) => {

	return new Promise (async (resolve, reject) => {

		try {
			await AsyncStorage.multiRemove (arrayOfKeys);

			resolve ('localstore : remove ok');
		}
		catch (err) {
			reject ({ message : 'localstore : remove fail', error : err });	
		}
	});
};

export default LocalStore;
