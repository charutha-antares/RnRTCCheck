import AsyncStorage       from '@react-native-community/async-storage';
import { commonConfig } from '../../common/config';

const SavedAtomStore = {};

SavedAtomStore.set = (atom) => {

	return new Promise (async (resolve, reject) => {

		try {

			let atoms = await AsyncStorage.getItem ('manualAtoms');
			atoms = JSON.parse(atoms) || {};

			atoms[atom.name] = atom;
			atoms = JSON.stringify(atoms);

			await AsyncStorage.setItem ("manualAtoms", atoms);

			resolve ('atomlocalstore : set ok');
		}
		catch (err) {
			reject ({ message : 'atomlocalstore : insert fail', error : err });	
		}
	});
};

SavedAtomStore.delete = (key) => {

	return new Promise (async (resolve, reject) => {

		try {
			let atoms = await AsyncStorage.getItem ("manualAtoms");
            atoms = JSON.parse (atoms);

            delete atoms[key];
            atoms = JSON.stringify (atoms);
            await AsyncStorage.setItem ("manualAtoms", atoms);

            resolve ('atomLocalStore: delete ok');
		}
		catch (err) {
			reject ({ message : 'atomlocalstore : delete fail', error : err });	
		}
	});
};

SavedAtomStore.getAll = () => {

	return new Promise (async (resolve, reject) => {

		try {
			let storedAtoms = await AsyncStorage.getItem ("manualAtoms");
			storedAtoms = JSON.parse (storedAtoms) || {};
			
			let atoms = {};
			for(let key in storedAtoms){
				atoms[key] = {
					status : "passive",
					config : {
						name      : storedAtoms[key].name,
						host      : storedAtoms[key].addr,
						desc      : storedAtoms[key].desc,
						proto     : commonConfig.sessionProto,
						port      : commonConfig.sessionPort,
						createdAt : storedAtoms[key].createdAt,
						isScanned : storedAtoms[key].isScanned || false,
					}
				}
			}


			resolve (atoms);
		}
		catch (err) {
			reject ({ message : 'atomlocalstore : getAll fail', error : err });	
		}
	});
};

export default SavedAtomStore;
