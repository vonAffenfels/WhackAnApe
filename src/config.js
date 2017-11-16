import Phaser from 'phaser';

import Enums from './enums';

export default class GameConfig {
	constructor() {
		this._data = {
			game: {
				baseWidth: 320,
				baseHeight: 568,
				maxWidth: 768,
				width: "100%",
				height: "100%",
				enableDebug: false,
				backgroundColor: '#ffffff',
				renderer: Phaser.CANVAS,
				name: "WhackAnApe"
			},

			fontSize: {
				title: 			42,
				score: 			32
			},

			defaultState: 		Enums.States.BOOT,
			
			scoreGain:  		10,
			maxTime:			90,
			ratzChance: 		0.15,
			ratzFactor: 		3,

			// every X ms show a new head
			speed: 				[
				1500,
				1350,
				1200,
				1050,
				900,
				750,
				600,
				450,
				300
			],
			showChance: 		0.5
		};
	}

	get(key, def) {
		let keys = key.split(".");

		let curVal = this._data;
		while (keys.length > 0) {
			let curKey = keys.shift();
			if (!curVal.hasOwnProperty(curKey)) {
				return def;
			}

			curVal = curVal[curKey];
		}

		return curVal;
	}
}