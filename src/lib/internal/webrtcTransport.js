/*eslint no-console: "off"*/

import {
	RTCPeerConnection,
	RTCIceCandidate,
	RTCSessionDescription,
	MediaStream,
	MediaStreamTrack,
	getUserMedia
}                                from 'react-native-webrtc';

class WebRTC {

	constructor (options) {

		if (!options.sendIceCandidate)
			throw new Error ('sendIceCandidate not defined');

		this.sendIceCandidate     = options.sendIceCandidate;
		this.onDataChannelInfo    = options.onDataChannelInfo;

		this.isReactNative        = options.isReactNative || true;

		this.connType             = options.connType || 'local';
		this.onStatus             = options.onStatus || null;

		this.iceServers           = this.connType === 'local' ? [ ] : options.iceServersInfo;
		this.rtc_configuration    = options.rtc_configuration || { iceServers : this.iceServers };
		this.default_constraints  = options.default_constraints || { video: false, audio: true };
		this.connect_attempts     = options.connection_attempts || 0;

		/* Internal properties */
		this.statuses             = [];
		this.peer_connection      = null;
		this.local_stream_promise = null;
		this.audio_stream         = null;

		this.RTCPeerConnection     = RTCPeerConnection;
		this.RTCIceCandidate       = RTCIceCandidate;
		this.RTCSessionDescription = RTCSessionDescription;
		this.MediaStream           = MediaStream;
		this.MediaStreamTrack      = MediaStreamTrack;
		this.getUserMedia          = getUserMedia;

		this.onError            = options.onError || null;

		this.setError           = this.setError.bind (this);
		this.setStatus          = this.setStatus.bind (this);
	}

	/**
	 * get default audio constraints
	 * @return Object 
	 */
	getAudioDefaults () {
	}

	/**
	 * Get the status history Array.
	 * @return {string[]} List of statuses.
	 */
	getStatuses () {
		return this.statuses;
	}

	/**
	 * Handle status string.
	 * @param {string} status - The status string.
	 */
	setStatus (status) {
		this.statuses.push (status);

		if (this.onStatus)
			this.onStatus (status);
		else
			console.log ("%cWebRTC:Status:", "color: green;", status);
	}

	/**
	 * Handle error string.
	 * @param {string} error - The error string.
	 */
	setError (error) {
		if (this.onError)
			this.onError (error);
		else
			console.error ("%cWebRTC:Error:", "color: green;", error);
	}

	closePeerConnection () {
		this.setStatus ('Disconnected from Peer, Closing');

		if (!this.peer_connection)
			return;

		this.peer_connection.close ();
		this.peer_connection = null;
	}

	/**
	 * SDP offer received from peer, set remote description and create an answer.
	 * @param {Object} sdp - The Session Description object.
	 */
	onIncomingSDP (sdp) {
		let __this = this;

		return new Promise (async (resolve, reject) => {

			try {
				sdp = new __this.RTCSessionDescription (sdp);

				__this.setStatus ("onIncomingSDP");

				await __this.peer_connection.setRemoteDescription (sdp);

				__this.setStatus ('Remote SDP set');

				if (sdp.type !== 'offer') 
					throw new Error ('invalid offer');

				__this.setStatus ('Got SDP offer');

				__this.setStatus ('Adding local stream');
				__this.peer_connection.addStream (__this.audio_stream);

				__this.setStatus ('Got local stream, creating answer');

				let pre_answer = await __this.peer_connection.createAnswer ();

				let final_answer = await __this.onLocalDescription (pre_answer);

				resolve (final_answer);
			}
			catch (err) {
				let error = err;

				if (typeof error === "undefined" || !error)
					error = 'Audio connection error'; 

				__this.setError (error);

				reject (error);
			}
		});
	}

