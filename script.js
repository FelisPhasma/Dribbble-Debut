// Dribbble debut shot
// Code is a bodge
// (c) FelisPhasma 2018
// TODO: Comments
"use strict";
// Higgs.js
window._=(q,c,p)=>{p=".#".indexOf(q[0]);return(c||document)["getElement"+["sByTagName","sByClassName","ById"][p+1]](p<0?q:q.slice(1))};
String.prototype.splice = function(start, delCount, newSubStr) {
	return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};
(function(){
	// Elem refs
	let codeContainer = _("#code"),
		anim = _("#anim"),
		shot = _("#shot"),
		ball = _("#ball"),
		blackHole = _("#blackHole"),
		ground = _("#ground"),
		ground_shadow = _("#ground_shadow"),
		cursor;
	// Tomorrow night color scheme
	let string = "#59DA59",
		keyword = "#D13EF9",
		varname = "#498DF6",
		operator = "#F79C30",
		fnName = "#F05A50",
		punctuation = "#EAEAEA",
		literal = "#61F0F2",
		comment = "#ccc";
	// Code dissection
	let code = [
		[{t: "\"use strict\"", color: string}, {t: ";", color: punctuation}],
		[{t: "let ", color: keyword}, {t: "display ", color: varname}, {t: "= ", color: operator}, {t: "new ", color: keyword}, {t: "Display", color: fnName}, {t: "(),", color: punctuation}],
		[{t: "    ball ", color: varname}, {t: "= ", color: operator}, {t: "new ", color: keyword}, {t: "Dribbble", color: fnName}, {t: "().", color: punctuation}, {t: "getBall", color: fnName}, {t: "();", color: punctuation}],
		[{t: "display", color: fnName}, {t: ".", color: punctuation}, {t: "add", color: fnName}, {t: "(", color: punctuation}, {t: "ball", color: varname}, {t: ");", color: punctuation}],
		[{t: "ball", color: fnName}, {t: ".", color: punctuation}, {t: "setSize", color: fnName}, {t: "(", color: punctuation}, {t: "140", color: literal}, {t: ");", color: punctuation}],
		[{t: "ball", color: fnName}, {t: ".", color: punctuation}, {t: "dribble", color: fnName}, {t: "();", color: punctuation}],
		[{t: "ball", color: fnName}, {t: ".", color: punctuation}, {t: "setSpeed", color: fnName}, {t: "(", color: punctuation}, {t: "30", color: literal}, {t: ");", color: punctuation}]
	];
	// Ball Gravity
	class Ball {
		constructor(elem) {
			this.ball = elem;
			this.velocity = 0;
			this.VScal = 1;
			this.grav = 1; //30;//.01;
			this.y = this.ball.style.top = this.ball.getBoundingClientRect().top;
			this.groundY = ground.getBoundingClientRect().top - this.ball.getBoundingClientRect().height + 10;
			this._kill = false;
			let T = this;
			window.requestAnimationFrame(() => {
				this.update(T);
			});
		}
		update(T) {
			if(T.y + T.velocity > T.groundY) {
				T.velocity = -1 * Math.abs(T.velocity);
				//T.y = T.groundY;
			} else { // Don't apply gravity if switching, causes loss of velocity
				T.velocity += T.grav;
				T.velocity *= T.VScal;
			}
			let absVel = Math.abs(T.velocity);
			if(T.onApexFn != undefined && absVel < 1.5 * T.grav) //T.groundY - T.y < 10)
				T.onApexFn();
			if(T.lowVel != undefined && absVel < 2)
				T.lowVel();
			T.y = T.y + T.velocity;
			T.ball.style.top = T.y + "px";
			if(this._kill)
				return;
			window.requestAnimationFrame(() => {
				T.update(T);
			});
		}
		setGrav(g) {
			this.grav = g;
		}
		setVScale(v) {
			this.VScal = v;
		}
		onApex(fn) {
			this.onApexFn = fn;
		}
		kill() {
			this._kill = true;
		}
		onLowVel(fn) {
			this.lowVel = fn;
		}
	}
	let B;
	// Instructions
	let instructionSet = [
		null,
		null,
		null,
		(c) => {
			window.setTimeout(() => {
				ball.style.display = "block";
				c(1000);
			}, 400);
		},
		(c) => {
			window.setTimeout(() => {
				ball.style.width = "140px";
				ball.style.height = "140px";
				c(1000);
			}, 400);
		},
		(c) => {
			B = new Ball(ball);
			window.setTimeout(() => {
				c(1000);
			}, 3000);
		},
		(c) => {
			B.onApex(() => {
				// Don't call this again...
				B.onApex(undefined);
				B.setGrav(3);
			});
			// scoliosis
			window.setTimeout(() => {
				moveCursorBack(2, 200, () => {
					window.setTimeout(() => {
						backspace(2, 200, () => {
							typeInPlace("200", 100, () => {
								B.onApex(() => {
									// Don't call this again...
									B.onApex(undefined);
									B.setGrav(20);
								});
								window.setTimeout(() => {
									B.onApex(() => {
										// Don't call this again...
										B.onApex(undefined);
										B.setVScale(0.8);
										Vivum({
											from: 20,
											to: 0,
											duration: 300,
											easing:"easeInQuad",
											complete: (v) => {
												B.setGrav(0);
												B.onLowVel(() => {
													// Don't call this again...
													B.onLowVel(undefined);
													createBlackHole();
												});
											}
										}, (v) => { // Callback for each animation frame
											B.setGrav(v);
										});
									});
								}, 1000);
							});
						});
					}, 500);
				});
			}, 3000);
		}
	]
	// Code and typing animation
	let	line = 0,
		block,
		blockElem,
		blockLen,
		char,
		typesetInterval = 30; //50;
	function setBlock() {
		blockLen = code[line][block].t.length;
		char = -1;
		blockElem = document.createElement("span");
		blockElem.style.color = code[line][block].color;
		codeContainer.insertBefore(blockElem, cursor);
	}
	function nextLine() {
		line++;
		//interval += lineInterval;
		let br = document.createElement("br");
		if(line < code.length)
			codeContainer.insertBefore(br, cursor);
		block = 0;
		setBlock();
	}
	function moveCursorBack(count, interval, cb) {
		let parent = cursor.parentElement;
		if(parent.nodeName == "CODE") {
			let psib = cursor.previousSibling;
			parent.removeChild(cursor);
			psib.appendChild(cursor);
		}
		let cursorHTML = cursor.outerHTML;
		parent = cursor.parentElement;
		let index = parent.innerHTML.indexOf(cursorHTML);
		parent.removeChild(cursor);
		parent.innerHTML = parent.innerHTML.splice(index - 1, 0, cursorHTML);
		cursor = _("#cursor");
		index--;
		if(index == 0) {
			parent.removeChild(cursor);
			parent.previousSibling.appendChild(cursor);
		}

		if(count > 1)
			window.setTimeout(() => {
				moveCursorBack(count - 1, interval, cb);
			}, interval);
		else
			cb();
	}
	function backspace(count, interval, cb) {
		// don't worry about parent overflow
		let cursorHTML = cursor.outerHTML,
			parent = cursor.parentElement,
			index = parent.innerHTML.indexOf(cursorHTML);
		parent.removeChild(cursor);
		parent.innerHTML = parent.innerHTML.slice(0, parent.innerHTML.length - 1);
		parent.appendChild(cursor);

		if(count > 0)
			window.setTimeout(() => {
				backspace(count - 1, interval, cb);
			}, interval);
		else
			cb();
	}
	function typeInPlace(string, interval, cb) {
		let parent = cursor.parentElement,
			cursorHTML = cursor.outerHTML,
			index = parent.innerHTML.indexOf(cursorHTML);
		parent.innerHTML = parent.innerHTML.splice(index, 0, string[0]);
		cursor = _("#cursor");

		if(string.length > 1)
			window.setTimeout(() => {
				typeInPlace(string.slice(1), interval, cb);
			}, interval);
		else
			cb();
	}
	function type() {
		if(block === undefined) {
			block = 0;
			setBlock();
		}
		let interval = typesetInterval;
		++char;
		if(char >= blockLen) {
			block++;
			if(block >= code[line].length) {
				if(instructionSet[line] != null){
					instructionSet[line]((additionalTime) => {
						if(line != code.length - 1)
							nextLine();
						window.setTimeout(() => {
							type();
						}, interval + additionalTime);
					});
					return;
				} else {
					nextLine();
				}
			} else {
				setBlock();
			}
		} else {
			let c = code[line][block].t[char];
			blockElem.innerHTML += c;
			if(c == " ")
				interval = 0;
		}
		window.setTimeout(() => {
			type();
		}, interval);
	}
	class Body {
		constructor() {
			this.forceConst;
			this.x;
			this.y;
			this.vel = new Vec2D(0, 0);
			this.theta;
			this.scale;
			this.element;
		}
		fromElement(e) {
			let bounds = e.getBoundingClientRect();
			this.element = e;
			//this.x = bounds.left + (bounds.width / 2);
			//this.y = bounds.top + (bounds.top / 2);
			this.theta = 0;
			this.scale = 1;
			this.forceConst = 1;
		}
		setXY(_x, _y) {
			this.x = _x;
			this.y = _y;
		}
		update() {
			this.x += this.vel.getX();
			this.y += this.vel.getY();
			this.element.style.top = this.y + "px";
			this.element.style.left = this.x + "px";
		}
	}
	class BodySimulation {
		constructor() {
			this.bodies = [];
			this.particles = [];
			this.numParticles = 50;//30;
			this.particleVisDist = [900 / 2, 550 / 2, 0];
			this._visGrad = 	   [0,       1,       1];
			this.gravity = 10;
			this.destroyDist = 60;
			this.shrinkGrad = [500 / 2, this.destroyDist];
			this.updateBodies = false;
			this.populate();
		}
		summonParticle(dist) {
			let angle = Math.random() * Math.PI * 2,
				magnitude = dist || this.particleVisDist[0] + (Math.random() * 400),
				particle = document.createElement("div");
			particle.className = "particle";
			particle.style.opacity = 0;
			shot.appendChild(particle);
			let _body = new Body();
			_body.fromElement(particle);
			_body.setXY(blackholeX + (Math.cos(angle) * magnitude), blackholeY + (Math.sin(angle) * magnitude));
			_body.update();
			this.particles.push(_body);
		}
		populate() {
			for(let i = 0; i < this.numParticles; i++) {
				this.summonParticle(this.particleVisDist[0] + (i * 10));
			}
		}
		// This may look like over-methoding but it circumvents duplicate dist calculations on the praticle
		computeForces(b, dist) {
			let invprop = 1 / (dist * dist), //Math.pow(dist, 3),
				delta = new Vec2D(b.x - blackholeX, b.y - blackholeY);
			delta.mul(invprop);
			delta.mul(blackholeMass);
			delta.mul(b.forceConst);
			b.vel.sub(delta);
			b.update();
		}
		sizeScale(p, dist) {
			if(dist <= this.shrinkGrad[0]) {
				let scale = 1 - ((this.shrinkGrad[0] - dist) / (this.shrinkGrad[0] - this.shrinkGrad[1]));
				scale = Math.pow(scale, 1/3);
				if(scale < 1)
					p.element.style.transform = p.element.style.transform.replace(/scale\([0-9\.\-]+\)/gi, "") + ` scale(${scale})`;
			}
		}
		updateParticle(p, index) {
			let dist = Math.sqrt(Math.pow(p.x - blackholeX, 2) + Math.pow(p.y - blackholeY, 2)),
				distI,
				distI2,
				opacity = this._visGrad[0];
			// Alpha
			if(!(dist >= this.particleVisDist[0]))
				for(let i = 0, l = this._visGrad.length - 1; i < l; i++) {
					distI = this.particleVisDist[i];
					distI2 = this.particleVisDist[i + 1];
					if(dist < distI && dist >= distI2) {
						opacity = this._visGrad[i] + (((this.particleVisDist[i] - dist) / (this.particleVisDist[i] - this.particleVisDist[i + 1])) * this._visGrad[i + 1]);
						break;
					}
				}
			p.element.style.opacity = opacity;
			// Shrink
			this.sizeScale(p, dist);
			// Do gravity
			this.computeForces(p, dist);
			// Check to see if it can be killed off
			dist = Math.sqrt(Math.pow(p.x - blackholeX, 2) + Math.pow(p.y - blackholeY, 2));
			if(dist <= this.destroyDist) {
				this.particles[index].element.parentElement.removeChild(this.particles[index].element);
				this.particles.splice(index, 1);
			}
		}
		updateBody(b, index) {
			let dist = Math.sqrt(Math.pow(b.x - blackholeX, 2) + Math.pow(b.y - blackholeY, 2));
			// Shrink
			this.sizeScale(b, dist);
			// Do gravity
			this.computeForces(b, dist);
			// Check to see if it can be killed off
			dist = Math.sqrt(Math.pow(b.x - blackholeX, 2) + Math.pow(b.y - blackholeY, 2));
			if(dist <= this.destroyDist) {
				this.bodies[index].element.parentElement.removeChild(this.bodies[index].element);
				this.bodies.splice(index, 1);
			}
		}
		update() {
			if(this.particles.length)
				for(let i = this.particles.length - 1; i--; ) {
					//p.element.style.opacity = this.computeParticleAlpha(p);
					this.updateParticle(this.particles[i], i);
				}
			if(this.updateBodies && this.bodies.length)
				for(let i = this.bodies.length - 1; i >= 0; i--) {
					this.updateBody(this.bodies[i], i);
				}
			let bSum = this.bodies.length + this.particles.length;
			if(this.onNoBodyFn && bSum == 0)
				this.onNoBodyFn();
			if(this.onLowBodyFn && bSum < 6)
				this.onLowBodyFn();


			/*let pDelta = this.numParticles - this.particles.length;
			/*while(pDelta--) {
				this.summonParticle();
			}* /
			if(pDelta) {
				this.summonParticle();
				//this.summonParticle();
			}*/

			if(!this.kill) {
				let T = this;
				window.requestAnimFrame(() => {
					T.update.apply(T);
				});
			}
		}
		allowBodyUpdate() {
			this.updateBodies = true;
		}
		startSim() {
			this.update();
		}
		stopSim() {
			this.kill = true;
		}
		onLowBody(fn) {
			this.onLowBodyFn = fn;
		}
		onNoBody(fn) {
			this.onNoBodyFn = fn;
		}
	}
	// Returns owned copy
	function getBoundingClientRect(element) {
		const rect = element.getBoundingClientRect();
		return {
			top: rect.top,
			right: rect.right,
			bottom: rect.bottom,
			left: rect.left,
			width: rect.width,
			height: rect.height,
			x: rect.x,
			y: rect.y
		};
	}
	let bodySim;
	function setupGravitySimulation() {
		new Promise(() => {
			let shotElements = _("*", shot),
				shotBounds = shot.getBoundingClientRect(),
				bodies = [],
				rect,
				id,
				maxArea = 0;
			for(let e of shotElements) {
				rect = getBoundingClientRect(e);
				let parentId = e.parentElement.getAttribute("id");
				if(["blackHole", "code", "anim", "ball"].indexOf(e.getAttribute("id")) == -1
					&& ["ball", "ground", "ground_shadow"].indexOf(parentId) == -1
					&& e.className != "particle"
					&& e.tagName != "path") {
					e.style.left = ((rect.left - shotBounds.left) + (rect.width / 2)) + "px";
					e.style.top = ((rect.top - shotBounds.top) + (rect.height / 2)) + "px";
					if(["ground", "ground_shadow"].indexOf(e.getAttribute("id")) >= 0) {
						continue; //e.style.transition = ".1s ease transform";
					}
					/*if(["ground", "ground_shadow"].indexOf(e.getAttribute("id")) == -1) {
						let area = rect.width * rect.height;
						if(area > maxArea)
							maxArea = area;
					}*/
					let matrix = window.getComputedStyle(e).transform;
					if(matrix == "none")
						e.style.transform = "translate(-50%, -50%)";
					else {
						e.style.transform = /matrix\((?:[0-9\.\-]+, ){4}/g.exec(matrix)[0] + "0, 0) translate(-50%, -50%)";
					}
					bodies.push(e);
				}
			}
			// https://gyazo.com/4ce88e2df86b0fcf79111611b81ea94b
			for(let e of bodies) {
				id = e.getAttribute("id");
				let parentId = e.parentElement.getAttribute("id");
				e.style.position = "absolute";
				let zi = window.getComputedStyle(e).zIndex;
				e.style.zIndex = (zi == "auto" ? 0 : parseInt(zi)) + 4;
				let _body = new Body();
				_body.fromElement(e);
				_body.setXY(parseFloat(e.style.left), parseFloat(e.style.top));
				/*if(["ground", "ground_shadow"].indexOf(e.getAttribute("id")) == -1) {
					let rect = getBoundingClientRect(e),
						area = rect.width * rect.height;
					_body.forceConst = 1 - (area / maxArea);
				}*/
				_body.forceConst = 2/3;

				bodySim.bodies.push(_body);
			}
			let pEl = cursor.parentElement;
			pEl.removeChild(cursor);
			pEl.parentElement.insertBefore(cursor, pEl.nextSibling);
			cursor.style.display = "block";
		});
	}
	let blackholeX,
		blackholeY,
		blackholeMass = 30;//20;
	function createBlackHole() {
		let bounds = ball.getBoundingClientRect(),
			abounds = anim.getBoundingClientRect(),
			x = blackholeX = bounds.left + (bounds.width / 2) - abounds.left,
			y = blackholeY = bounds.top + (bounds.height / 2) - abounds.top;
		bodySim = new BodySimulation();
		B.kill();
		window.setTimeout(setupGravitySimulation, 500);
		//setupGravitySimulation();
		// Shrink ball
		ball.style.transition = "none";
		Vivum({
			from: 140,
			to: 0,
			duration: 1000,
			easing: "easeInBack",
			complete: (v) => {
				ball.style.width = "0px";
				ball.style.height = "0px";
				ball.style.transform = "translate(-50%, 70px)";
			}
		}, (v) => { // Callback for each animation frame
			ball.style.width = v + "px";
			ball.style.height = v + "px";
			ball.style.transform = "translate(-50%," + ((140 - v) / 2) + "px)";
		});
		// Grow hole
		blackHole.style.left = x + "px";
		blackHole.style.top = y + "px";
		Vivum({
			from: 0,
			to: 160,
			duration: 1000,
			easing: "easeInBack",
			complete: (v) => {
				blackHole.style.width = v + "px";
				blackHole.style.height = v + "px";
			}
		}, (v) => { // Callback for each animation frame
			blackHole.style.width = v + "px";
			blackHole.style.height = v + "px";
		});
		// Send away ground
		let groundY = ground.getBoundingClientRect().top - shot.getBoundingClientRect().top + (0.1 * 300),
			shadowDelta = ground_shadow.getBoundingClientRect().top - ground.getBoundingClientRect().top;
		Vivum({
			from: groundY,
			to: shot.getBoundingClientRect().height + (0.1 * 300),
			duration: 400,
			easing: "easeInExpo",
			complete: (v) => {
				ground.style.top = v + "px";
				ground_shadow.style.top = v + shadowDelta + "px";
			}
		}, (v) => {
			ground.style.top = v + "px";
			ground_shadow.style.top = v + shadowDelta + "px";
		});
		window.setTimeout(() => {
			bodySim.startSim.apply(bodySim);
			bodySim.onNoBody(() => {
				console.log("stop sim");
				bodySim.stopSim.apply(bodySim);
			});
			// start pulling bodies after...
			//window.setTimeout(() => {
			bodySim.allowBodyUpdate();
			//}, 500);
			// Enter end game
			//window.setTimeout(() => {
			bodySim.onLowBody(() => {
				bodySim.onLowBody(undefined);
				Vivum({
					from: 160,
					to: 2 * Math.max(Math.sqrt(Math.pow(blackholeX - 0, 2) + Math.pow(blackholeY - 0, 2)),
									Math.sqrt(Math.pow(blackholeX - 0, 2) + Math.pow(blackholeY - 600, 2))),
					duration: 700,
					easing: "easeInBack",
					complete: (v) => {
						blackHole.style.width = v + "px";
						blackHole.style.height = v + "px";
						//blackHole.style.transition = ".3s ease background";
						//blackHole.style.background = "#222";
						window.setTimeout(() => {
							//ball.style.top = "600px";
							//ball.style.left = "800px";
							//ball.style.width = "600px";
							//ball.style.height = "600px";
							//ball.style.transform = "translate(-50%, -50%);";
							shot.style.background = "#000";
							shot.offsetLeft;
							blackHole.style.display = "none"; //.zIndex = "0";
							shot.style.transition = ".3s ease background";
							shot.style.background = "#222";
							let hello = document.createElement("div"),
								thankYou = document.createElement("div"),
								name = document.createElement("div");
							hello.innerHTML = `<span style="color: ${fnName}">Dribbble</span>.<span style="color: ${fnName}">hello</span>();`;
							thankYou.innerHTML = `<span style="color: ${fnName}">Dribbble</span>.<span style="color: ${fnName}">thank</span>(<span style="color: ${string}">"Amandeep Kaur"</span>);`;
							name.innerHTML = `<span style="color: ${comment}">// - Felis Phasma :)</span>`;
							let finalcode = [hello, thankYou, name],
								i = 0;
							for(let e of finalcode) {
								e.style.position = "absolute";
								e.className = "code";
								shot.appendChild(e);
								e.style.top = "-100px";
								e.style.left = "15px";
								Vivum({
									from: -100,
									to: 10 + (i++ * 33),
									duration: 700,
									easing: "easeOutExpo"
								}, (v) => {
									e.style.top = v + "px";
								});
							}
						}, 150);
					}
				}, (v) => {
					blackHole.style.width = v + "px";
					blackHole.style.height = v + "px";
				});
			});
			//}, 4000);
		}, 1000);
	}
	window.initShot = () => {
		cursor = document.createElement("span");
		cursor.setAttribute("id", "cursor");
		codeContainer.appendChild(cursor);
		type();
	};
})();

// Vec2D Implementation
class Vec2D {
	// constructor
	constructor(x, y){
		if(arguments.length != 0){
			this.x = x;
			this.y = y;
		}
	}
	// Getters and setters
	getX(){
		return this.x;
	}
	setX(x){
		this.x = x;
	}
	getY(){
		return this.y;
	}
	setY(y){
		this.y = y;
	}
	setXY(x, y){
		this.x = x;
		this.y = y;
	}
	// Maths
	getLength(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	setLength(length){
		let angle = this.getAngle();
		this.x = Math.cos(angle) * length;
		this.y = Math.sin(angle) * length;
	}
	getAngle(){
		return Math.atan2(this.y, this.x);
	}
	setAngle(angle){
		let length = this.getLength();
		this.x = Math.cos(angle) * length;
		this.y = Math.sin(angle) * length;
	}
	// Arithmetic
	add(vector){
		if(arguments.length == 1){
			this.x += vector.getX();
			this.y += vector.getY();
		} else {
			this.x += arguments[0];//x;
			this.y += arguments[1];//y;
		}
	}
	sub(vector){
		if(arguments.length == 1){
			this.x -= vector.getX();
			this.y -= vector.getY();
		} else {
			this.x -= arguments[0];//x;
			this.y -= arguments[1];//y;
		}
	}
	mul(vector, arg2){
		if(arguments.length == 1) {
			if(vector instanceof Vec2D) {
				this.x *= vector.getX();
				this.y *= vector.getY();
			} else {
				this.x *= vector;
				this.y *= vector;
			}
		} else {
			this.x *= vector;
			this.y *= arg2;
		}
	}
	div(){
		this.mul.apply(this, arguments);
	}
}

// Vivum.js

document.body.addEventListener("click", () => {
	window.location.reload(false)
}, false);
window.setTimeout(window.initShot, 1000);