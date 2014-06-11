/*
 *  2014 - Daniel Benton 
 */
window.GlyphWriter = window.GlyphWriter || (function () {
  var VERTICES = 6,
      RATIO = 1.85;
  var drawPoint = function (context, center, radius, color) {
    context.save();
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.stroke();
    context.closePath();
    context.restore();
  };

  var drawVertices = function (context, center, rotation, radius, size, color, inner) {
    var points = [];
    var x, y;
    //context.save();
    for (var i = 0; i < VERTICES; i++) {
      if(inner && (i % 3) == 0) continue;
      x = Math.cos(rotation + (2 * Math.PI * (i + 1) / VERTICES)) * radius + center.x;
      y = Math.sin(rotation + (2 * Math.PI * (i + 1) / VERTICES)) * radius + center.y;
      points.push({
        x: x,
        y: y
      });
      drawPoint(context, {
        x: x,
        y: y
      }, Math.max(size, 1.0), color);
    }
    //context.restore();
    return points;
  };

  var drawEdges = function (context, center, rotation, radius, color) {
    var x, y;
    context.save();
    x = Math.cos(rotation + (2 * Math.PI / VERTICES)) * radius + center.x;
    y = Math.sin(rotation + (2 * Math.PI / VERTICES)) * radius + center.y;
    context.moveTo(x, y);
    context.beginPath();
    for (var i = 0; i < VERTICES; i++) {
      x = Math.cos(rotation + (2 * Math.PI * (i + 1) / VERTICES)) * radius + center.x;
      y = Math.sin(rotation + (2 * Math.PI * (i + 1) / VERTICES)) * radius + center.y;
      context.lineTo(x, y);
    }
    context.closePath();
    context.strokeStyle = color;
    context.stroke();
    context.restore();
  };

  var glyphwriter = function (options) {
    this.edgeColor = options.edgeColor || null;
    this.pointColor = options.pointColor || 'black';
    this.glyphColor = options.glyphColor || 'red';
    this.backgroundColor = options.backgroundColor || null;
    this.padding = options.padding || 0.2;
    this.spacing = options.spacing || 0.15;
    this.radius = options.radius || 150;
    this.rotation = options.rotation || Math.PI; // "canonical" indexing starts from the top.
    this.delimiter = options.delimiter || '_';
    this.canvas = options.canvas || document.createElement('canvas');
    this.size = this.center = this.ctx;
    this.init();
  };

  glyphwriter.prototype.init = function () {
    var ratio = this.padding + 1.0;
    this.size = Math.round(this.radius * (2 * ratio));
    this.center = {
      x: this.radius * ratio,
      y: this.radius * ratio
    };
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.ctx = this.canvas.getContext('2d');
  };

  glyphwriter.prototype.resize = function (radius) {
    this.radius = radius;
    this.init();
  };

  glyphwriter.prototype.calibrate = function () {
    var points = [];
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.size, this.size);
    if (this.backgroundColor) {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.size, this.size);
      this.ctx.restore();
    }

    points = points.concat(drawVertices(this.ctx, this.center, this.rotation + Math.PI / 6, this.radius, this.radius / 50, this.pointColor));
    points = points.concat(drawVertices(this.ctx, this.center, this.rotation + Math.PI / 6, Math.round(this.radius / 1.85), this.radius / 50, this.pointColor, true));
    if (this.edgeColor) {
      drawEdges(this.ctx, this.center, this.rotation + Math.PI / 6, Math.round(this.radius * (1.0 + this.spacing)), this.edgeColor);
    }
    drawPoint(this.ctx, this.center, Math.max(this.radius / 50, 1.0), this.pointColor);
    points.push({
      x: this.center.x,
      y: this.center.y
    });
    return points;
  };

  glyphwriter.prototype.drawGlyph = function (indices) {
    var points = this.calibrate();
    var start = points[(1 * indices[0])];
    if (start) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      for (var i = 1; i < indices.length; i++) {
        var point = points[(1 * indices[i])];
        if (point) {
          this.ctx.lineTo(point.x, point.y);
        }
      }
      this.ctx.lineWidth = Math.max(this.radius / 50, 1.0);
      this.ctx.strokeStyle = this.glyphColor;
      this.ctx.stroke();
      this.ctx.restore();
    }
    return this.getDataURL();
  };

  glyphwriter.prototype.getDataURL = function () {
    return this.canvas && this.canvas.toDataURL();
  };

  glyphwriter.prototype.drawGlyphFromString = function (str) {
    var points = str.split(this.delimiter);
    if (points && points.length > 0) {
      return this.drawGlyph(points);
    }
    return null;
  };

  return glyphwriter;
}());
