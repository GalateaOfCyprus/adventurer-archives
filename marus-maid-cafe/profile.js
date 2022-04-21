$(document).ready(function() {
  placesPlease();
});

///////////
// SETUP //
///////////

function placesPlease(){
  try {
    nodeKiller();
  } catch {
    console.log('Node surrendered and was spared.')
  }
}

function nodeKiller(){
  var body = document.getElementsByTagName('body')[0];
  body.removeChild(body.childNodes[4]);
}