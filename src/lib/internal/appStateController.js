import { AppState }           from 'react-native';

class AppStateController {

	constructor (options) {
		if (!options.onAppStateChange)
			throw new Error ('app state controller error : "onAppStateChange" handle not defined.');

		this.myState  = null;
		this.onChange = options.onAppStateChange;
		this.onUpdate = this.update.bind (this);

		this.init ();
	}

	init () {
		AppState.addEventListener ('change', this.onUpdate); 
		
		this.set ();
	}

	deinit () {
		AppState.removeEventListener ('change', this.onUpdate);
	}

	set () {
		let currState = AppState.currentState.toLowerCase ();

		/* This handling because sometime unknowlingly it passes this unknown state 
		 * - this is a bug reported in react native "Appstate component" 
		 * - Bug discussion link => https://github.com/facebook/react-native/issues/18836
		 */
		if (currState === 'unknown')
			return;
		
		this.myState = convertState (currState); 
		this.onChange (this.myState);
	}

	update (newState) {
		newState = newState.toLowerCase ();

		/* This handling because sometime unknowlingly it passes this unknown state 
		 * - this is a bug reported in react native "Appstate component" 
		 * - Bug discussion link => https://github.com/facebook/react-native/issues/18836
		 */
		if (newState === 'unknown')
			return;

		newState = convertState (newState);

		if (newState === this.myState)
			return;

		this.myState = newState;
		this.onChange (this.myState);
	}

}

function convertState (state) {
	return ( state === 'active' ? 'foreground' : 'background' );
}

export default AppStateController;