	/**
	 * ICE candidate received from peer, add it to the peer connection.
	 * @param {Object} ice - The ICE Candidate object.
	 */
	onIncomingICE (ice) {
		let __this = this;

		return new Promise (async (resolve, reject) => {

			try {
				let candidate = new __this.RTCIceCandidate (ice);

				if (!__this.peer_connection)
					resolve ();

				await __this.peer_connection.addIceCandidate (candidate);
				__this.setStatus ("Remote Ice Candidate added.");

				resolve ();
			}
			catch (err) {
				let error = err;

				if (typeof error === "undefined" || !error)
					error = 'Audio connection error'; 

				__this.setError (error);

				reject (error);
			}
		});
	}

	/**
	 * Local description was set, send it to peer.
	 * @param {Object} desc - The Session Description Object.
	 */
	onLocalDescription (desc) {
		let __this = this;

		console.log ({desc : desc}, 'description recieved for sending to remote');
		let modifiedSdp = this.setPacketTime (desc.sdp, 10);
		desc.sdp = modifiedSdp;

		return new Promise (async (resolve, reject) => {

			try {
				__this.setStatus ('Got local description: ' + JSON.stringify (desc));
				await __this.peer_connection.setLocalDescription (desc);

				resolve ({
					sdp : __this.peer_connection.localDescription
				});
			}
			catch (err) {
				reject (err);	
			}
		});
	}

	setPacketTime (sdp, ptime) {
		if (!ptime)
			ptime = 10;

		const pLine = `a=ptime:${ptime}\r\n`;
		const maxpLine = `a=maxptime:${ptime}\r\n`;
		sdp = sdp + pLine + maxpLine;

		return sdp;
	}

	toggleAudioTrack (isEnabled) {
		this.audio_stream.getAudioTracks ()[0].enabled = isEnabled;
	}

	onIceCandidate (event) {
		/* Send  Local ICE Candidates on getting them */
		if (event.candidate === null) {
			this.setStatus ('ICE Candidate was null, done');
			return;
		}

		this.setStatus ('Sending ICE Candidate using sendIceCandidate callback');
		this.sendIceCandidate ({ ice: event.candidate });
	}

	/**
	 * Get User Media from navigator.MediaDevices.
	 * @return {Object} The local Stream.
	 */
	getLocalStream () {
		let __this = this;

		return new Promise (async (resolve, reject) => {

			try {
				let constraints = __this.default_constraints;

				__this.audio_stream = await __this.getUserMedia (constraints);
				__this.audio_stream.getAudioTracks ()[0].enabled = false;

				resolve ();
			}
			catch (err) {
				__this.setError (err);

				reject ({ status_code : 5001, message : 'Audio permission refused on the device.' });
			}
		});
	}

	/*
	 * Initialize Peer Connection in the beginning
	 * Peer Connection is needed to:
	 * <pre>
	 * 1. Set Remote Session Description (offer)
	 * 2. Set Remote ICE Candidates
	 * 3. Get Local Session Description (answer)
	 * 4. Get Local ICE Candidates
	 * </pre>
	 * @param {Object} msg - The message Object from ws.
	 */
	initPeerConnection () {
		let __this = this;

		return new Promise (async (resolve, reject) => {

			try {

				if (__this.peer_connection)
					return resolve ();

				/* Reset connection attempts because we connected successfully */
				__this.connect_attempts = 0;

				__this.setStatus ('Creating RTCPeerConnection with' + JSON.stringify (__this.rtc_configuration));

				__this.peer_connection = new __this.RTCPeerConnection (__this.rtc_configuration);

				__this.setStatus ('new RTCPeerConnection created');

				/* Send our audio to the other peer */
				await __this.getLocalStream ();

				__this.peer_connection.onicecandidate = __this.onIceCandidate.bind (__this);
				__this.setStatus ('Created peer connection for call, waiting for SDP');

				resolve ();
			}
			catch (err) {
				let error = err;

				if (typeof error === "undefined" || !error)
					error = 'Audio connection error'; 

				__this.setError (error);

				reject (error);
			}
		});
	}

}

export default WebRTC;
