import Phaser from 'phaser';

import Enums from '../enums';

export class LoadingState extends Phaser.State {
	constructor() {
		super();
	}

	preload() {
	    let loadingBar = this.add.sprite(this.world.centerX, this.world.centerY, "loading");
	    loadingBar.anchor.setTo(0.5,0.5);
	    this.load.setPreloadSprite(loadingBar);

	    this.game.load.image("button_start", "assets/images/button_start.png");
	    this.game.load.image("button_restart", "assets/images/button_neustart.png");
	    this.game.load.image("top_field", "assets/images/top_0x0.png");

	    this.game.load.spritesheet("geldsack", "assets/images/geldsack.png", 80, 80, 7);
	    this.game.load.spritesheet("knecht", "assets/images/bottom_knecht_ruprecht.png", 640, 856, 4);
	    this.game.load.spritesheet("ratz", "assets/images/ratz.png", 220, 190, 2);
	    this.game.load.spritesheet("juergen", "assets/images/juergen.png", 220, 190, 3);

	    this.game.load.bitmapFont("fnt_va", 'assets/fonts/fnt_va.png', 'assets/fonts/fnt_va.fnt');
	    this.game.load.bitmapFont("fnt_va_white", 'assets/fonts/fnt_va_white.png', 'assets/fonts/fnt_va_white.fnt');

		this.load.audio("klatsche", ["assets/sounds/klatsche.mp3"]);
		this.load.audio("ratz_fail", ["assets/sounds/ratz_fail.mp3"]);
	}

	create() {
		// set a blue color for the background of the stage
		this.game.stage.backgroundColor = this.game.config.get("game.backgroundColor");

		this.game.save.loadHighscore().then(() => {
			this.game.state.start(Enums.States.PLAY);
		});
	}
}