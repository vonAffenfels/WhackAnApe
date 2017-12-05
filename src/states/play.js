import Phaser from 'phaser';
import Enums from '../enums';
import CountdownObject from '../objects/countdown';

export class PlayState extends Phaser.State {
	constructor() {
		super();
	}

	init() {
		this.holes = [
			{
				xStart: 111, 
				yStart: 232,
				size: 160,
				headPosX: 24,
				headPosY: 400,
				bagPosX: 100,
				bagPosY: 480,
				textPosX: 135,
				textPosY: 235
			},
			{
				xStart: 291, 
				yStart: 232,
				size: 160,
				headPosX: 208,
				headPosY: 400,
				bagPosX: 280,
				bagPosY: 480,
				textPosX: 312,
				textPosY: 235
			},
			{
				xStart: 480, 
				yStart: 234,
				size: 160,
				headPosX: 395,
				headPosY: 402,
				bagPosX: 465,
				bagPosY: 482,
				textPosX: 500,
				textPosY: 236
			}
		];
		this.activeHeads = [];
		this.clickedHoles = [];
		this.shownHeads = 0;

		this.speeds = this.game.config.get("speed");
		this.maxTime = this.game.config.get("maxTime");
		this.changeSpeedInterval = Math.floor(this.maxTime / this.speeds.length);
		this.currentSpeed = 0;
		this.showChance = this.game.config.get("showChance");
		this.ratzChance = this.game.config.get("ratzChance");

		this.scoreGain = this.game.config.get("scoreGain");

		this.score = 0;
		this.gameStarted = false;
	}

	_startGame() {
		this.timer = this.game.time.create(false);
		this.timer.loop(Phaser.Timer.SECOND, () => {
			this.timeLeft--;
			this._handleTime();
		}, this);

		this.timer.start();
		this._updateHeadTimer();

		this._handleHeadTimer();

		this.score = 0;
		this.gameStarted = true;
	}

	_updateHeadTimer() {
		if (!this.headTimer) {
			this.headTimer = this.game.time.create(false);
		}

		this.headTimer.stop(true);
		this.headTimer.loop(Math.floor(this.speeds[this.currentSpeed] / 2), () => {
			this._handleHeadTimer();
		}, this);
		this.headTimer.start();
	}

	_handleHeadTimer() {
		let showChance = this.showChance;
		if (this.shownHeads == 0) {
			showChance = 1;
		}

		if (this.game.rnd.realInRange(0, 1) - showChance > 0) {
			return;
		}

		let availableHoles = Phaser.ArrayUtils.numberArray(0, this.holes.length - 1);
		let selectedHole = 0;

		do {
			selectedHole = Phaser.ArrayUtils.removeRandomItem(availableHoles);
		} while (availableHoles.length > 0 && this.activeHeads[selectedHole]);

		if (this.activeHeads[selectedHole]) {
			return;
		}

		let type = Enums.Heads.JUERGEN;
		if (this.game.rnd.realInRange(0, 1) - this.ratzChance < 0) {
			type = Enums.Heads.RATZ;
		}

		this._showHead(selectedHole, type);
	}

	_handleTime() {
		if (this.timeLeft > 0) {
			if (this.timeLeft % this.changeSpeedInterval == 0) {
				this.currentSpeed++;
				if (this.currentSpeed >= this.speeds.length) {
					this.currentSpeed = this.speeds.length - 1;
				}
				this._updateHeadTimer();
			}
		} else {
			this._stopGame();
		}
	}

	_stopGame() {
		this.finishText.visible = true;

		this.finalScoreText.text = "SCORE: " + this.score;
		this.finalScoreText.visible = true;

		// Check Score agains Highscore
		if (this.score > this.game.save.get("highscore")) {
			this.game.save.set("highscore", this.score);
			this.newHighScoreText.visible = true;
		}

		for (let i = 0; i < this.holes.length; i++) {
			if (this.activeHeads[i]) {
				this.activeHeads[i].alpha = 0;
				this.activeHeads[i].hideTween.stop();
				this.activeHeads[i].showTween.stop();
				this.activeHeads[i].destroy();
				this.activeHeads[i] = null;
			}
		}

		this.highscoreText.text = "HIGHSCORE: " + this.game.save.get("highscore");

		this.gameStarted = false;
		this.timerText.visible = false;
		this.buttonRestart.visible = true;

		if (this.headTimer) {
			this.headTimer.stop(true);
			this.headTimer.destroy();
			this.headTimer = null;
		}

		this.timer.stop(true);	
		this.timer.destroy();
		this.timer = null;
	}

