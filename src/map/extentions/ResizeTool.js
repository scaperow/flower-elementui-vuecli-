import go from 'gojs'

/**
 * Constructs a ResizeMultipleTool and sets the name for the tool.
 */

class ResizeMultipleTool extends go.ResizingTool {
  constructor() {
    super()
  }

  name = 'ResizeMultiple';
  resize (newr) {
    var diagram = this.diagram;

    diagram.selection.each(function (part) {
      if (part instanceof go.Link || part instanceof go.Group)
        return; // only Nodes and simple Parts
      var obj = part.resizeObject;
      // calculate new location
      var pos = part.position.copy();
      var angle = obj.getDocumentAngle();
      var sc = obj.getDocumentScale();
      var radAngle = Math.PI * angle / 180;
      var angleCos = Math.cos(radAngle);
      var angleSin = Math.sin(radAngle);
      var deltaWidth = newr.width - obj.naturalBounds.width;
      var deltaHeight = newr.height - obj.naturalBounds.height;
      var angleRight = (angle > 270 || angle < 90) ? 1 : 0;
      var angleBottom = (angle > 0 && angle < 180) ? 1 : 0;
      var angleLeft = (angle > 90 && angle < 270) ? 1 : 0;
      var angleTop = (angle > 180 && angle < 360) ? 1 : 0;
      pos.x += sc * ((newr.x + deltaWidth * angleLeft) * angleCos - (newr.y + deltaHeight * angleBottom) * angleSin);
      pos.y += sc * ((newr.x + deltaWidth * angleTop) * angleSin + (newr.y + deltaHeight * angleLeft) * angleCos);
      obj.desiredSize = newr.size;
      part.position = pos;
    });
  }
}

export default ResizeMultipleTool