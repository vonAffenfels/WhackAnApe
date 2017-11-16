import * as bluebird from "bluebird";

export default class GameSave {
	constructor(game) {
		this.game = game;

		this._data = {
			version: "vA-1.0.0",
			highscore: 0
		};

		this._load();
	}

	_load() {
		let saveState = localStorage.getItem(this.game.config.get("game.name"));
		if (!saveState) {
			return this._save();
		}
		
		let saveObj = JSON.parse(saveState);
		if (!saveObj) {
			return this._save();
		}

		if (!saveObj.version || saveObj.version != this._data.version) {
			return this._save();
		}

		this._data = saveObj;
	}

	loadHighscore() {
		if (!window.parent || window.parent == window) {
			return Promise.resolve();
		}

		return this.game.api.getHighscore().then((highscore) => {
			this._data.highscore = highscore;

			return Promise.resolve();
		});
	}

	_save() {
		localStorage.setItem(this.game.config.get("game.name"), JSON.stringify(this._data));
		this.game.api.saveHighscore(this._data.highscore);
	}

	get(key, def) {
		return this._data.hasOwnProperty(key) ? this._data[key] : def;
	}

	set(key, val) {
		this._data[key] = val;
		this._save();
	}
}