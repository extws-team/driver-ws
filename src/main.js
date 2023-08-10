
import ExtWSDriver         from '@extws/server/driver'; // eslint-disable-line import/no-unresolved, import/extensions
import IP                  from '@kirick/ip';
import { WebSocketServer } from 'ws';

import ExtWSWSClient from './client.js';

export default class ExtWSWSDriver extends ExtWSDriver {
	#server;
	#groups = new Map();

	constructor({
		path = '/ws',
		port,
		payload_max_length,
	}) {
		super();

		this.#server = new WebSocketServer({
			port,
			path,
			perMessageDeflate: false,
			maxPayload: payload_max_length,
		});

		this.#server.on(
			'connection',
			(ws_client, request) => {
				const client = new ExtWSWSClient(
					ws_client,
					this,
					{
						url: new URL(
							request.url,
							'ws://' + request.headers.host,
						),
						headers: new Headers(request.headers),
						ip: new IP(request.socket.remoteAddress),
					},
				);

				ws_client.on(
					'message',
					(payload) => {
						this.onMessage(
							client,
							payload,
						);
					},
				);

				ws_client.on(
					'close',
					() => {
						client.disconnect(
							true, // is_already_disconnected
						);
					},
				);

				this.onConnect(client);
			},
		);
	}

	addToGroup(client, group) {
		if (this.#groups.has(group) !== true) {
			this.#groups.set(
				group,
				new Set(),
			);
		}

		this.#groups.get(group).add(client);
	}

	removeFromGroup(client, group) {
		if (this.#groups.has(group)) {
			this.#groups.get(group).delete(client);
		}
	}

	publish(channel, payload) {
		if (this.#groups.has(channel)) {
			for (const client of this.#groups.get(channel)) {
				client.sendPayload(payload);
			}
		}
	}
}
