import { WebRTC }     from './';

let WebrtcController = {};
let webrtc;

WebrtcController.openChannel = (options) => {

	return new Promise (async (resolve, reject) => {

		try {
			webrtc = new WebRTC ({
				connType         : options.connType,
				sendIceCandidate : options.sendIceCandidate,
				iceServersInfo   : options.iceServersInfo
			});

			await webrtc.initPeerConnection ();

			resolve ();
		}
		catch (err) {
			reject (err);
		}
	});
};

WebrtcController.closeChannel = () => {

	if (webrtc)
		return webrtc.closePeerConnection ();
};
	
WebrtcController.handleIce = (data) => {
	return webrtc.onIncomingICE (data.data.ice);
};

WebrtcController.handleOffer = (data) => {
	return webrtc.onIncomingSDP (data.data.sdp);
};

WebrtcController.toggleAudio = (data) => {
	return webrtc.toggleAudioTrack (data);
};

export default WebrtcController;
