/*eslint no-console: "off"*/

import { 
	Protocol,
	MsgAddr
}                       from './';

class Transport {

	constructor (options) {
		if (!options.socket_url)
			throw new Error ('socket_url not defined');

		if (!options.on_info)
			throw new Error ('on_info not defined');

		if (!options.on_req)
			throw new Error ('on_req not defined');

		this.ping_interval   = options.ping_interval || 30000; /*30 seconds */
		this.max_ping_drops  = options.max_ping_drops || 5;

		this.on_info         = options.on_info;
		this.on_req          = options.on_req;
		this.on_close        = options.on_close;

		this.wsCodes = {
			"1000" : "CLOSE_NORMAL",
			"1001" : "CLOSE_GOING_AWAY",
			"1002" : "CLOSE_PROTOCOL_ERROR",
			"1003" : "CLOSE_UNSUPPORTED",
			"1004" : "Reserved ",
			"1005" : "CLOSE_NO_STATUS",
			"1006" : "CLOSE_ABNORMAL",
			"1007" : "Unsupported Data",
			"1008" : "Policy Violation",
			"1009" : "CLOSE_TOO_LARGE",
			"1010" : "Missing Extension",
			"1011" : "Internal Error",
			"1012" : "Service Restart",
			"1013" : "Try Again Later",
			"1014" : "Reserved",
			"1015" : "TLS Handshake",
		};

		/* Internal properties */
		this.msg_q           = {};
		this.url             = options.socket_url;
		this.conn_type       = options.type || 'local';
		this.authenticated   = false;
		this.user_id         = null;
		this.missed_pongs    = 0;
		this.last_ping_sent  = -1;
		this.last_ping_acked = -1;
		this.vc_id           = null;
	}

	async connect () {
		let __this = this;

		return new Promise ((resolve, reject) => {

			__this.sock = new WebSocket (__this.url, {
				handshakeTimeout : 5000,
				rejectUnauthorized: false
			});

			__this.sock.onopen = () => {
				return resolve ();
			}; 

			__this.sock.onerror = (err) => {
				return reject (err);
			};

			__this.sock.onclose = (ev) => {
				let reason = __this.wsCodes[ev.code] ? __this.wsCodes[ev.code] : '****unknown****';

				if (!__this.on_close)
					return;

				__this.stopPingPong ();
				__this.on_close ({ status : ev.code, message : `session connect closed :=>  reason : ${reason}`});
			};

			__this.sock.onmessage = (ev) => {
				__this.incoming.call (__this, ev);
			};
		});
	}

	authenticate (options) {

		return new Promise (async (resolve, reject) => {

			try {
				let pdu  = new Protocol.Auth ({
					identity : options.identity,
				}, this.conn_type);

				let user = await this.send (pdu, true);

				this.vc_id         = user && user.vc_id;
				this.authenticated = true;

				this.startPingPong ();

				resolve ();
			}
			catch (err) {
				reject (err);
			}
		});
	}

	request (to, command, data, from) {

		return new Promise (async (resolve, reject) => {

			try {
				let { resource } = MsgAddr.inspect_top (to);

				if (resource !== 'user' && this.conn_type === 'online')
					to = MsgAddr.prepend (to, 'atom', 'master');

				if (!this.vc_id)
					throw new Error ('vc_id not set');

				from = from || `user:${this.vc_id}`;

				let pdu      = new Protocol.RequestPDU (from, to, command, data);
				let response = await this.send (pdu, true);

				resolve (response);
			}
			catch (err) {
				reject (err);
			}
		});
	}

	info (to, info_id, data, from) {

		return new Promise (async (resolve, reject) => {

			try {
				let { resource } = MsgAddr.inspect_top (to);

				if (resource !== 'user' && this.conn_type === 'online')
					to = MsgAddr.prepend (to, 'atom', 'master');

				if (!this.vc_id)
					throw new Error ('vc_id not set');

				from = from || `user:${this.vc_id}`;

				let pdu      = new Protocol.InfoPDU (from, to, info_id, data);
				let response = await this.send (pdu, false);

				resolve (response);
			}
			catch (err) {
				reject (err);
			}
		});
	}

