
const selectElementContents = function (el) {
  var range = document.createRange()
  range.selectNodeContents(el)
  var sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

var textarea = document.createElement('div')
textarea.id = "text_editing"
textarea.setAttribute('contenteditable', true)

textarea.addEventListener('input', function (e) {
  var tool = TextEditor.tool;
  if (tool.textBlock === null) return;
  var textBlock = tool.textBlock;
  var diagram = tool.diagram;
  diagram.startTransaction();
  textBlock.text = this.value;
  diagram.commitTransaction("input text");
  var tempText = tool.measureTemporaryTextBlock(this.value);
  var scale = this.textScale;
  var loc = textBlock.getDocumentPoint(go.Spot.Center);
  var pos = diagram.position;
  var sc = diagram.scale;
  var textscale = textBlock.getDocumentScale() * sc;
  if (textscale < tool.minimumEditorScale) textscale = tool.minimumEditorScale;
  // Add slightly more width/height to stop scrollbars and line wrapping on some browsers
  // +6 is firefox minimum, otherwise lines will be wrapped improperly
  var textwidth = (textBlock.naturalBounds.width * textscale) + 6;
  var textheight = (textBlock.naturalBounds.height * textscale) + 2;
  var left = (loc.x - pos.x) * sc;
  var top = (loc.y - pos.y) * sc;
  var paddingsize = 1;
  this.style.minWidth = 20 + tempText.measuredBounds.width * scale + "px";
  this.style.minHeight = 10 + tempText.measuredBounds.height * scale + "px";
  this.style.left = ((left - (textwidth / 2) | 0) - paddingsize) + "px";
  this.style.top = ((top - (textheight / 2) | 0) - paddingsize) + "px";
  this.rows = tempText.lineCount;

  // tool.textBlock.width = 60 + tempText.measuredBounds.width * scale + 'px';

  // var scale = this.textScale

  // var container = tool.textBlock.part.findObject("CONTAINER")
  // var { naturalBounds: bounds, location } = container


  // if (textarea.offsetWidth > bounds.width) {
  //   container.data.width = textarea.offsetWidth
  // }

  // if (textarea.offsetHeight > bounds.height) {
  //   container.data.height = textarea.offsetHeight
  // }

  // container.updateTargetBindings()


  // var point = container.getDocumentPoint(go.Spot.LeftSide)
  // textarea.style['left'] = point.x + 'px'



  // var loc = tool.textBlock.getDocumentPoint(go.Spot.Center)
  // var pos = tool.textBlock.diagram.position
  // var sc = tool.textBlock.diagram.scale
  // var textscale = tool.textBlock.getDocumentScale() * sc
  // if (textscale < tool.minimumEditorScale) {
  //   textscale = tool.minimumEditorScale
  // }

  // var textwidth = (textarea.style.offsetWidth * textscale)
  // var textheight = (textarea.style.offsetHeight * textscale)
  // var left = (loc.x - pos.x) * sc
  // var top = (loc.y - pos.y) * sc

  // textarea.style['left'] = ((left - (textwidth / 2) | 0)) + 'px'
  // textarea.style['top'] = ((top - (textheight / 2) | 0)) + 'px'
  textarea.rows = tool.textBlock.lineCount

}, false)

textarea.addEventListener('keydown', function (e) {
  var tool = TextEditor.tool
  if (tool.textBlock === null) return
  var keynum = e.which

  if (keynum === 13 && e.shiftKey) { //Shift Enter
    // tool.textBlock.text = textarea.innerText
    //tool.doDeactivate()

    if (tool.textBlock.isMultiline === false)
      e.preventDefault()

    tool.acceptText(go.TextEditingTool.Enter)

  } else if (keynum === 13) { // Enter
    tool.acceptText(go.TextEditingTool.Tab)
    return
  } else if (keynum === 9) { // Tab
    tool.acceptText(go.TextEditingTool.Tab)
    e.preventDefault()
    return
  } else if (keynum === 27) { // Esc
    tool.doCancel()

    if (tool.diagram !== null)
      tool.diagram.doFocus()
  }
}, false)

// handle focus:
textarea.addEventListener('focus', function (e) {
  var tool = TextEditor.tool
  if (!tool || tool.currentTextEditor === null) return

  if (tool.state === go.TextEditingTool.StateActive) {
    tool.state = go.TextEditingTool.StateEditing
  }

  if (tool.selectsTextOnActivate) {
    selectElementContents(textarea)
  }
}, false)

// Disallow blur.
// If the textEditingTool blurs and the text is not valid,
// we do not want focus taken off the element just because a user clicked elsewhere.
textarea.addEventListener('blur', function (e) {
  var tool = TextEditor.tool
  if (!tool || tool.currentTextEditor === null || tool.state === go.TextEditingTool.StateNone) return

  textarea.focus()

  if (tool.selectsTextOnActivate) {
    // textarea.select()
    // textarea.setSelectionRange(0, 9999)
    selectElementContents(textarea)
  }
}, false)


var TextEditor = new go.HTMLInfo()

TextEditor.valueFunction = function () { return textarea.innerText }

TextEditor.mainElement = textarea // to reference it more easily

// used to be in doActivate
TextEditor.show = function (textBlock, diagram, tool) {
  if (!(textBlock instanceof go.TextBlock)) return

  TextEditor.tool = tool  // remember the TextEditingTool for use by listeners

  // This is called during validation, if validation failed:
  if (tool.state === go.TextEditingTool.StateInvalid) {
    textarea.style.border = '3px solid red'
    textarea.focus()
    return
  }

  // This part is called during initalization:
  var loc = textBlock.getDocumentPoint(go.Spot.Center)
  var pos = diagram.position
  var sc = diagram.scale
  var textscale = textBlock.getDocumentScale() * sc
  if (textscale < tool.minimumEditorScale) textscale = tool.minimumEditorScale
  // Add slightly more width/height to stop scrollbars and line wrapping on some browsers
  // +6 is firefox minimum, otherwise lines will be wrapped improperly
  var textwidth = (textBlock.naturalBounds.width * textscale)
  var textheight = (textBlock.naturalBounds.height * textscale)
  var left = (loc.x - pos.x - textwidth / 2) * sc
  var top = (loc.y - pos.y - textheight / 2) * sc

  textarea.innerText = textBlock.text
  // the only way you can mix font and fontSize is if the font inherits and the fontSize overrides
  // in the future maybe have textarea contained in its own div
  diagram.div.style['font'] = textBlock.font

  textarea.style['position'] = 'absolute'
  textarea.style['zIndex'] = '100'
  textarea.style['font'] = 'inherit'
  textarea.style['fontSize'] = (textscale * 100) + '%'
  textarea.style['lineHeight'] = 'normal'
  textarea.style['minWidth'] = (textwidth) + 'px'
  textarea.style['left'] = left + 'px'
  textarea.style['top'] = top + 'px'
  textarea.style['textAlign'] = textBlock.textAlign
  textarea.style['margin'] = '0'
  textarea.style['padding'] = '0'
  textarea.style['border'] = '0'
  textarea.style['outline'] = 'none'
  textarea.style['whiteSpace'] = 'pre-wrap'
  textarea.style['overflow'] = 'hidden' // for proper IE wrap
  textarea.rows = textBlock.lineCount
  textarea.textScale = textscale // attach a value to the textarea, for convenience
  textarea.className = 'goTXarea'

  // Show:
  diagram.div.appendChild(textarea)

  // After adding, focus:
  textarea.focus()
  if (tool.selectsTextOnActivate) {
    // textarea.select()
    // textarea.setSelectionRange(0, 9999)
    selectElementContents(textarea)
  }
}

TextEditor.hide = function (diagram, tool) {
  diagram.div.removeChild(textarea)
  textarea.innerText = textarea.innerHTML = ''
  TextEditor.tool = null  // forget reference to TextEditingTool
}

export default TextEditor
