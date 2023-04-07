const Protocol = {};

let seq = 0;

class PDU {
	constructor (from, to, type, qualifier, data, _seq) {

		if ((type !== 'auth') &&
			(type !== 'req') &&
			(type !== 'info') &&
			(type !== 'ping') &&
			(type !== 'pong') &&
			(type !== 'ack'))
			throw new Error ('illegal protocol message type');

		if (typeof _seq === 'string')
			_seq = parseInt(_seq);

		this.v     = 1;
		this.seq   = typeof _seq !== 'undefined' ? _seq : seq++;
		this.type  = type;

		this.to    = to;
		this.from  = from;

		switch (type) {

			case 'ack':
				this.msg = {
					status : qualifier,
					data   : data
				};
				break;

			case 'auth':
			case 'req':
				this.msg = {
					command : qualifier,
					data    : data
				};
				break;

			case 'info':
				this.msg = {
					info_id : qualifier,
					info    : data
				};
				break;
		}
	}

	serialize () {
		var packet = {
			v    : this.v,
			seq  : this.seq,
			type : this.type,
			to   : this.to,
			from : this.from,
			msg  : this.msg
		};

		return JSON.stringify (packet);
	}

	toJSON () {
		var packet = {
			v     : this.v,
			seq   : this.seq,
			type  : this.type,
			to    : this.to,
			from  : this.from,
			msg   : this.msg,
		};

		return packet;
	}

	static parse (e) {

		var message = JSON.parse(e); 

		if (message.v !== 1)
			throw new Error ('illegal protocol v');

		if ((message.type !== 'auth') &&
			(message.type !== 'req') &&
			(message.type !== 'info') &&
			(message.type !== 'ping') &&
			(message.type !== 'pong') &&
			(message.type !== 'ack'))
			throw new Error ('illegal protocol message type');

		if (message.type !== 'pong' && message.type !== 'ping')
			if (!message.to || !message.from)
				throw new Error ('illegal protocol (from/to) address');

		if (message.type === 'pong')
			return new PDU (
				message.from,
				message.to,
				message.type,
				null,
				null,
				message.seq,
			);

		var qualifier = message.type === 'ack' ? message.msg.status : (message.type === 'req' ? message.msg.command : message.msg.info_id);
		var payload   = message.type === 'info' ? message.msg.info : message.msg.data;

		return new PDU (
			message.from,
			message.to,
			message.type,
			qualifier,
			payload,
			message.seq,
		);
	}
}

class RequestPDU extends PDU {
	constructor (from, to, command, data) {
		super (from, to, 'req', command, data);
	}
}

class InfoPDU extends PDU {
	constructor (from, to, info_id, data) {
		super (from, to, 'info', info_id, data);
	}
}

class Auth extends RequestPDU {
	constructor (data, conn_type) {
		let toAddress = conn_type === 'online' ? 'atom:master.controller.auth' : 'controller.auth';

		super ('-pre-auth', toAddress, 'authenticate-me', data);
	}
}

class PingPDU extends PDU {
	constructor (user_id) {
		super (`user:${user_id}`, 'controller', 'ping');
	}
}

class AckPDU extends PDU {

	constructor (messagePDU, status, data) {
		super (
			messagePDU.to,
			messagePDU.from,
			'ack',
			status,
			data,
			messagePDU.seq
		);
	}
}

Protocol.PDU        = PDU;
Protocol.Auth       = Auth;
Protocol.RequestPDU = RequestPDU;
Protocol.InfoPDU    = InfoPDU;
Protocol.AckPDU     = AckPDU;
Protocol.PingPDU    = PingPDU;

export default Protocol;