	send (pdu, ack) {

		return new Promise ((resolve, reject) => {

			try {

				if (ack) {
					/*
					 * If an ACk is required then create and store
					 * a deferred, indexed by the sequence number of
					 * the message */
					var seq = pdu.seq.toString();

					this.msg_q[seq] = {};
					this.msg_q[seq]._d = {
						resolve : resolve,
						reject  : reject
					};
				}

				/*
				 * The socket.send does not throw any exception if the socket is closed (bad api). */
				if (this.sock.readyState !== 1)
					throw ({ origin : 'cc', code : 'ERR_SOCK_UNAVLBLE', msg : 'socket unavailable : state = ' + this.sock.readyState });

				this.sock.send (pdu.serialize ());

				if (!ack)
					resolve ();
			}
			catch (err) {
				reject (err);	
			}
		});
	}

	terminate (code) {
		if (!code)
			code = 1000;

		this.sock.close ({ code : code });
	}

	process_ack (message) {
		let seq = message.seq.toString();
		let msg = message.msg;

		if (!this.msg_q[seq] || !this.msg_q[seq]._d) {
			console.error ('RX: ACK: seq (' + seq + ') does not exist: message = ', message);
			return;
		}

		let _d = this.msg_q[seq]._d;

		if (!_d) {
			console.error ('warning : stray ACK recieved. ignoring.', message);
			return;
		}

		switch (msg.status) {
			case 'ok':
				_d.resolve(msg.data);
				break;

			case 'not-ok':
			case 'error':
				_d.reject(msg.data);
				break;

			default :
				console.error ('RX: ACK: illegal status (' + msg.status + '): message = ', message);
				_d.reject(msg.data);
				break;
		}

		delete this.msg_q[seq];
	}

	incoming (ev) {
		let pdu;

		try {
			pdu = Protocol.PDU.parse (ev.data);
		}
		catch (ex) {
			console.error ('incoming : protocol error = ', ex);
			return;
		}

		/*
		 * If the pdu is a 'pong' break off early before all other
		 * checks follow */

		if (pdu.type === 'pong')
			return this.processPong (pdu);

		/*
		 * remove the 'user:xxx', since no-one downstream needs to 
		 * know that */

		pdu.to = pdu.to.replace(/^user:[^.]+\./, '');

		switch (pdu.type) {

			case 'ack' : 
				this.process_ack (pdu); 
				break;

			case 'info' : 
				if (pdu.msg.info_id === 'session-info')
					this.vc_id = pdu.msg.info.sid;

				this.on_info (pdu.from, pdu.to, pdu.msg.info_id, pdu.msg.info);
				break;

			case 'req' : 
				this.deliver_req (pdu); 
				break;

			default : 
				console.log ('RX: illegal type (' + pdu.type + '): pdu =', pdu);
		}

		return;
	}

	async deliver_req (pdu) {
		let response;

		try {
			if (!this.on_req)
				throw new Error ('on_req undefined. cannot ACK.');

			console.log ('req pdu = ', pdu);

			response = await this.on_req (pdu.from, pdu.to, pdu.msg.command, pdu.msg.data, pdu);
			this.ack (pdu, 'ok', response);
		}
		catch (e) {
			this.ack (pdu, 'not-ok', e);
		}
	}

	async ack (pdu, status, data) {
		pdu.to = `user:${this.vc_id}.${pdu.to}`;
		let ack_pdu = new Protocol.AckPDU (pdu, status, data);

		try {
			await this.send (ack_pdu);
		}
		catch (err) {
			console.log ('ack failed : reason : ', err, err.stack);	
		}
	}

	/*
	 * Ping/Pong related routines
	 */

	startPingPong () {
		this.missed_pongs = 0;
		this.ping_timer   = setInterval (this.pingCheck.bind(this), this.ping_interval);
	}

	stopPingPong () {
		clearInterval (this.ping_timer);
	}

	async pingCheck () {

		if (this.last_ping_sent !== this.last_ping_acked)
			this.missed_pongs ++;

		if (this.missed_pongs >= this.max_ping_drops) {
			console.log (`WebSocket connection lost : (missing ${this.missed_pongs} pongs)`);

			clearInterval (this.ping_timer);
			this.sock.close ();
			return;
		}

		var pdu = new Protocol.PingPDU (this.vc_id);
		
		try {
			await this.send (pdu);
		}
		catch (err) {
			console.log (`WebSocket connection lost : reason : `, err, err.stack);

			clearInterval (this.ping_timer);
			this.sock.close ();
		}

		this.last_ping_sent = pdu.seq;
	}

	processPong (pdu) {
		this.last_ping_acked = pdu.seq;
		this.missed_pongs    = 0;
	}

}

export default Transport;
