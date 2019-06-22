const source = [];

const createVertexTemplateEntry = function (style, width, height, value, title, showLabel, showTitle, tags) {

}

addSearchPalette(true);
addGeneralPalette(true);
addMiscPalette(false);
addAdvancedPalette(false);
addBasicPalette(dir);
addStencilPalette('arrows', mxResources.get('arrows'), dir + '/arrows.xml',
  ';whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
addUmlPalette(false);
addBpmnPalette(dir, false);
addStencilPalette('flowchart', 'Flowchart', dir + '/flowchart.xml',
  ';whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
addImagePalette('clipart', mxResources.get('clipart'), dir + '/clipart/', '_128x128.png',
  ['Earth_globe', 'Empty_Folder', 'Full_Folder', 'Gear', 'Lock', 'Software', 'Virus', 'Email',
    'Database', 'Router_Icon', 'iPad', 'iMac', 'Laptop', 'MacBook', 'Monitor_Tower', 'Printer',
    'Server_Tower', 'Workstation', 'Firewall_02', 'Wireless_Router_N', 'Credit_Card',
    'Piggy_Bank', 'Graph', 'Safe', 'Shopping_Cart', 'Suit1', 'Suit2', 'Suit3', 'Pilot1',
    'Worker1', 'Soldier1', 'Doctor1', 'Tech1', 'Security1', 'Telesales1'], null,
  {
    'Wireless_Router_N': 'wireless router switch wap wifi access point wlan',
    'Router_Icon': 'router switch'
  });

export default source;