	_showTimeLeft() {
		let min = Math.floor(this.timeLeft / 60);
		let sec = this.timeLeft % 60;
		this.timerText.text = min.toString().padStart(2, "0") + ":" + sec.toString().padStart(2, "0");
	}

	_handleTopFieldClick(pointer) {
		if (!this.gameStarted) {
			return;
		}

		let x = pointer.worldX;
		let y = pointer.worldY;

		for (let i = 0; i < this.holes.length; i++) {
			let hole = this.holes[i];
			let xStart = this.game.world.centerX - 320 + hole.xStart;
			let yStart = hole.yStart;
			let xEnd = xStart + hole.size;
			let yEnd = yStart + hole.size

			if (x >= xStart && x <= xEnd && y >= yStart && y <= yEnd) {
				this._handleHole(i);
				break;
			}
		}
	}

	_handleHole(index) {
		if (this.clickedHoles[index]) {
			return;
		}

		this.knecht.bringToTop();
		this.knecht.animations.play("whack_" + index);

		this.clickedHoles[index] = true;

		if (!this.activeHeads[index]) {
			this.clickedHoles[index] = false;
			return;
		}

		let head = this.activeHeads[index];

		// Stop tweens
		head.hideTween.stop();
		head.showTween.stop();
		head.alpha = 1;

		head.animations.stop();
		if (head.headType == Enums.Heads.JUERGEN) {
			head.frame = 2;
			this.sndKlatsche.play();
			this.score += this.scoreGain;
			this._showMoneyBag(index);
			this._showScoreText(index, "+" + this.scoreGain);
		} else {
			head.frame = 1;
			let reduce = this.scoreGain * this.game.config.get("ratzFactor");
			this.sndRatz.play();
			this.score -= reduce;
			this._showScoreText(index, "-" + reduce);
		}

		head.killTween.start();
	}

	_showHead(hole, type, noHide) {
		let newHead = null;

		if (hole < 0 || hole >= this.holes.length) {
			return;
		}

		let headPosX = this.game.world.centerX - 320 + this.holes[hole].headPosX;
		let headPosY = this.holes[hole].headPosY;

		if (type == Enums.Heads.JUERGEN) {
			newHead = this.game.add.sprite(headPosX, headPosY, "juergen", 0);
		} else if (type == Enums.Heads.RATZ) {
			newHead = this.game.add.sprite(headPosX, headPosY, "ratz", 0);
		} else {
			return;
		}

		newHead.anchor.setTo(0, 1);
		newHead.headType = type;
		newHead.inputEnabled = true;
		newHead.events.onInputDown.add(() => {
			this._handleHole(hole);
		});
		newHead.animations.add("whacka", [0, 1]);
		newHead.animations.play("whacka", this.game.rnd.integerInRange(1, 20), true);
		newHead.alpha = 0;

		newHead.showTween = this.game.add.tween(newHead);
		newHead.showTween.to({alpha: 1}, 200, Phaser.Easing.Linear.None);
		newHead.showTween.start();

		newHead.hideTween = this.game.add.tween(newHead);
		newHead.hideTween.to({alpha: 0}, 200, Phaser.Easing.Linear.None);
		newHead.hideTween.delay(this.speeds[this.currentSpeed]);
		if (!noHide) {
			newHead.hideTween.start();
		}
		newHead.hideTween.onComplete.add(() => {
			newHead.destroy();
			this.shownHeads--;
			this.activeHeads[hole] = null;
			this.clickedHoles[hole] = false;
		}, this);

		newHead.killTween = this.game.add.tween(newHead);
		newHead.killTween.to({alpha: 0}, 200, Phaser.Easing.Linear.None);
		newHead.killTween.onComplete.add(() => {
			newHead.destroy();
			this.shownHeads--;
			this.activeHeads[hole] = null;
			this.clickedHoles[hole] = false;
		}, this);

		this.shownHeads++;
		this.activeHeads[hole] = newHead;
	}

	_showMoneyBag(hole, noHide) {
		if (hole < 0 || hole >= this.holes.length) {
			return;
		}

		let animArray = [0, 1, 2, 3, 4, 5, 6];
		let rotateRnd = this.game.rnd.integerInRange(0, 7);
		for (let i = 0; i < rotateRnd; i++) {
			Phaser.ArrayUtils.rotateLeft(animArray);
		}

		let bagPosX = this.game.world.centerX - 320 + this.holes[hole].bagPosX;
		let bagPosY = this.holes[hole].bagPosY;

		let bag = this.game.add.sprite(bagPosX, bagPosY, "geldsack");
		bag.anchor.setTo(0, 1);
		bag.animations.add("bag", animArray);
		bag.fallTween = this.game.add.tween(bag);
		bag.fallTween.to({alpha: 0, y: bagPosY + 300});
		bag.fallTween.onComplete.add(() => {
			bag.destroy();
		});
		if (!noHide) {
			bag.animations.play("bag", 14, true);
			bag.fallTween.start();
		}
	}

