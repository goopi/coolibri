'use strict';

/**
 * Initialize a new `Picture` with the given `data` and `ctx`.
 *
 * @param {Object} data
 * @param {RenderingContext} ctx
 * @api public
 */

function Picture(data, ctx) {
  var fns = [this.drawSquare, this.drawTriangle, this.drawCircle];

  this.ctx = ctx;
  this.fn = fns[data.figure - 1];
  this.cycles = 1400;
  this.deleted = false;

  this.alpha = 0.0;
  this.da = 0.02;
  this.maxAlpha = data.alpha;
  // degrees to radians
  this.angle = data.rotation * Math.PI / 180;
  this.size = data.size;
  this.x = data.position[0];
  this.y = data.position[1];
  this.rgb = [data.rgb[0], data.rgb[1], data.rgb[2]].join(',');
}

Picture.prototype.getColor = function(){
  return 'rgba(' + this.rgb + ',' + this.alpha + ')';
};

Picture.prototype.fwd = function(){
  if (this.deleted) return;
  if (this.cycles) {
    if (this.alpha <= this.maxAlpha) this.alpha += this.da;
    this.cycles--;
  } else {
    if (this.alpha > 0.1) this.alpha -= this.da;
    else this.deleted = true;
  }
};

Picture.prototype.draw = function(){
  if (!this.fn) return;
  this.ctx.save();
  this.fn();
  this.ctx.restore();
};

Picture.prototype.drawSquare = function(){
  var c = this.ctx;
  c.fillStyle = this.getColor();
  c.translate(this.x, this.y);
  c.rotate(this.angle);
  c.fillRect(0, 0, this.size, this.size);
};

Picture.prototype.drawTriangle = function(){
  var c = this.ctx;
  c.fillStyle = this.getColor();
  c.translate(this.x, this.y);
  c.rotate(this.angle);
  c.beginPath();
  c.moveTo(this.size / 2, 0);
  c.lineTo(0, this.size);
  c.lineTo(this.size, this.size);
  c.fill();
};

Picture.prototype.drawCircle = function(){
  var c = this.ctx;
  c.fillStyle = this.getColor();
  c.beginPath();
  c.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2, true);
  c.fill();
};
