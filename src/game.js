import 'pixi';
import 'p2';
import Phaser from 'phaser';

import Enums from './enums';
import GameConfig from './config';
import * as States from './states';

class Game extends Phaser.Game {
	constructor() {
		let config = new GameConfig();
		super(config.get("game"));

		this.config = config;

		this.orientated = true;

		for (let stateName in Enums.States) {
			let state = Enums.States[stateName]
			this.state.add(state, States[state]);
		}

		this.state.start(this.config.get("defaultState"));
	}

	onEnterIncorrectOrientation() {
		this.orientated = false;
		document.getElementById('orientation').style.display = 'block';
	}

	onLeaveIncorrectOrientation() {
		this.orientated = false;
		document.getElementById('orientation').style.display = 'none';
	}
}

window.Game = Game;