	_showScoreText(hole, text, noHide) {
		if (hole < 0 || hole >= this.holes.length) {
			return;
		}

		let textPosX = this.game.world.centerX - 320 + this.holes[hole].textPosX;
		let textPosY = this.holes[hole].textPosY;

		let txt = this.game.add.bitmapText(textPosX, textPosY, "fnt_va", text, 40);
		txt.anchor.setTo(0.5, 1);
		txt.fallTween = this.game.add.tween(txt);
		txt.fallTween.to({alpha: 0, y: textPosY - 100});
		txt.fallTween.onComplete.add(() => {
			txt.destroy();
		});

		if (!noHide) {
			txt.fallTween.start();	
		}
	}

	update() {
		this._showTimeLeft();

		if (this.gameStarted) {
			this.highscoreText.text = "SCORE: " + this.score;
		}
	}

	_drawHolePosition(hole) {
		if (hole < 0 || hole >= this.holes.length) {
			return;
		}

		let grph = this.game.add.graphics(this.holes[hole].xStart, this.holes[hole].yStart);
		grph.beginFill(0xFF0000);
		grph.drawRect(0, 0, this.holes[hole].size, this.holes[hole].size);
		grph.endFill();
	}

	create() {	
		let centerX = this.game.world.centerX;

		this.topField = this.game.add.sprite(centerX, 0, "top_field");
		this.topField.anchor.setTo(0.5, 0);
		this.topField.inputEnabled = true;
		this.topField.events.onInputDown.add((game, pointer) => {
			this._handleTopFieldClick(pointer);
		})

		this.highscoreText = this.game.add.bitmapText(centerX - 280, 20, "fnt_va_white", "HIGHSCORE: " + this.game.save.get("highscore"), 36);

		this.knecht = this.game.add.sprite(centerX, this.game.world.height, "knecht", 0);
		this.knecht.animations.add("whack_0", [1, 0], 4);
		this.knecht.animations.add("whack_1", [2, 0], 4);
		this.knecht.animations.add("whack_2", [3, 0], 4);
		this.knecht.anchor.setTo(0.5, 1);

		let startCountdown = () => {
			this.finishText.visible = false;
			this.newHighScoreText.visible = false;
			this.finalScoreText.visible = false;
			this.countdown.visible = true;

			this.highscoreText.text = "SCORE: " + this.score;
			this.timeLeft = this.maxTime;

			this.timerText.visible = true;
			this.buttonStart.visible = false;
			this.buttonRestart.visible = false;

			this.countdown.start();
		}

		this.buttonStart = this.game.add.sprite(centerX, 300, "button_start");
		this.buttonStart.anchor.setTo(0.5);
		this.buttonStart.scale.setTo(2);
		this.buttonStart.inputEnabled = true;
		this.buttonStart.events.onInputDown.add(startCountdown);

		this.buttonRestart = this.game.add.sprite(centerX, 300, "button_restart");
		this.buttonRestart.anchor.setTo(0.5);
		this.buttonRestart.scale.setTo(2);
		this.buttonRestart.visible = false;
		this.buttonRestart.events.onInputDown.add(startCountdown);

		this.timerText = this.game.add.bitmapText(centerX + 280, 20, "fnt_va_white", "99:99", 36);
		this.timerText.anchor.setTo(1, 0);
		this.timerText.visible = false;

		// Countdown
		this.countdown = new CountdownObject(this.game, centerX, this.game.world.centerY, 3, 164);
		this.countdown.onCountdownEnd.add(() => {
			this._startGame();
		}, this);
		this.countdown.visible = false;

		this.finishText = this.game.add.bitmapText(centerX, this.game.world.centerY, "fnt_va", "ENDE", 148);
		this.finishText.anchor.setTo(0.5);
		this.finishText.visible = false;

		this.finalScoreText = this.game.add.bitmapText(centerX, this.finishText.y + (this.finishText.fontSize / 2) + 20, "fnt_va", "SCORE: 9999", 64);
		this.finalScoreText.anchor.setTo(0.5);
		this.finalScoreText.visible = false;

		this.newHighScoreText = this.game.add.bitmapText(centerX, this.finalScoreText.y + (this.finalScoreText.fontSize / 2) + 20, "fnt_va", "NEUER HIGHSCORE", 64);
		this.newHighScoreText.anchor.setTo(0.5);
		this.newHighScoreText.visible = false;

		this.sndKlatsche = this.game.add.audio("klatsche");
		this.sndRatz = this.game.add.audio("ratz_fail");
	}
}