console.log("NM.content: Running");

//MESSAGES
//Request the math codes from the content
var CODES_FROM_PAGE_REQUEST = "find_maths";
//Request to store the codes in background
var CODES_FROM_PAGE_ANSWER = "store_codes";

// --------------------- UTILITIES -----------------------------

function getEquationBlocks(node){
  return node.getElementsByClassName("notion-equation-block");
}
function getAnnotations(node){
  return node.getElementsByTagName('annotation');
}

function cleanCode(code) {
  let cleaned = code.replace(/amp;/g, "");
  return cleaned;
}

function getCodeFromAnnotation(annotation) {
  return cleanCode(annotation.innerHTML);;
}

function getCodesFromAnnotations(annotations){
  let codes = [];
  for (let i = 0; i < annotations.length; i++)
    codes.push(getCodeFromAnnotation(annotations[i]));
  return codes;
}

function getCodeFromEqBlock(eq_block) {
  let id = eq_block.dataset.blockId;
  let code = getCodesFromAnnotations(getAnnotations(eq_block))[0];
  return {
    id: id,
    code: code
  }
}

function getCodesFromEqBlocks(eq_blocks){
  let codes = [];
  for(let i = 0; i < eq_blocks.length; i++)
    codes.push(getCodeFromEqBlock(eq_blocks[i]));
  return codes;
}

function getCodesFromPage() {
  let codes = getCodesFromEqBlocks(getEquationBlocks(document));
  return codes;
}

function encodeCodesFromPage(){
  let codes = getCodesFromPage();
  return  msg = {
    type: CODES_FROM_PAGE_ANSWER,
    codes: codes
  };
}

function printCodesMsg(msg){
  console.log("NM.content : Codes Message : ");
  console.log("NM.content : Codes Message : type    :" + msg.type);
  console.log("NM.content : Codes Message : #codes  : " + msg.codes.length);
  console.log("NM.content : Codes Message : codes   :  " + msg.codes.length);
  for (let i = 0; i < msg.codes.length; i++) {
    code = msg.codes[i];
    console.log("NM.content :  Codes Message : codes   : id"+i+"    : " + code.id);
    console.log("NM.content :  Codes Message : codes   : code"+i+"  : " + code.code);
  }
}

//------------------------- LOGIC -------------------------------------

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("NM.NM.content : Received a message : ");
    console.log("NM.NM.content : Received a message : ", request.type);
    if(request.type === CODES_FROM_PAGE_REQUEST){
      let msg = encodeCodesFromPage();
      console.log("NM.NM.content : Received a message : preparing response");
      printCodesMsg(msg);
      sendResponse(msg);
      return true;
    }
  });



//------------------ IN PAGE POPUP -------------------------------------

function inpage_popup_open(code) {
  console.log(code);
  var w = 800;
  var h = 300;
  var l = Math.floor((screen.width-w)/2);
  var t = Math.floor((screen.height-h)/2);

  let synced = false;
  chrome.storage.local.set(
                            { "inpage_code_id" : code
                            },
                            function() {
                              synced = true;
                            }
                           );


  let inpage_popup = window.open(chrome.extension.getURL('inpage_popup.html'),"NotionMath : Advanced Editor","width=" + w + ",height=" + h + ",top=" + t + ",left=" + l);

  inpage_popup.focus();
  //newin = window.open(chrome.extension.getURL('inpage_popup.html'),'titolo','scrollbars=no,resizable=yes, width=200,height=200,status=no,location=no,toolbar=no');
}

var options = {};
var options_synced = false;
window.onload = function(){
  let codes = getEquationBlocks(document);
  console.log(codes);
  for(let i = 0; i < codes.length; i++){
    let code = codes[i];
    console.log(code);
    code.addEventListener(
      "click",
      function(){

        chrome.storage.local.get(
              ["encoded_saved_options_id"],
              function(result) {
                    if(result["encoded_saved_options_id"]){
                      options  =
                          result["encoded_saved_options_id"];
                      options_synced = true;
                      console.log("LOAD OPTIONS COMPLETED!");
                      console.log(options);
                    }
                }
              );
        function waitForStorage(){
            if(options_synced){
              inpage_popup_options = options["in_page_popup"];
              if(inpage_popup_options){
                inpage_popup_open(getCodeFromEqBlock(code));
              }
            }
            else{
                console.log("Waiting Storage!");
                setTimeout(waitForStorage, 5);
            }
        }
        waitForStorage();

      }
    );
  }

}







function apri(url) { newin = window.open(url,'titolo','scrollbars=no,resizable=yes, width=200,height=200,status=no,location=no,toolbar=no'); }
