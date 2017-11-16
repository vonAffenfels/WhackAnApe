import Phaser from 'phaser';

export default class CountdownObject extends Phaser.Group {
	constructor(game, x, y, countdownLength, beginSize, endSize) {
		super(game);

		this.onCountdownEnd = new Phaser.Signal();

		this.x 					= x;
		this.y					= y;
		this.beginSize 			= beginSize 		|| 96;
		this.endSize 			= endSize 			|| 12;
		this.countdownPosition	= countdownLength 	|| 3;
		this.startPosition      = this.countdownPosition;

		// Draw Countdown
		this.countdown = this.game.add.bitmapText(0, 0, "fnt_va", this.countdownPosition, this.beginSize);
		this.countdown.anchor.setTo(0.5);
		this.add(this.countdown);
		
		// Countdown Tween
		this.tween = this.game.add.tween(this.countdown);
		this.tween.to({fontSize: this.endSize, alpha: 0}, 1000, Phaser.Easing.Linear.None);
		this.tween.onComplete.add(this._tweenEnd, this);
	}

	start() {
		this.countdownPosition = this.startPosition;
		this.tween.start();
	}

	stop() {
		this.tween.stop();
	}

	_tweenEnd() {
		this.countdownPosition--;

		if (this.countdownPosition > -1) {
			// Countdown still running
			this.countdown.setText(this.countdownPosition > 0 ? this.countdownPosition : "START");
			this.countdown.alpha = 1;
			this.countdown.fontSize = this.beginSize;
			this.tween.start();
		} else {
			// Countdown finished
			this.onCountdownEnd.dispatch();
		}	
	}
}