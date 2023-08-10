
import ExtWSClient from '@extws/server/client'; // eslint-disable-line import/no-unresolved, import/extensions

export default class ExtWSWSClient extends ExtWSClient {
	#ws_client;

	constructor(
		ws_client,
		...args
	) {
		super(...args);

		this.#ws_client = ws_client;
	}

	addToGroup(group) {
		this.driver.addToGroup(
			this,
			group,
		);
	}

	removeFromGroup(group) {
		this.driver.removeFromGroup(
			this,
			group,
		);
	}

	sendPayload(payload) {
		try {
			this.#ws_client.send(payload);
		}
		catch {
			this.disconnect();
		}
	}

	disconnect(
		is_already_disconnected = false,
		hard = false,
	) {
		if (hard === true) {
			try {
				this.#ws_client.terminate();
			}
			catch {}
		}
		else if (is_already_disconnected !== true) {
			try {
				this.#ws_client.close();
			}
			catch {}
		}

		super.disconnect();
	}
}
