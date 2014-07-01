
// Global
var myRemote;
var navURL;
var myNavPopup;
var mainEditor;

iens6=document.all||document.getElementById
ns4=document.layers

<!--GLOBAL VARIABLES-->
var thename
var theobj
var thetext
var winHeight
var winPositionFromTop
var winWidth
var startH=2
var openTimer
var scrollSpeed=30
var CURSOR_POS = 0;
var ON_DIV_MENU_ITEM = false;
var oldPopUpDiv = null;
<!--END GLOBAL VARIABLES-->

var description=new Array()



function launch(newURL, newName, newFeatures, orgName) {
remote = window.open(newURL, newName, newFeatures);
  if (remote.opener == null)
    remote.opener = window;

  remote.opener.name = orgName;
  return remote;
}

function openWindow(loc) {
  var winl = (screen.width-750)/2;
  var wint = (screen.height-640)/2;

  myRemote = launch(loc,"FreeSurveys1","height=640,width=750,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,top="+wint + ",left=" + winl,"Help");
  window.myRemote.focus();  
}

function printWindow(loc) {
    var winl = (screen.width-750)/2;
    var wint = (screen.height-640)/2;

    myRemote = launch(loc,"FreeSurveys1","height=640,width=750,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,top="+wint + ",left=" + winl,"Help");
    window.myRemote.focus();
    myRemote.onload=function() {
        myRemote.print();
    };
}

function openPreview(loc) {
  var winl = (screen.width-800)/2;
  var wint = (screen.height-640)/2;

  myRemote = launch(loc,"FreeSurveys1","height=640,width=1130,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,top="+wint + ",left=" + winl,"Help");
  window.myRemote.focus();  
}

function openPreviewII(loc) {
  var winl = (screen.width-800)/2;
  var wint = (screen.height-640)/2;

  myRemote = launch(loc,"FreeSurveys1","height=640,width=1130,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,top="+wint + ",left=" + winl,"Help");
  window.myRemote.focus();
  return myRemote;
}



function openLargeWindow(loc) {
  var winl = (screen.width-1040)/2;
  var wint = (screen.height-640)/2;

  myRemote = launch(loc,"FreeSurveys1","height=640,width=1024,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,top="+wint + ",left=" + winl,"Help");
  window.myRemote.focus();  
}

function openWindowWithMenu(loc) {
  var winl = (screen.width-750)/2;
  var wint = (screen.height-640)/2;
  myRemote = launch(loc,"WindowWithMenu","height=640,width=800,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=1,resizable=1,scrollbars=1,status=0,toolbar=1,top="+wint+",left="+winl,"Help");
  window.myRemote.focus();  
}


function openSlideShow(loc) {
  myRemote = launch(loc,"SlideShow1","height=640,width=800,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0","Help");
  window.myRemote.focus();  
}

function miniPopup(loc) {
  var winl = (screen.width-450)/2;
  var wint = (screen.height-300)/2;

  myRemote = launch(loc,"FreeSurveys2","height=300,width=450,channelmode=0,dependent=0,directories=0,fullscreen=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,top=" + wint + ",left=" + winl,"Help");
  window.myRemote.focus();
}


function gotoLoc (loc) {
  var winl = (screen.width-640)/2;
  var wint = (screen.height-750)/2;

  myRemote = launch(loc,"FreeSurveys","height=640,width=750,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,top=" + wint + ",left=" + winl,"Help");
  window.myRemote.focus();
}

function gotoLocII(loc) {
  var winl = (screen.width-640)/2;
  var wint = (screen.height-750)/2;

  myRemote = launch(loc,"FreeSurveys","height=640,width=750,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0,top=" + wint + ",left=" + winl,"Help");
  window.myRemote.focus();
  return myRemote;
}

function helpWindow(loc) {
  var winl = (screen.width-800)/2;
  var wint = (screen.height-700)/2;

  myRemote = launch(loc,"FreeSurveys3","height=700,width=800,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=1,toolbar=1,location=1,top=" + wint + ",left=" + winl,"Help");
  window.myRemote.focus();
}

function helpVideo(loc) {
  var winl = (screen.width-800)/2;
  var wint = (screen.height-700)/2;

  myRemote = launch(loc,"HelpVideo","height=390,width=650,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=1,toolbar=1,location=1,top=" + wint +

",left=" + winl,"Help");
  window.myRemote.focus();
}

function addQuestion(form , base) {
   base += "?location=";
   base += form.location.options[form.location.selectedIndex].value;
   base += "&questionCategory=";
   base += form.questionCategory.options[form.questionCategory.selectedIndex].value;

   gotoLoc(base);
}


function refreshForm(form) {
    opener.document.forms[form].submit();
    window.close();
}

function refreshBuilder() {
    opener.document.DummyForm.submit();
    window.close();
}



function refreshLocation(loc) {
  if (opener && opener.document) {
    opener.document.location=loc;
    window.close();
  } else {
    document.location=loc;
  }
}

function refreshLocationWithAlert(loc, msg) {
  opener.document.location=loc;
  alert(msg);
  window.close();
}


function openWindowConditionalAlert(loc, condition, falseMessage) {
  if(condition == "true" ) {
    openWindow(loc);        
  } else {
    alert(falseMessage);
  }
}

function openPreviewConditionalAlert(loc, condition, falseMessage) {
  if(condition == "true" ) {
    openPreview(loc);        
  } else {
    alert(falseMessage);
  }
}


function closeWindow() {
  if (isInternetExplorer()) {
    window.opener='x';
  }
  window.close();
}

function refreshAdmin() {
  refreshLocation('showUpdate.do');
}

function refreshList() {
  refreshLocation('listSurveys.do');
}

function deleteWindow (loc) {
    if (confirm("Are You Sure ?")) {
        document.location = loc;
    }
}

function confirmDelete(loc, message) {
    if (confirm(message)) {
        document.location = loc;        
    }
}

function DropDownMenu(entered) {
  with (entered) {
  ref=options[selectedIndex].value;
  document.location=ref;
  }
}


function DropDownMenuWithPrefix(prefix, entered) {
  ref=entered.options[entered.selectedIndex].value;
  prefix += ref;
  document.location=prefix;
}

function DropDownMenuWithPrefixPopup(prefix, entered) {
  if (entered.selectedIndex > 0) {
    ref = entered.options[entered.selectedIndex].value;
    prefix += ref;
    gotoLoc(prefix);
  }
}


function SetChecked(val) {
  dml=document.form[0];
  len = dml.elements.length;
  var i=0;
  for( i=0 ; i<len ; i++) {
    if (dml.elements[i].name=='questionID') {
      dml.elements[i].checked=val;
    }
  }
}


function lookupAndClose(elementName, value) {
    for (i=0; i < 5; i++) {    
      if (opener.document.forms[i].elements[elementName]) {
        opener.document.forms[i].elements[elementName].value = value;
        break;
      }
    }
    window.close();
}

function lookupDivAndClose(elementName, value, divId) {
    opener.document.forms[0].elements[elementName].value = value;
    var divElement = opener.document.getElementById(divId);
    divElement.innerHTML = value;
    window.close();
}

function transferValueFromPopUp(openerFormName, openerFormElementName, value, loc) {
        
        loc += "&overrideStylesheet=";
        loc += value;

        top.frames["main"].document.location = loc;
        top.opener.document.forms[openerFormName].elements[openerFormElementName].value = value;
}

function gotoTopFrame(loc) {
  if (top != self) {
    // We are in a frame
    top.location = loc;
  } else {
    document.location = loc;
  }
}


function printFrame() {
    parent.frames[1].focus();
    parent.frames[1].print(); 
}

function loadFrame(url) {
    parent.frames[1].document.location = url;
}

function loadTop(url) {
    parent.document.location = url;
}


function goBack() {
  window.history.go(-1);
}

function setCookie(name, value) { 
  var expFromNow = 60*24*60*60*1000;  // Expires in 60 Days
  var exp = new Date(); 
  exp.setTime(exp.getTime() + expFromNow);
  document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

function setSessionCookie(params) {
  var expFromNow = params.expires ? params.expires : 0;
  var exp = new Date(); 
  exp.setTime(exp.getTime() + expFromNow);
  document.cookie = params.name + "=" + params.value + ";" + 
	(params.expires ? "expires=" + exp.toGMTString() : "") ;
}

function adjustEmbedSurveyFrameHeight(params) {
//    alert(params.referrer);
    if (!params.referrer) {
	return;
    }

    ref = params.referrer;
    window.onload = function () {
        var afterHash = ref.split("#").length > 1 ? ref.split("#")[1] : null;
        var afterQuery = ref.split("?").length > 1 ? ref.split("?")[1].split("#")[0] : null;
        ref = ref.substring(0, ref.indexOf("?") >=0 ? ref.indexOf("?") :
                            (ref.indexOf("#") >=0 ? ref.indexOf("#") : ref.length) );
        //alert("ref : " + ref + " after : " + afterQuery + " hash : " + afterHash);
        params.src = ref + (afterQuery ? "?" + afterQuery  : "?") +
           "&rand=" + Math.random() +
            (afterHash ? "#" + afterHash : "#") +
            "&mode=m1&height=" + 
	    (document.getElementById('SurveySubmitButton') ? 
	     $("#SurveySubmitButton").position().top + 85 : 
	     $("#SurveyContent").height() + 50);
        //alert('src : ' + params.src);
	renderEmbedSurveyIframe(params);
    };
}

function renderEmbedSurveyIframe(params) {
    var iframeID = "innerIframe_" + params.surveyID;
    //alert(' src : ' + params.src + ' inner : ' + iframeID);
    params.frameID = iframeID;
    params.frameDivID = "embedSurvey";
    frame = addIframe(params);
}


function addIframe(params) {
    var id = params.frameID
    //alert("is ie 7 : "  + isIE7());
    if (isIE7()) {
        document.getElementById(params.frameDivID).innerHTML = "<iframe id='" + id + "' name='" + id + "' "+
        " style='width:100%;height:1px;display:none;' " +
        " src='" + params.src +
        "'></iframe>";
    } else {
        var script = document.createElement("iframe");
        script.setAttribute("id",id);
        script.setAttribute("name",id);
        script.setAttribute("src",params.src);
        script.setAttribute("style","width:100%;height:1px;");
        document.getElementById(params.frameDivID).appendChild(script);
	$('#' + id ).attr('src', params.src);
	//alert('frame dded ' + script);
    }
    return document.getElementById(id);
}

function isIE7() {
    if (navigator.appName.indexOf("Microsoft Internet Explorer") >= 0) {
        var version = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf("MSIE")+4));
        if(version == 7 || version == 8) {
            return true;
        }
    }
    return false;
}

function getCookie(Name) 
{
        var search = Name + "="   
        if (document.cookie.length > 0) 
        { 
                offset = document.cookie.indexOf(search);
                if (offset != -1) //DOES COOKIE EXIST
                { 
                        offset += search.length;
                        end = document.cookie.indexOf(";", offset);
                        if (end == -1);
                                end = document.cookie.length;
                        end = offset + 1; //SINCE THE VALUE IS 0, IT HAS A LENGTH OF 1
                        return unescape(document.cookie.substring(offset, end));
                }    
        }
}

function checkForNotNull(field, message){
	txt = field.value;	
	if(txt == null || txt.length < 1){
		alert(message);
		return false;
	}
	else{
		return true;		
	}

}


function logSiteRef() {
  var siteRef;          
  var loc = document.location.href;
  index = loc.indexOf("siteRef=");
  if ( index >= 0) {
    siteRef=loc.substring(index+8);
    setCookie("siteRef", siteRef);        
  }
}

function closeFrame() {
  top.document.location=top.frames['main'].location;
}

function processAlerts(str){
	alert(str);
}


function modifyText(id, text) {
        if(document.getElementById && text != '') {
          obj = document.getElementById(id);
          if (obj) {
            obj.innerHTML = text;
          }
        }
}

function modifyTextNoCheck(id, text) {
        if(document.getElementById) {
          obj = document.getElementById(id);
          if (obj) { 
           obj.innerHTML = text;
          }
        }
}

function microPollOptionModifyDivColor (id, selectBox, customColorField) {
        for (i=1; i > 0; i++) {
                var idStr = id+"_"+i;
                if(document.getElementById(idStr)) {
                        modifyDivColor(idStr, selectBox, customColorField);
                } else {
                        break;
                }
        }
}

function modifyDivColor(id, selectBox, customColorField) {
        if (document.getElementById) {
           obj = document.getElementById(id);
           if (selectBox.selectedIndex >= 0) {
             var selectedValue = selectBox.options[selectBox.selectedIndex].value;
             if (selectedValue == "-1") {
                selectedValue = customColorField.value;
             }

             obj.style.color = selectedValue;
           }
        }
}

function modifyDivBackgroundColor(id, selectBox, customColorField) {
        if (document.getElementById) {
           obj = document.getElementById(id);
           if (selectBox.selectedIndex >= 0) {
             var selectedValue = selectBox.options[selectBox.selectedIndex].value;
             if (selectedValue == "-1") {
                selectedValue = customColorField.value;
             }

             //obj.style.color = selectedValue;
               obj.style.backgroundColor = selectedValue;
           }
        }
}

function modifyDivBorderColor(id, selectBox, customColorField) {
        if (document.getElementById) {
           obj = document.getElementById(id);
           if (selectBox.selectedIndex >= 0) {
             var selectedValue = selectBox.options[selectBox.selectedIndex].value;
             if (selectedValue == "-1") {
                selectedValue = customColorField.value;
             }

             obj.style.borderColor = selectedValue;
           }
        }
}

function modifyTableBorderColor(id, selectBox, customColorField) {
        if (document.getElementById) {
           obj = document.getElementById(id);
           if (selectBox.selectedIndex >= 0) {
             var selectedValue = selectBox.options[selectBox.selectedIndex].value;
             if (selectedValue == "-1") {
                selectedValue = customColorField.value;
             }

             obj.style.borderColor = selectedValue;
           }
        }
}

function validate(field, fieldID, validator) { 
        if (field.value != null && field.value.length > 0) {
            if (validator.indexOf(".") >= 0) {
                validateRemote(field, fieldID, validator);        
            } else {
                validateLocal(field, fieldID, validator);
            }
        }
}


function validateLocal(field, fieldID, validator) {
        // Local Validator
        if (validator.indexOf("MinLength") >= 0) {
          validateMinLength(field, fieldID, validator);
        } else if (validator.indexOf("Confirm") >= 0) {
          validateConfirm(field, fieldID, validator);
        } else if (validator.indexOf("Checked") >= 0) {
          validateChecked(field, fieldID, validator);
        }
}


function validateConfirm(field, fieldID, validator) {
        confirmFieldName = getDataBetweenBraces(validator);
        confirmFieldNameObject = field.form.elements[confirmFieldName];
        if (confirmFieldNameObject) {
          confirmValue = confirmFieldNameObject.value;
          if (field.value != confirmValue) {
              errorField(fieldID, 'Passwords do not match');
          } else {
              clearField(fieldID);             
          }

        } else {
          // bad mojo
          alert("Field : " + confirmFieldName + " Not Found");
        }
        
}

function validateChecked(field, fieldID, validator) {
        if (field.checked) {
            clearField(fieldID);
        } else {
            errorField(fieldID, 'Field must be checked');
        }
}

function validateMinLength(field, fieldID, validator) {
        minLength = getDataBetweenBraces(validator);
        if (field.value.length < minLength) {
            errorField(fieldID, 'Field has to be ' + minLength + ' characters');
        } else {
            clearField(fieldID);
        }
}

function errorField(fieldID, errorMessage) {
        changeTextClass('Field_' + fieldID, 'errorBox');
        modifyText('Field_Message_' + fieldID, errorMessage);
        // modifyText('Field_Status_' + fieldID, '<img src=\'/images/alert_error.gif\'');
}
function clearField(fieldID) {
        changeTextClass('Field_' + fieldID, 'text');
        modifyTextNoCheck('Field_Message_' + fieldID, '');
        // modifyText('Field_Status_' + fieldID, '<img src=\'/images/alert_success.gif\'');
}

function getDataBetweenBraces(val) {
        retval = val.substring(val.indexOf("(") + 1, val.indexOf(")"));
        return retval;
}

function validateRemote(field, fieldID, validator) {
        // Remote Validator
        url = 'validate.do?vClass=' + validator + '&fieldID=' + fieldID + '&payload=' + field.value;
        ajaxLinkSilent('Field_' + fieldID, url);
}

function changeTextClass(id, stylesheetClass) {
        if(document.getElementById) {        
          obj = document.getElementById(id);
          obj.className=stylesheetClass;
        }        
}

function changeDualTextClass(id1, id2, stylesheetClass1, stylesheetClass2) {
        changeTextClass(id1, stylesheetClass1);
        changeTextClass(id2, stylesheetClass2);
}



function printLocation(loc) {
  myRemote = launch(loc,"FreeSurveys1","height=700,width=600,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,toolbar=0","Help");
  window.myRemote.focus();  
  if (window.print) {
    window.print();
  }

}

function deliverWebPage(appURL) {
  var url = appURL + "?url=" + document.location;
  miniPopup(url);
}

function replace(string,text,by) {
// Replaces text with by in string
    var strLength = string.length, txtLength = text.length;
    if ((strLength == 0) || (txtLength == 0)) return string;

    var i = string.indexOf(text);
    if ((!i) && (text != string.substring(0,txtLength))) return string;
    if (i == -1) return string;

    var newstr = string.substring(0,i) + by;

    if (i+txtLength < strLength)
        newstr += replace(string.substring(i+txtLength,strLength),text,by);

    return newstr;
}

function highlightSelection(postLink, statusDivID, contentDivID) {
    var selection = window.getSelection();
    if (selection) {
      var range = selection.getRangeAt(0);        
      if (range) {

        var newNode = document.createElement("span");
        var id = Math.floor(Math.random());

        newNode.setAttribute("style", "background-color: yellow;");
        newNode.setAttribute("id", id);
        range.surroundContents(newNode);

        selection.removeAllRanges();

        var content = document.getElementById(contentDivID);
        
        ajaxLink(statusDivID, postLink + escape(content.innerHTML));        
      }
    }

        
}

function getSel() {
	if (document.getSelection) txt = document.getSelection();
	else if (document.selection) txt = document.selection.createRange().text;
	else return;
        
        return txt;
}


function checkSelection(typeVal) {
  mySelection = getSel();
  if (mySelection) {
        document.forms[0].decorationType.value = typeVal;
        document.forms[0].decorationValue.value = mySelection;
        document.forms[0].submit();
  } else {
        alert ("Please Select Text and then Click on the Icon");
  }
}

function changeMode(form, value) {
  form.singleDisplayMode.value = value;
  form.changeQuestionType.value = "true";
  form.submit();
}



function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_findObj(n, d) { //v4.0
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && document.getElementById) x=document.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

function MM_nbGroup(event, grpName) { //v3.0
  var i,img,nbArr,args=MM_nbGroup.arguments;
  if (event == "init" && args.length > 2) {
    if ((img = MM_findObj(args[2])) != null && !img.MM_init) {
      img.MM_init = true; img.MM_up = args[3]; img.MM_dn = img.src;
      if ((nbArr = document[grpName]) == null) nbArr = document[grpName] = new Array();
      nbArr[nbArr.length] = img;
      for (i=4; i < args.length-1; i+=2) if ((img = MM_findObj(args[i])) != null) {
        if (!img.MM_up) img.MM_up = img.src;
        img.src = img.MM_dn = args[i+1];
        nbArr[nbArr.length] = img;
    } }
  } else if (event == "over") {
    document.MM_nbOver = nbArr = new Array();
    for (i=1; i < args.length-1; i+=3) if ((img = MM_findObj(args[i])) != null) {
      if (!img.MM_up) img.MM_up = img.src;
      img.src = (img.MM_dn && args[i+2]) ? args[i+2] : args[i+1];
      nbArr[nbArr.length] = img;
    }
  } else if (event == "out" ) {
    for (i=0; i < document.MM_nbOver.length; i++) {
      img = document.MM_nbOver[i]; img.src = (img.MM_dn) ? img.MM_dn : img.MM_up; }
  } else if (event == "down") {
    if ((nbArr = document[grpName]) != null)
      for (i=0; i < nbArr.length; i++) { img=nbArr[i]; img.src = img.MM_up; img.MM_dn = 0; }
    document[grpName] = nbArr = new Array();
    for (i=2; i < args.length-1; i+=2) if ((img = MM_findObj(args[i])) != null) {
      if (!img.MM_up) img.MM_up = img.src;
      img.src = img.MM_dn = args[i+1];
      nbArr[nbArr.length] = img;
  }
 }
}


function applyText(val, control) {
  control.value = val;
}


function warnForInactivity(expiryTimeInMinutes) {
  alert ("Your Session Will Expire in " + expiryTimeInMinutes + " minutes due to Inactivity. Please Respond to the Survey!");
}


function openURLWithAlert(alertMessage, url) {
  alert(alertMessage);
  document.location = url;
}


function submitAction(form, name, value) {
  form.elements[name].value = value;
  form.submit();
}

function showCollapse(id) {
    var div = document.getElementById(id);
    var image = document.getElementById(id + "_sign");
    if (div.style.display == 'none') {
        div.style.display='block';
        image.src='/images/minus.gif';
    } else {
        hideDiv(id);
        image.src='/images/plus.gif';
    }   
}

function showCollapseFade(linkNode, id) {
    showCollapse(id);
}

function showCollapseBlock(id) {
        if(document.getElementById) {
          obj = document.getElementById(id);
          if (obj.style.display == 'block') {
            obj.style.display='none';
	       
          } else {
            obj.style.display='block';        
          }
        }
}


function showCollapseConditional(val, comparison, id) {      
      if(document.getElementById) {
          obj = document.getElementById(id);
          if (val == comparison) {
            obj.style.display='inline';        
          } else {
            obj.style.display='none';
          }
      }
}

function showMultiDiv(maxOptionIndex, selectElement, divPrefix) {
      if(document.getElementById) {
          // First Hide all the DIVS
          for (i = 0; i < maxOptionIndex; ++i) {
            elementId = divPrefix + i;
            obj = document.getElementById(elementId);
            if (obj && obj != null) {
                obj.style.display='none';
            }
          }
          elementId = divPrefix + selectElement.value;      
          obj = document.getElementById(elementId);
          if (obj && obj != null) {
            obj.style.display='inline';  
          }
      }
}

function showAllConditionalDivs(selectElement, divPrefix) {
      
      var values = new Array();
      
      var type = selectElement.type;
      if(type == 'radio') {
         values = document.getElementsByName(selectElement.name); 
      } else {
  	//Default to select/dropdown
        values = selectElement.options; 	
      }

      if(document.getElementById) {
        for (i=0; i < values.length;i++) {
          for (j = 0; j < 20; ++j) {
            elementId = divPrefix + values[i].value + '-' + j;
            obj = document.getElementById(elementId);
            if (obj && obj != null) {
              obj.style.display='none';
            }
          }
        }

        for (i = 0; i < 20; i++) {
          elementId = divPrefix + selectElement.value + '-' + i;
          obj = document.getElementById(elementId);
          if (obj && obj != null) {
            obj.style.display='block';
          }
        }
      } 
}
                
function showMultiDivIndex(maxOptionIndex, selectElement, divPrefix) {
      if(document.getElementById) {
          // First Hide all the DIVS
          for (i = 0; i < maxOptionIndex; ++i) {
            elementId = divPrefix + i;
            obj = document.getElementById(elementId);
            if (obj && obj != null) {
                obj.style.display='none';
            }
          }
          elementId = divPrefix + selectElement.selectedIndex;
          obj = document.getElementById(elementId);
          if (obj && obj != null) {
            obj.style.display='inline';  
          }
      }
}

function showCollapseConditional1(val, questionDiv, ansDiv, ansStr, questionStr) {

 	if(document.getElementById) {
		qObj = document.getElementById(questionDiv);
		aObj = document.getElementById(ansDiv);
	  	if(val != -1) {
			document.getElementById(questionDiv).innerHTML = questionStr;
			document.getElementById(ansDiv).innerHTML = ansStr;
			qObj.style.display='inline';	          	
			aObj.style.display='inline';	          	
	  	}else{
			qObj.style.display='none';
			aObj.style.display='none';
	  	}
      	}
}

function showCollapseConditionalCheckbox(checkboxElement, id) {    
      if(document.getElementById) {
          obj = document.getElementById(id);
          if (checkboxElement.checked) {
            obj.style.display='';        
          } else {
            obj.style.display='none';
          }
      }
}

function rolloverDiv(tableRow, inout, divid) {
  if (document.getElementById) {
        var obj = document.getElementById(divid);
        if (obj) {
          if (inout) {
            obj.style.display='block';
          } else {
            obj.style.display='none';
          }
        }
  }
  if (tableRow) {
        if (inout) {
          tableRow.style.background='#ffffcc';
        } else {
          tableRow.style.background='#ffffff';
        }
  }
}

function rolloverHighlightId(elementId, inout, hColor) {
  return rolloverHighlight(document.getElementById(elementId), inout, hColor);
}

function rolloverHighlight(element, inout, hColor) {
  if (element) {
        if (inout) {
                element.setAttribute("class", "AnswerText newMatrixPadding "+hColor);
        } else {
                element.setAttribute("class", "AnswerText newMatrixPadding");
        }
  }
}

function rolloverHighlight1(element) {
        element.className='highlight';
        if (!element.onmouseout) {
                element.onmouseout=function() {element.className='nohighlight';};
        }
}

function showBuyMoreLink(element, surveyID, activeSurveyID) {
    var buyMoreID = "buyMore_" + surveyID;
    document.getElementById(buyMoreID).style.display="block";
    if(surveyID != activeSurveyID) {
        element.onmouseout=function() {document.getElementById(buyMoreID).style.display="none";element.className='nohighlight';};
    }
}

function assignClass(divid, clazz) {
    if (document.getElementById) {
        var currTableRow = document.getElementById(divid);
        currTableRow.className=clazz;
    }
}

function toggleMultiSelect(selectName) {
    var link = document.getElementById('href_' + selectName); 
    var selects = document.getElementsByName(selectName);
    if (selects[0].multiple == true) {
        selects[0].multiple = false;
        link.innerHTML="Multiple"; 
    } else {
        selects[0].multiple = true;
        link.innerHTML="Single";
    }
}


function fillSelectList(selectInput, targetSelectBox, myArray) {
  var target = selectInput.form.elements[targetSelectBox];
        
  while(target.options.length) {
        target.options[0] = null;
  }

  var arr = myArray[selectInput.selectedIndex];

  for(i = 0; i < arr.length; ++i) {
        target.options[i] = arr[i];
  }

}

function showHelp(selectInput, sourceDivId) {
        if (selectInput.selectedIndex >= 0) {
                var index = selectInput.selectedIndex;
                docLocation = "/help/" + selectInput.options[index].value + "-ajax.html";
                ajaxInlinePopup(sourceDivId, docLocation);
        }
}

function enableTextbox(textBox, checkBoxState){	
	if(checkBoxState==true){
		textBox.disabled=false;
	}       
	else{   
		textBox.disabled=true;
	}       
}

function insertRowDisplayTag(textBox, checkBoxState){

	var str = textBox.value;

	
	if(checkBoxState==true && str.indexOf("<display=row>") < 0){
		textBox.value = str+ "\r\n\r\n\r\n" +
				"<display=row>";
        }
        else if(str.indexOf("<display=row>") >= 0 && checkBoxState==false){
        	sindex = str.indexOf("<display=row>");
		str = str.substring(0,sindex) + 
			str.substring(sindex+"<display=row>".length +1, str.length);
		textBox.value = str;
        }

}


function populateConversionSurveys(url){
	document.location = url
}

function openSmallWindow (loc) {
  myRemote = launch(loc,"FreeSurveys","height=100,width=250,channelmode=0,dependent=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=0,status=0,toolbar=0","Help");
  window.myRemote.focus();
}


function navPopup(id, title, itemTitle, itemURL, itemPopup) {
   var mye,mye2,menu;
   var open=0;
   // Set the navURL;
   navURL = itemURL;
   myNavPopup = itemPopup;

   var startx=0,starty=0;
   if (!id || id == "") {
        id = 0;
   }

   if ((mye = document.getElementById(id)) == null) return;


   for(var p = mye; p && p.tagName!='BODY'; p = p.offsetParent){
      startx += p.offsetLeft;
      starty += p.offsetTop;
   }

   if ((mye2 = document.getElementById("navcontrol_title")) == null) return;
   mye2.innerHTML = title;

   if ((menu = document.getElementById("navcontrol")) == null) return;
   menu.style.left = (startx-3)+"px";
   menu.style.top  = (starty-3)+"px";

   
   for (i = 0; i < itemTitle.length; ++i) {
        mye = document.getElementById("navcontrol_" + i);
        if (mye == null) {
          return;
        }
        mye.innerHTML = itemTitle[i];

        mye2 = document.getElementById("navcontrol_" + i + "_row");
        if (mye2 == null) {
          return;
        }
        mye2.style.display = "";
   }


   menu.style.display="";
   return;
}

function navClick(optionNumber) {
  if (navURL != null && optionNumber < navURL.length) {
    if (myNavPopup != null && optionNumber < myNavPopup.length) {
        if (myNavPopup[optionNumber]) {
                navClose();
                gotoLoc(navURL[optionNumber]);
                return;
        }
    }
    document.location = navURL[optionNumber];
  }
}


function navClose() {
  var mye2;
  if ((mye2 = document.getElementById("navcontrol")) == null) return;
  mye2.style.display="none";
}

function clearExistingData(mForm) {

  for (i=0; i < mForm.action.length; i++) {
    if (mForm.action[i].checked) {
       if(i == 1){
         delConfirm(mForm);
       } else {
         mForm.submit();
       }
     }
  }

}

function delConfirm(mForm){

        retVal = confirm("Once data is deleted there is no way to recover it.\r\n"+
                        "Are you sure you want to delete the data?");
        if(retVal == true){
                mForm.submit();
        }

}

function runningTotal(ary, outputDiv, validationTotal){
    var formObj = document.forms['run'];
    if(formObj == null){
	formObj = document.forms[2];
    }
    
    if (formObj.elements == null ){
	return;
    }
    
    var total=0;
    var filledBoxes=0;

    for (i=0; i<ary.length; i++){
	if (formObj.elements[ary[i]]) {
	    val = formObj.elements[ary[i]].value;
	    if(!isNaN(val) && val.length>0){
		total += parseInt(val);
		filledBoxes++;
	    }
	}
    }

    if (filledBoxes == ary.length && total != validationTotal) {
	filledBoxes = ary.length-1;
	total = total - parseInt(formObj.elements[ary[ary.length-1]].value);
	formObj.elements[ary[ary.length-1]].value='';
    }

    if (filledBoxes == ary.length-1){
	for (i=0;  i < ary.length; i++){
	    if (formObj.elements[ary[i]]) {
		val = formObj.elements[ary[i]].value;
		if(isNaN(val) || val.length ==0){
		    formObj.elements[ary[i]].value = (validationTotal-total) +"";
		    total = validationTotal;
		    break;
		}
	    }
	}
    }
    document.getElementById(outputDiv).innerHTML = "" + total;
}

function intValidation(val){

	for(i =0; i < val.length; i++){
		if(isNaN(val.charAt(i)+"")){			
			return false;
		}
	}
	return true;

}

function cSumIntValidation(textBox){

	if(!intValidation(textBox.value)){
		alert("Please enter a numeric value as Constant Sum Value");
		textBox.focus();
	}

}

function ajaxSubmitFormObjectAction(divID, url, htmlForm, evaluateJS, elementName, val) {
  htmlForm.elements[elementName].value = val;
  ajaxSubmitFormObjectFinal(divID, url, htmlForm, evaluateJS);
}

function ajaxSubmitForm(divID, url, formName) {
  var htmlForm = document.forms[formName];
  return ajaxSubmitFormObject(divID, url, htmlForm);
}
function ajaxSubmitFormObject(divID, url, htmlForm) {
  return ajaxSubmitFormObjectFinal(divID, url, htmlForm, false);
        
}

function addTableRow(tableID, tableRow, rowID) {
        
   var tableRef = document.getElementById(tableID);
   var newRow   = tableRef.insertRow(tableRef.rows.length);

   for (i=0; i < tableRow.length; i++) {        
        var newCell  = newRow.insertCell(i);
        newCell.innerHTML = tableRow[i];
   }       
   
   if (rowID) {
       newRow.setAttribute("id", rowID);
   }
           
}

//Sorry, cant make this function generic
function updateQuickPollAnswers (tableID, data) {
        synchronizeTextAreaToTable(tableID, data, 
          "<input type=\"radio\" name=\"u_quickPoll\" id=\"{row_number}\" value=\"{row_number}\">",
          "<label for=\"{row_number}\">{row_value}</label>");
}

function synchronizeTextAreaToTable(tableID, data, c1HTML, c2HTML) {
        var answerTable = document.getElementById(tableID);        
        var ary = new Array();
        ary = data.split("\n");
        var aryLen = 0;
        
        for (i=0; i < (answerTable.rows.length); i++) {
                answerTable.deleteRow(i);
        }

        for (i=0; i < ary.length; i++) {
                if (ary[i].length > 0) {
                        var newRow = answerTable.insertRow(i);
                        col1 = newRow.insertCell(0);
                        col2 = newRow.insertCell(1);
                                                
                        var rowIndex = i;
                        var rowNumber = (i+1);
                        var rowValue = ary[i];


                        column1HTML = c1HTML.replace(/\{row_number\}/g, rowNumber);
                        column2HTML = c2HTML.replace(/\{row_number\}/g, rowNumber);

                        column1HTML = column1HTML.replace(/\{row_value\}/g, rowValue);
                        column2HTML = column2HTML.replace(/\{row_value\}/g, rowValue);

                        column1HTML = column1HTML.replace(/\{row_index\}/g, rowIndex);
                        column2HTML = column2HTML.replace(/\{row_index\}/g, rowIndex);
                                
        
                        col1.innerHTML = column1HTML;
                        col2.innerHTML = column2HTML;
                        aryLen++;
                }
        }       

        for (i = answerTable.rows.length -1; i >= aryLen; i--) {
                answerTable.deleteRow(i);
        }

}


function synchronizeTextAreaToTable2(tableID, data, c1HTML, c2HTML) {
        var answerTable = document.getElementById(tableID);        
        var ary = new Array();
        ary = data.split("\n");
        var aryLen = 0;
        
        for (i=0; i < ary.length; i++) {
                if (ary[i].length > 0) {
                        aryLen++;

                        var rowIndex = i;
                        var rowNumber = (i+1);
                        var rowValue = ary[i];

                        if (i < answerTable.rows.length) {
                                // Updating
                                var row = answerTable.rows[i];
                                var c1 = row.cells[0];
                                var c2 = row.cells[1];

                                column1HTML = c1HTML.replace(/\{row_number\}/g, rowNumber);
                                column2HTML = c2HTML.replace(/\{row_number\}/g, rowNumber);
        
                                column1HTML = column1HTML.replace(/\{row_value\}/g, rowValue);
                                column2HTML = column2HTML.replace(/\{row_value\}/g, rowValue);

                                column1HTML = column1HTML.replace(/\{row_index\}/g, rowIndex);
                                column2HTML = column2HTML.replace(/\{row_index\}/g, rowIndex);


                                c1.innerHTML = column1HTML;

                                // Do NOT update c2.HTML

                        } else {
                                var newRow = answerTable.insertRow(i);
                                col1 = newRow.insertCell(0);
                                col2 = newRow.insertCell(1);
                                col2.style.fontSize = "8pt";
                                                
                                column1HTML = c1HTML.replace(/\{row_number\}/g, rowNumber);
                                column2HTML = c2HTML.replace(/\{row_number\}/g, rowNumber);
        
                                column1HTML = column1HTML.replace(/\{row_value\}/g, rowValue);
                                column2HTML = column2HTML.replace(/\{row_value\}/g, rowValue);

                                column1HTML = column1HTML.replace(/\{row_index\}/g, rowIndex);
                                column2HTML = column2HTML.replace(/\{row_index\}/g, rowIndex);
                                        
        
                                col1.innerHTML = column1HTML;
                                col2.innerHTML = column2HTML;
                        }
                }
        }       

        for (i = answerTable.rows.length -1; i >= aryLen; i--) {
                answerTable.deleteRow(i);
        }

}

//Sorry, cant make this function generic
function cyopDummyResults (tableID, data) {

        var answerTable = document.getElementById(tableID);
        var ary = new Array();
        ary = data.split("\n");
        var aryLen = 0;
        var tableRowCode = "<TR><TD style=\"color:#000000;text-align:left;\" > {option_text} </TD></TR>" +
                           "<TR><TD>" +
                           "<TABLE cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">" +
                           "<TR><TD bgcolor=\"#606060\" width=\"{percent_value}%\" height=\"10\"></TD>" +
                           "<TD width=\"{remander_percent_value}%\" height=\"10\" style=\"border:0; font-size: 8px; font-family:Tahoma; color:#000000;text-align:left;\">" +
                           "&nbsp;{percent_value}% "+
                           "</TD></TR>" +
                           "</TABLE>" +
                           "</TD></TR>";
 
           
        
        for (i=0; i < (answerTable.rows.length); i++) {
                answerTable.deleteRow(i);
        }

        var newRow = answerTable.insertRow(0);
        col1 = newRow.insertCell(0);
        var colData =  "<TABLE  width=\"180\">";
	var roundPerc = 0;
        for (i=0; i < ary.length; i++) {
	
                if (ary[i].length > 0) {
                        var percentValue = Math.floor(Math.random()*70);        
                        var str = tableRowCode.replace(/\{option_text\}/g , ary[i]);
			if(i != ary.length -1) {
   		          roundPerc = roundPerc + percentValue;
		        }
		        if(roundPerc > 100) {
			  roundPerc = roundPerc - percentValue;
			  percentValue = 0;
			}
			if(i == ary.length -1) { 
			   percentValue = 100 - roundPerc;	
			}
                        str = str.replace(/\{percent_value\}/g, percentValue.toString());
                        str = str.replace(/\{remander_percent_value\}/g, (100 - percentValue).toString());
                        colData += str;
                }
        }
        colData += "<TR><TD align=\"right\" class=\"special\" style=\"font-size:7pt;\"></TD></TR>";
        colData += "</TABLE>";
        col1.innerHTML = colData;        
        for (i = answerTable.rows.length -1; i > 0; i--) {
                answerTable.deleteRow(i);
        }

}


function updateMicroPollAnswersDropDown (tableID, data, styleClass) {

        var answerTable = document.getElementById(tableID);
        var ary = new Array();
        ary = data.split("\n");
        var aryLen = 0;
        var selectMenu = "<select name=\"mpDropDown\" class=\"" + styleClass  + "\">\n";
        var opt = "<option value=\"dummy\">${opt_text}</option>";

        for (i=0; i < (answerTable.rows.length); i++) {
                answerTable.deleteRow(i);
        }

        for (i=0; i < ary.length; i++) {
                if (ary[i].length > 0) {
                        tmp = opt.replace("${opt_text}", ary[i]);
                        selectMenu += "\n" + tmp + "\n";
                        aryLen++;
                }
        }

        selectMenu += "</select>";
        //alert(selectMenu);
        var newRow = answerTable.insertRow(0);
        col1 = newRow.insertCell(0);
        col2 = newRow.insertCell(1);
        col2.style.fontSize = "8pt";

        col1.innerHTML = " ";
        col2.innerHTML = "<div class=\""+styleClass+"\">" + selectMenu + "</div>";


        for (i = answerTable.rows.length -1; i > 0; i--) {
                answerTable.deleteRow(i);
        }

        
}

function updateMicroPollAnswers (tableID, data, styleClass, inputType) {
        
        //alert(inputType);
        if (inputType == 2) {
                updateMicroPollAnswersDropDown (tableID, data, styleClass);
                return;
        }
        var inputTypeStr = (inputType == 0 ? "radio" : "checkbox");
        //alert(inputTypeStr);
        var answerTable = document.getElementById(tableID);
        var ary = new Array();
        ary = data.split("\n");
        var aryLen = 0;

        for (i=0; i < (answerTable.rows.length); i++) {
                answerTable.deleteRow(i);
        }

        for (i=0; i < ary.length; i++) {
                if (ary[i].length > 0) {
                        var newRow = answerTable.insertRow(i);
                        col1 = newRow.insertCell(0);
                        col2 = newRow.insertCell(1);
                        col2.style.fontSize = "8pt";

                        col1.innerHTML = "<input type=\"" + inputTypeStr  + "\" name=\"u_quickPoll\" value=\""+(i+1)+"\">";
                        col2.innerHTML = "<div class=\""+styleClass+"\" id=\"mp_option_view_" + (i+1) + "\">" + ary[i] + "</div>";
                        aryLen++;
                }
        }
        for (i = answerTable.rows.length -1; i >= aryLen; i--) {
                answerTable.deleteRow(i);
        }

}

function ajaxLinkConfirm(divID, url, text) {
  if (confirm(text)) {
        ajaxLink(divID, url);
  } else {
      if (document.getElementById("shadowedBox").onclose) {
          document.getElementById("shadowedBox").onclose();
      }
  }
}

function ajaxLinkPrompt(divID, url, text) {
  var f = prompt(text);
  if (f) {
        ajaxLink(divID, url + f);
  }
}

function ajaxLinkTab(tabIndexClass, divID, url, spinnerDiv) {
  var tabbedMenu = document.getElementById('TabbedMenu');
  if (tabbedMenu) {
    tabbedMenu.className = tabIndexClass;
    ajaxLink(divID, url, spinnerDiv);
  } else {
    alert('TabbedMenu Div Not Found');
  }
}

function ajaxLinkForControl(controlID, url) {
    ajaxLinkForControl1(document.getElementById(controlID), url, true);
}

function preAjax() {
        var statusMessageDiv = document.getElementById("promptMessage");
        if (statusMessageDiv) {
            statusMessageDiv.innerHTML = 'Processing...';
        }
}

function ajaxCall0(url, params) {
        preAjax();
        ajaxEngine.registerRequest('AjaxCall', url);
        ajaxEngine.registerAjaxElement('promptMessage');
        ajaxEngine.sendRequest('AjaxCall', 'ajax=true', params);  
}
function ajaxCall(url, params, div) {
        preAjax();
        if (document.getElementById(div)) {
                ajaxEngine.registerRequest('AjaxCall', url);
                ajaxEngine.registerAjaxElement(div);
                ajaxEngine.registerAjaxElement('promptMessage');
                ajaxEngine.sendRequest('AjaxCall', 'ajax=true', params);  
        }
}

function ajaxCall2(url, param1, param2, div) {
        preAjax();
        if (document.getElementById(div)) {
                ajaxEngine.registerRequest('AjaxCall', url);
                ajaxEngine.registerAjaxElement(div);
                ajaxEngine.sendRequest('AjaxCall', 'ajax=true', param1, param2);  
        }
}


function  refreshBuilderGoToSection(loc,secID){
	goToSection(loc,secID);
}

function goToSection(loc,secID){
        loc = loc + "?xrnd=" + Math.random() + "#" + secID;
        window.opener.location = loc;
}


function showSelectedQuestionContentInDiv(mnu,dispDiv){

        var qIDDiv = 1;
        mnuOptions = mnu.options;

        for(var i=1; i< mnuOptions.length; i++){
                if(mnuOptions[i].selected){
                        qIDDiv = (mnuOptions[i].value);
                }
        }

        if(qIDDiv==1){
                qIDDiv = mnuOptions[0].value;
        }
        divObj = document.getElementById(dispDiv);
        document.getElementById(dispDiv).innerHTML = document.getElementById(qIDDiv+"").innerHTML
        divObj.style.display='inline';

}

function isSelected(menu, value) {
        for(i=0; i < menu.length; i++) {
          if ((menu[i].selected || menu[i].checked) && menu[i].value == value) {
            return true;
          }
        }
        return false;
}


function openPreviewMultiLingual(){

        var loc = "{"+document.location+"}";

        if(loc.indexOf("surveyconsole") > 0) {
                loc = "http://www.surveyconsole.com/userimages/1630/Multi_Lingual_Surveys.html";
        } else {
                loc = "http://www.questionpro.com/akira/TakeSurvey?id=231362&responseCheck=false";
        }

        openPreview(loc);
        

}

function checkSelection (mnu, invalidVal, submitFrm) {

        var val = mnu[mnu.selectedIndex].value;

        if (val == invalidVal) {
                alert("Please select a valid option");
        } else {
                submitFrm.submit();
        }


}

function setObj(text,theswitch,inwidth,inheight) {
        thetext=text
        if(iens6){
                thename = "viewer"
                theobj=document.getElementById? document.getElementById(thename):document.all.thename
                winHeight=100
                        if(iens6&&document.all) {
                                winPositionFromTop=document.body.clientHeight
                                winWidth=(document.body.clientWidth-document.body.leftMargin)
                        }
                        if(iens6&&!document.all) {
                                winPositionFromTop=window.innerHeight
                                winWidth=(window.innerWidth-(document.body.offsetLeft+30))
                        }
                        if(theswitch=="override") {
                                winWidth=inwidth
                                winHeight=inheight
                        }
                theobj.style.width=winWidth
                theobj.style.height=startH
                        if(iens6&&document.all) {
                                theobj.style.top=document.body.scrollTop+winPositionFromTop
                                theobj.innerHTML = ""
                                theobj.insertAdjacentHTML("BeforeEnd","<table cellspacing=0 width="+winWidth+" height="+winHeight+" border=1><tr><td width=100% valign=top class=popupText>"+thetext+"</td></tr></table>")
                        }
                        if(iens6&&!document.all) {
                                theobj.style.top=window.pageYOffset+winPositionFromTop
                                theobj.innerHTML = ""
                                theobj.innerHTML="<table cellspacing=0 width="+winWidth+" height="+winHeight+" border=1><tr><td width=100% valign=top class=popupText>"+thetext+"</td></tr></table>"
                        }
        }
        if(ns4){
                thename = "nsviewer"
                theobj = eval("document."+thename)
                winPositionFromTop=window.innerHeight
                winWidth=window.innerWidth
                winHeight=100
                        if(theswitch=="override") {
                                winWidth=inwidth
                                winHeight=inheight
                        }
                theobj.moveTo(0,eval(window.pageYOffset+winPositionFromTop))
                theobj.width=winWidth
                theobj.clip.width=winWidth
                theobj.document.write("<table cellspacing=0 width="+winWidth+" height="+winHeight+" border=1><tr><td width=100% valign=top class=popupText>"+thetext+"</td></tr></table>")
                theobj.document.close()
        }
        viewIt()
}

function viewIt() {
        if(startH<=winHeight) {
                if(iens6) {
                        theobj.style.visibility="visible"
                                if(iens6&&document.all) {
                                        theobj.style.top=(document.body.scrollTop+winPositionFromTop)-startH
                                }
                                if(iens6&&!document.all) {
                                        theobj.style.top=(window.pageYOffset+winPositionFromTop)-startH
                                }
                        theobj.style.height=startH
                        startH+=2
                        openTimer=setTimeout("viewIt()",scrollSpeed)
                }
                if(ns4) {
                        theobj.visibility = "visible"
                        theobj.moveTo(0,(eval(window.pageYOffset+winPositionFromTop)-startH))
                        theobj.height=startH
                        theobj.clip.height=(startH)
                        startH+=2
                        openTimer=setTimeout("viewIt()",scrollSpeed)
                }
        }else{
                clearTimeout(openTimer)
        }
}

function stopIt() {
        if(iens6) {
                theobj.innerHTML = ""
                theobj.style.visibility="hidden"
                startH=2
        }
        if(ns4) {
                theobj.document.write("")
                theobj.document.close()
                theobj.visibility="hidden"
                theobj.width=0
                theobj.height=0
                theobj.clip.width=0
                theobj.clip.height=0
                startH=2
        }
}

function openMicroPoll (loc) {       
        win = open(loc,"pollWin", "width=500,height=350");        
}

function popupForm(formObject, baseURL) {
  // Submits a Form on a new Popup Window
  baseURL += "?";
        
  for (i = 0; i < formObject.elements.length; ++i) {
    baseURL += (formObject.elements[i].name + "=" + escape(formObject.elements[i].value) + "&");
  }
  gotoLoc(baseURL);
}

function checkSpamCompliance (actn, submitForm, popupURL) {

     if (submitForm.spamCompliance.checked) {
          if (actn == "upload" ) {
              submitForm.submit();
          } else  {
              miniPopup(popupURL);
          }
     } else {
         alert("Please read and check the SPAM Compliance Policy check-box");
     }

}

function checkboxSubmit(checkboxControl,  message) {
  if (checkboxControl.checked) {
        checkboxControl.form.submit();
  } else {
        alert(message);
  }
}

function modifyMicroPollProgressBarColor (sudoID, selectBox, customColorField, threeD) {
         
        var selectedValue = selectBox.options[selectBox.selectedIndex].value;
        if (selectedValue == "-1") {
                selectedValue = customColorField.value;
        }

        for (i=1; i > 0; i++) {
                var id = sudoID+"_"+i;
                if (document.getElementById(id)) {
                        if (threeD) {
                              selectedValue = selectedValue.toLowerCase().replace(/#/g, "");
                              modifyTableCellBackgroundImage(id, "/images/micropoll/chart/chart_"+selectedValue+".gif", 0,0);
                        } else {
                              modifyTableCellBackgroundColor(id, selectedValue, 0,0);
                        }
                } else {
                        break;
                }
        }
}

function modifyTableCellBackgroundColor (id, customColor, rowIndex, colIndex) {

        if (document.getElementById(id)) {
           obj = document.getElementById(id).rows[rowIndex].cells;
           tableCell = obj[colIndex];
           tableCell.style.backgroundImage="";
           tableCell.style.backgroundColor = customColor;
           //bgColor = customColor;
        }
}

function modifyTableCellBackgroundImage (id, imgSrc , rowIndex, colIndex) {
        //alert(imgSrc);
        if (document.getElementById(id)) {
           obj = document.getElementById(id).rows[rowIndex].cells;
           tableCell = obj[colIndex];
           tableCell.style.backgroundColor="";
           tableCell.style.backgroundImage="url('" + imgSrc + "')";
           tableCell.style.backgroundRepeat="repeat-x";
           tableCell.style.backgroundPosition="center center";
           //bgColor = customColor;
        }
}

function copyText (txtBox) {
        txtBox.focus();
        txtRange = txtBox.createTextRange();
        txtRange.execCommand("SelectAll");
        txtRange.execCommand("Copy");
}

function closeDiv(id) {
  container = document.getElementById(id);
  if (container) {
        container.style.display='none';
  }
}

function closeInlinePopup (id) {
    showSeeThroughElements();

    try {
        $("#shadowedBox").fadeOut();
        $("#shadowedBox").draggable("destroy");
        $("#titlePopupHeader").html("");
	    document.getElementById("shadowedBoxBody").innerHTML = "";
    } catch (e) {
        closeDiv(id);
    }

    if (document.getElementById("shadowedBox").onclose) {
	    document.getElementById("shadowedBox").onclose();
    }

}

function showSeeThroughElements () {
    changeSeeThroughElementsDisplay("");
}

function hideSeeThroughElements () {
    changeSeeThroughElementsDisplay("none");
}

function changeSeeThroughElementsDisplay (display) {
    //add more elements that need to be hidden / shown here
    changeDisplayForElements("select", display);
    changeDisplayForElements("object", display);
}

function changeDisplayForElementsBYVIRAJ_SO_SLOW(type, display) {
    for(var i=0;i<document.all.length;i++){
        var ele = document.all[i];
        try {
          if (ele.type.indexOf(type) >= 0) {
              ele.style.display=display;
          }
        } catch (e) {
            //eat it
        }
    }
}

function changeDisplayForElements(type, display) {
    var elements = document.getElementsByTagName(type);

    for(var i=0; i < elements.length; i++) {
        var ele = elements[i];
        try {
          ele.style.display=display;
        } catch (e) {
            //eat it
        }
    }
}

function frameWithAjaxImageSubmit (imageDiv, frmSrc, frmID) {
        document.getElementById(imageDiv).style.display="inline";
        document.getElementById(imageDiv).innerHTML = "<img src=\"/images/waiting.gif\"><br>Getting Images...";
        var frm = document.getElementById(frmID);
        frm.src = frmSrc;
}

function isValidURL (url) {
        var regExp= /[A-Za-z0-9\.-]{3,}\.[A-Za-z]{3}/
        if (regExp.test(url)) {
                return true;
        }
        else {
                window.alert("Invalid URL");
                return false; 
        }
}

function ajaxLinkInParentWindow (divID, actionSrc) {
        this.parent.ajaxLink1(this.parent.document.getElementById(divID),actionSrc);
}

function hideDiv (divID) {
        obj = document.getElementById(divID);
        if (obj) {
          obj.style.display="none";
        }
}

function showDiv (divID) {        
        obj = document.getElementById(divID);
        if (obj) {
          obj.style.display="block";
        }
}


function hideParentDiv (divID) {
        this.parent.document.getElementById(divID).style.display="none";
}

function formatStr (txtBoxNameOrID, v, formIndex) {
    e = getObject1(txtBoxNameOrID, formIndex); 
    var str = getSelected(e);
    if (str.indexOf("\r") > 0 || str.indexOf("\n") > 0) {
        alert("Please select one line at a time.");
        return;    
    }
    if (str) setSelection(e, '<' + v + '>' + str + '</' + v + '>');
    //return false;
}



function getSelected (e) {
    if (document.selection) {
        e.focus();
        var range = document.selection.createRange();
        return range.text;
    } else {
        var length = e.textLength;
        var start = e.selectionStart;
        var end = e.selectionEnd;
        if (end == 1 || end == 2 && length != undefined) end = length;
        return e.value.substring(start, end);
    }
}

function setSelection (e, v) {
    if (document.selection) {
        e.focus();
        var range = document.selection.createRange();
        range.text = v;
    } else {
        var length = e.textLength;
        var start = e.selectionStart;
        var end = e.selectionEnd;
        if (end == 1 || end == 2 && length != undefined) end = length;
        e.value = e.value.substring(0, start) + v + e.value.substr(end, length);
        e.selectionStart = start;
        e.selectionEnd = start + v.length;
    }
    e.focus();
}

function insertLink (txtBoxNameOrID, isMail, formIndex) {
    e = getObject1(txtBoxNameOrID, formIndex);
    var str = getSelected(e);
    var link = '';
    if (!isMail) {
        if (str.match(/^https?:/)) {
            link = str;
        } else if (str.match(/^(\w+\.)+\w{2,5}\/?/)) {
            link = 'http://' + str;
        } else if (str.match(/ /)) {
            link = 'http://';
        } else {
            link = 'http://' + str;
        }
    } else {
        if (str.match(/@/)) {
            link = str;
        }
    }
    var my_link = prompt((isMail ? "Enter email address:" : "Enter URL:"), "");
    if (my_link != null) {
         if (str == '') str = my_link;
         if (isMail) my_link = 'mailto:' + my_link;
        setSelection(e, '<a href="' + my_link + '" target="_blank">' + str + '</a>');
    }
    return false;
}

function getObject (elementNameOrID) {
        return getObject1(elementNameOrID, -1);
}
function getObject1 (elementNameOrID, formIndex) {
        
        if (formIndex < 0 && document.getElementById(elementNameOrID)) {
                return document.getElementById(elementNameOrID);
        } else if (formIndex >= 0 && 
                   document.forms[formIndex] &&
                   document.forms[formIndex].elements[elementNameOrID]) {
                return document.forms[formIndex].elements[elementNameOrID];
        }

        for (i=0; (document.forms && i < document.forms.length); i++) {
                if (document.forms[i].elements[elementNameOrID]) {
                      return  document.forms[i].elements[elementNameOrID];
                }
        }

}

function ajaxInlinePopup1 (popupWidth, popupHeight, appURL) {  
        var container = document.getElementById("contentEnclosingDivID");

        container.style.left = 220 + document.body.scrollLeft;
        container.style.top = 100 + document.body.scrollTop;

        var rightShadowDiv = document.getElementById("rightShadowDivID"); 
        var bottomShadowDiv = document.getElementById("bottomShadowDivID");
        var contentTable = document.getElementById("contentTableID");
        
        if (popupWidth > 0) {
                contentTable.style.width = popupWidth;
        }        
        if (popupHeight > 0) {
                contentTable.style.height = popupHeight;
        }                
        var shadowOffset = 10;        
        var ieAdjustment = 0;
        if (navigator.appName.indexOf("Microsoft Internet Explorer") >= 0) {
                 ieAdjustment = -7;
        }

        rightShadowDiv.style.left = parseInt(container.style.left) + parseInt(contentTable.style.width);
        bottomShadowDiv.style.left = parseInt(container.style.left) + shadowOffset;

        rightShadowDiv.style.top = parseInt(container.style.top) + shadowOffset ;
        rightShadowDiv.style.height = parseInt(contentTable.style.height) - shadowOffset + ieAdjustment;
        
        bottomShadowDiv.style.top = parseInt(container.style.top) +
                              parseInt(contentTable.style.height) + ieAdjustment;
        bottomShadowDiv.style.width = parseInt(contentTable.style.width);
        
        container.style.display="inline";
        bottomShadowDiv.style.display="inline";
        rightShadowDiv.style.display="inline";
        
        ajaxLink("contentDivID", appURL);
         
}

function closeLiteInlinePopup() {
        document.getElementById("contentEnclosingDivID").style.display="none";
        document.getElementById("rightShadowDivID").style.display="none";
        document.getElementById("bottomShadowDivID").style.display="none";
}

function insertImageCode (inputField, imageURL) {        
        var imageCode = "<img src=\""+imageURL+"\">";
        inputField.value = inputField.value + "\r\n" + imageCode;
}

function writeDiv (div, txt) {
        div.innerHTML = txt;        
}

//ReOrder methods
function moveSelectionUp (mnu) {
        mnuOptions = mnu.options;
        if(mnuOptions[0].selected){
            return;
        }

        for(var i=0; i < mnuOptions.length; i++){
                if(mnuOptions[i].selected && i > 0) {
                        mnuOptions[i].selected = false;
                        tmpVal = mnuOptions[i].value;
                        tmpTxt = mnuOptions[i].text;
                        mnuOptions[i].value = mnuOptions[i-1].value;
                        mnuOptions[i].text = mnuOptions[i-1].text;
                        mnuOptions[i-1].value = tmpVal;
                        mnuOptions[i-1].text = tmpTxt;
                        mnuOptions[i-1].selected = true;
                        return;

                }
        }
}


function moveSelectionDown(mnu) {

        mnuOptions = mnu.options;

        if(mnuOptions[ mnuOptions.length -1].selected){
            return;
        }

        for(var i=0; i < mnuOptions.length; i++){
                if(mnuOptions[i].selected && i <  (mnuOptions.length-1)) {
                        mnuOptions[i].selected = false;
                        tmpVal = mnuOptions[i+1].value;
                        tmpTxt = mnuOptions[i+1].text;

                        mnuOptions[i+1].value = mnuOptions[i].value;
                        mnuOptions[i+1].text = mnuOptions[i].text;

                        mnuOptions[i].value = tmpVal;
                        mnuOptions[i].text = tmpTxt;
                        mnuOptions[i+1].selected = true;
                        return;

                }
        }
}

function selectAllAndSubmitForm (frm, mnu) {
    selectAll(frm.elements[mnu]);
    frm.submit();
}

function selectAllAndAjaxSubmitForm(frm, mnu,divID, url) {
    selectAll(frm.elements[mnu]);
    return ajaxSubmitFormObject(divID, url, frm);
}

function selectAll (mnu) {
        selectAll1(mnu.options);
}

function selectAll1(mnuOptions) {
    for(var i=0; i < mnuOptions.length; i++) {
        mnuOptions[i].selected = true;
        mnuOptions[i].checked = true;
    }
}

function modifyTableRowBGColor(id,rowIndex,  selectBox, customColorField) {
        if (document.getElementById) {
           obj = document.getElementById(id);
           if (selectBox.selectedIndex >= 0) {
             var selectedValue = selectBox.options[selectBox.selectedIndex].value;
             if (selectedValue == "-1") {
                selectedValue = customColorField.value;
             }
             if (rowIndex < 0) {
                obj.style.backgroundColor = selectedValue;
             } else {
                obj.rows[rowIndex].style.backgroundColor = selectedValue;
             }             
           }
        }
}

function modifyTableBGColor(id, selectBox, customColorField) {
        modifyTableRowBGColor(id, -1, selectBox, customColorField);
}



function getPos(obj) {
  var coord = new Object();
  o = obj;
  coord.left = o.offsetLeft;
  coord.top = o.offsetTop;
  while(o.offsetParent != null) {
    oParent = o.offsetParent;
    coord.left += oParent.offsetLeft;
    coord.top += oParent.offsetTop;
    o = oParent;
  }
  return coord;
}

function RaterControl(promptBoxId, strings, questionId, responseUri) {
  var imagePath = "/images/ratercontrol/";
  var promptBox = document.getElementById(promptBoxId);

  if (!promptBox) return;

  var promptDiv = document.createElement("div");
  var thanksDiv = document.createElement("div");
  var raterDiv = document.createElement("div");

  promptDiv.className = "raterPrompt";
  thanksDiv.className = "ratherThanks";

  var this_ = this;

  // create the thank you
  thanksDiv.style.display = "none";
  thanksDiv.className = "raterThanks";
  thanksDiv.innerHTML = strings["ThankYou"];
  promptBox.appendChild(thanksDiv);

  // create the rater
  raterDiv.style.display = "block";
  raterDiv.innerHTML = "<table cellpadding='0' cellspacing='0' border='0'>"
      + "<tr><td class='raterContent'></td></tr></table>";
  var contents = raterDiv.getElementsByTagName("td")[0];
  var span = document.createElement("span");

  span.innerHTML = strings["RateThisTool"] + ":&nbsp;";

  /**
   * Creates an image object
   * @private
   */
  function createImage(uri){
    var img = document.createElement("img");
    img.src = uri;
    img.align = "absmiddle";
    return img;
  }

  faces = new Array();
  faces[0] = createImage(imagePath + 'sad.gif');
  faces[1] = createImage(imagePath + 'normal.gif');
  faces[2] = createImage(imagePath + 'happy.gif');

  for (var i=0; i< faces.length; i++){
    var face = faces[i];
    face.submitValue = i+1;
    face.rater = this;
    face.onclick = function(){
      this.rater.submitResponse(this.submitValue);
    }
    face.descText = strings["value_" + face.submitValue];
    face.onmouseover = function(){
      this.className = "faceOver";
      var coord = getPos(this);
      Bubble.show(this.descText, coord.left, coord.top);
    }
    face.onmouseout = function(){
      this.className = "";
      Bubble.hide();
    }
    face.style.cursor = "pointer";
    span.appendChild(face);
  }

  contents.appendChild(span);
  promptBox.appendChild(raterDiv);

  /**
   * Hides the rater control
   * @public
   */
  this.hide = function(opt_didSubmit){
    raterDiv.style.display = "none";
    Bubble.hide();
    if (opt_didSubmit) {
      thanksDiv.style.display = "block";
      window.setTimeout(this_.hide, 25000);
    } else {
      promptBox.style.display = "none";
    }
  }

  /**
   * Submits a response to the servlet URI using GET, and hides the
   * prompt box.  Does not check to make sure the data was sent without
   * error.
   * @param value numerical response value.
   * @param handler handler to invoke once the request is complete.
   */
  this.submitResponse = function(value) {
    var url = "/akira/RaterServlet";
    try {
        var pars = 'raterId=' + escape(questionId) + '&raterResponse=' + escape(value);
        ajaxLink1(thanksDiv, (url + "?" + pars));
    } catch (e) {
        // eat?
    }
    this_.hide(true);
  }
}


var Bubble = {
  imagePath:  "/images/ratercontrol/bubble/",

  init: function() {
    if (Bubble.bubbleDiv == null) {
      // initialize the bubble div if there isn't already one declared.
      var div = document.createElement("div");
      div.style.position = "absolute";
      div.style.top = 0;
      div.style.left = 0;

      // innerHTML building.  Multiple table wrapping for IE compatibility.
      var html = '<table cellpadding="0" cellspacing="0" border="0"><tr>'
          + '<td colspan="5"><div style="font-family:Arial;background:#fff;'
          + 'padding:6px;border-width:1px 1px 0px 1px;border-style:solid;'
          + 'border-color:#000;cursor:pointer;" id="bubble_msg"></div></td></tr>'
          + '<tr><td>'
          + '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>'
          + '<td style="width:2px" valign="top"><img src="'
          + Bubble.imagePath + 'bubble_left.gif" height="2" width="2">'
          + '</td><td valign="top"'
          + ' style="width:*;background-repeat:repeat-x;background-image:url(\''
          + Bubble.imagePath +'bubble_bg.gif\')"><img src="'
          + Bubble.imagePath + '1.gif"></td>'
          + '<td style="width:10px" valign="top"><img src="'
          + Bubble.imagePath+ 'bubble_tail.gif" height="11" width="10">'
          + '</td><td style="width:9px" '
          + 'valign="top"><img src="'
          + Bubble.imagePath + 'bubble_bg.gif" width="9" height="2"></td>'
          + '<td style="width:2px" valign="top"><img src="'
          + Bubble.imagePath + 'bubble_right.gif" height="2" width="2">'
          + '</td></tr>'
          + '</table></td></tr></table>';

      div.innerHTML = html;

      // Add to the document, reference as necessary.
      div.style.display = "none";
      div.style.visibility = "hidden";
      document.body.appendChild(div);
      Bubble.msgBox = document.getElementById("bubble_msg");
      Bubble.bubbleDiv = div;
    }
    Bubble.msgBox.innerHML = "&nbsp;";
  },

  showTip: function( message, obj ) {
    var coordinate = getPos(obj);
    Bubble.show(message, coordinate.left, coordinate.top);
    
    Bubble.msgBox.onclick = function() {
        Bubble.hide();
    };
    // Hide after 5 seconds
    setTimeout("Bubble.hide()", 5000);
  },
  show: function( message, absLeft, absTop ) {
    Bubble.init();
    var imagesOffsetY = 12;
    var imagesOffsetX = 16;
    Bubble.bubbleDiv.style.display = "block";
    Bubble.msgBox.innerHTML = message;

    Bubble.bubbleDiv.style.left = absLeft - Bubble.msgBox.offsetWidth
        + imagesOffsetX + "px";
    Bubble.bubbleDiv.style.top = absTop - Bubble.msgBox.offsetHeight
        - imagesOffsetY + "px";
    Bubble.bubbleDiv.style.visibility = "visible";
  },

  hide: function() {
    Bubble.bubbleDiv.style.visible = "hidden";
    Bubble.bubbleDiv.style.display = "none";
    Bubble.bubbleDiv.style.top = "0px";
    Bubble.bubbleDiv.style.left = "0px";

  }
}

function enablePollRoundedCorners (pollID) {
        pollRoundedCorners (pollID, "inline");        
}

function disablePollRoundedCorners (pollID) {
        pollRoundedCorners (pollID, "none");        
}

function pollRoundedCorners (pollID, displayMode) {
        if(displayMode=="inline") {
            document.getElementById("mp_table_view").className = "add_new_rounded_micropoll";
            document.getElementById("mp_table_result").className = "add_new_rounded_micropoll";
        } else {
            document.getElementById("mp_table_view").className = "add_new_square_micropoll";
            document.getElementById("mp_table_result").className = "add_new_square_micropoll";
        }
}

function changeElementValue (elementID, val) {
        document.getElementById(elementID).value = val;
}

function changeBackgroundImage (elementID, val) {
        document.getElementById(elementID).style.backgroundImage="url(" + val + ")";
}

function getHTMLFormat (text) {        
        text = text.replace(/\n/gi,"<br>");
        return text;
}

function formatEmailInvitationPreview (text) {
        text = getHTMLFormat(text);
        text = "<br><br><TABLE width='95%' align='center' style='border: 1px solid #cccccc;'><TR><TD>" + text +
               "</TD><TR></TABLE>";
        return text;
}

function ajaxInlinePopup1 (data, id) {
        container = document.getElementById('shadowedBox');
        dataContainer = document.getElementById('shadowedBoxBody');
        linkNode = document.getElementById(id);
        // Update the Status Container
        dataContainer.innerHTML = '<div style="position:absolute;padding:0px 10px;margin-top:-5px;" align="center"><img src="/images/waiting.gif"><span style="position:relative;top:-7px;">Loading...</span></div>';
        leftPx = 220 + (document.body.scrollLeft || document.documentElement.scrollLeft);
        container.style.left= leftPx + 'px';
	topPx =200 + (document.body.scrollTop || document.documentElement.scrollTop);
        container.style.top=topPx + 'px';
        container.style.zIndex = 99;
        container.style.display='inline';
        dataContainer.style.height=300;
        dataContainer.style.overflow = "auto";
        dataContainer.innerHTML = data;
}

function markCursorPosition (textArea) {
        //alert (getCaterStartPosition (textArea)
        CURSOR_POS = getCaterStartPosition (textArea);
        //IE
        if (document.selection) {        
                if (textArea.value.charAt(CURSOR_POS + 1) == '\n') {
                        CURSOR_POS = CURSOR_POS + 1;
                }
        }
}

function insertTextAtCursor (textArea, value) {
        var str = textArea.value;
        str = str.substring (0, CURSOR_POS) + value + (CURSOR_POS < str.length ? str.substring(CURSOR_POS, str.length) : "");
        textArea.value = str;        
}

function monitorCursor (textArea) {
    textArea.onblur = function (e) {
        try{
            markCursorPosition(textArea);
        } catch(err){}
    };
    textArea.onfocus = function (e) {
        try{
            markCursorPosition(textArea);
        } catch(err){}
    };
    textArea.onkeyup = function (e) {
        try{
            markCursorPosition(textArea);
        } catch(err){}
    };
}

function getCaterStartPosition (textArea) {

  if ( document.selection ) { 
    // The current selection 
    var range = document.selection.createRange(); // We'll use this as a 'dummy' 
    var stored_range = range.duplicate(); // Select all text 
    stored_range.moveToElementText( textArea ); // Now move 'dummy' end point to end point of original range 
    stored_range.setEndPoint( 'EndToEnd', range ); // Now we can calculate start and end points 
    textArea.selectionStart = stored_range.text.length - range.text.length; 
    textArea.selectionEnd = textArea.selectionStart + range.text.length; 
    return textArea.selectionStart;
  }
        
  return textArea.selectionStart;

}

function closeWindowCallAjaxLink (myWin, divID, actionSrc) {
        ajaxLink(divID, actionSrc);
        myWin.close();
}

// Custom Reference Data Validator
function validateUSZip(value, divID, ajaxProcessorURL) {
  if (value != null && value.length == 5) {
        ajaxLink(divID, ajaxProcessorURL);
  } else {
     modifyTextNoCheck(divID, '');
  }
}       

function validateCAZip(value, divID, ajaxProcessorURL) {
  if (value != null && value.length == 7) {
        ajaxLink(divID, ajaxProcessorURL);
  } else {
        modifyTextNoCheck(divID, '');
  }
}       

function validateAUZip(value, divID, ajaxProcessorURL) {
  if (value != null && value.length == 4) {
        ajaxLink(divID, ajaxProcessorURL);
  } else {
        modifyTextNoCheck(divID, '');
  }
}       




if(typeof infosoftglobal == "undefined") var infosoftglobal = new Object();
if(typeof infosoftglobal.PowerMapUtil == "undefined") infosoftglobal.PowerMapUtil = new Object();
infosoftglobal.PowerMap = function(swf, id, w, h, debugMode, registerWithJS, c, scaleMode, lang){
	if (!document.getElementById) { return; }
	
	//Flag to see whether data has been set initially
	this.initialDataSet = false;
	
	//Create container objects
	this.params = new Object();
	this.variables = new Object();
	this.attributes = new Array();
	
	//Set attributes for the SWF
	if(swf) { this.setAttribute('swf', swf); }
	if(id) { this.setAttribute('id', id); }
	if(w) { this.setAttribute('width', w); }
	if(h) { this.setAttribute('height', h); }
	
	//Set background color
	if(c) { this.addParam('bgcolor', c); }
	
	//Set Quality	
	this.addParam('quality', 'high');
	
	//Add scripting access parameter
	this.addParam('allowScriptAccess', 'always');
	
	//Pass width and height to be appended as mapWidth and mapHeight
	this.addVariable('mapWidth', w);
	this.addVariable('mapHeight', h);

	//Whether in debug mode
	debugMode = debugMode ? debugMode : 0;
	this.addVariable('debugMode', debugMode);
	//Pass DOM ID to Map
	this.addVariable('DOMId', id);
	//Whether to registed with JavaScript
	registerWithJS = registerWithJS ? registerWithJS : 0;
	this.addVariable('registerWithJS', registerWithJS);
	
	//Scale Mode of Map
	scaleMode = scaleMode ? scaleMode : 'noScale';
	this.addVariable('scaleMode', scaleMode);
	//Application Message Language
	lang = lang ? lang : 'EN';
	this.addVariable('lang', lang);
}

infosoftglobal.PowerMap.prototype = {
	setAttribute: function(name, value){
		this.attributes[name] = value;
	},
	getAttribute: function(name){
		return this.attributes[name];
	},
	addParam: function(name, value){
		this.params[name] = value;
	},
	getParams: function(){
		return this.params;
	},
	addVariable: function(name, value){
		this.variables[name] = value;
	},
	getVariable: function(name){
		return this.variables[name];
	},
	getVariables: function(){
		return this.variables;
	},
	getVariablePairs: function(){
		var variablePairs = new Array();
		var key;
		var variables = this.getVariables();
		for(key in variables){
			variablePairs.push(key +"="+ variables[key]);
		}
		return variablePairs;
	},
	getSWFHTML: function() {
		var swfNode = "";
		if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) { 
			// netscape plugin architecture			
			swfNode = '<embed type="application/x-shockwave-flash" src="'+ this.getAttribute('swf') +'" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'"  ';
			swfNode += ' id="'+ this.getAttribute('id') +'" name="'+ this.getAttribute('id') +'" ';
			var params = this.getParams();
			 for(var key in params){ swfNode += [key] +'="'+ params[key] +'" '; }
			var pairs = this.getVariablePairs().join("&");
			 if (pairs.length > 0){ swfNode += 'flashvars="'+ pairs +'"'; }
			swfNode += '/>';
		} else { // PC IE			
			swfNode = '<object id="'+ this.getAttribute('id') +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'">';
			swfNode += '<param name="movie" value="'+ this.getAttribute('swf') +'" />';
			var params = this.getParams();
			for(var key in params) {
			 swfNode += '<param name="'+ key +'" value="'+ params[key] +'" />';
			}
			var pairs = this.getVariablePairs().join("&");			
			if(pairs.length > 0) {swfNode += '<param name="flashvars" value="'+ pairs +'" />';}
			swfNode += "</object>";
		}
		return swfNode;
	},
	setDataURL: function(strDataURL){
		//This method sets the data URL for the Map.
		//If being set initially
		if (this.initialDataSet==false){
			this.addVariable('dataURL',strDataURL);
			//Update flag
			this.initialDataSet = true;
		}else{
			//Else, we update the Map data using External Interface
			//Get reference to map object
			var mapObj = infosoftglobal.PowerMapUtil.getMapObject(this.getAttribute('id'));
			mapObj.setDataURL(strDataURL);
		}
	},
	setDataXML: function(strDataXML){
		//If being set initially
		if (this.initialDataSet==false){
			//This method sets the data XML for the map INITIALLY.
			this.addVariable('dataXML',strDataXML);
			//Update flag
			this.initialDataSet = true;
		}else{
			//Else, we update the map data using External Interface
			//Get reference to map object
			var mapObj = infosoftglobal.PowerMapUtil.getMapObject(this.getAttribute('id'));
			mapObj.setDataXML(strDataXML);
		}
	},
	render: function(elementId){
		var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
		n.innerHTML = this.getSWFHTML();
		return true;		
	}
}

// ------------ Fix for Out of Memory Bug in IE in FP9 ---------------//
/* Fix for video streaming bug */
infosoftglobal.PowerMapUtil.cleanupSWFs = function() {
	if (window.opera || !document.all) return;
	var objects = document.getElementsByTagName("OBJECT");
	for (var i=0; i < objects.length; i++) {
		objects[i].style.display = 'none';
		for (var x in objects[i]) {
			if (typeof objects[i][x] == 'function') {
				objects[i][x] = function(){};
			}
		}
	}
}
// Fixes bug in fp9
infosoftglobal.PowerMapUtil.prepUnload = function() {
	__flash_unloadHandler = function(){};
	__flash_savedUnloadHandler = function(){};
	if (typeof window.onunload == 'function') {
		var oldUnload = window.onunload;
		window.onunload = function() {
			infosoftglobal.PowerMapUtil.cleanupSWFs();
			oldUnload();
		}
	} else {
		window.onunload = infosoftglobal.PowerMapUtil.cleanupSWFs;
	}
}
if (typeof window.onbeforeunload == 'function') {
	var oldBeforeUnload = window.onbeforeunload;
	window.onbeforeunload = function() {
		infosoftglobal.PowerMapUtil.prepUnload();
		oldBeforeUnload();
	}
} else {
	window.onbeforeunload = infosoftglobal.PowerMapUtil.prepUnload;
}

/* Add Array.push if needed (ie5) */
if (Array.prototype.push == null) { Array.prototype.push = function(item) { this[this.length] = item; return this.length; }}

/* Function to return Flash Object from ID */
infosoftglobal.PowerMapUtil.getMapObject = function(id)
{
  if (window.document[id]) {
      return window.document[id];
  }
  if (navigator.appName.indexOf("Microsoft Internet")==-1) {
    if (document.embeds && document.embeds[id])
      return document.embeds[id]; 
  } else {
    return document.getElementById(id);
  }
}

function stringTrim (str) {
    str = str.replace(/^([ \r\n]+)([^ \r\n])/i, "$2");
    str = str.replace(/([ \r\n]+)$/i, "");
    return str;
}


/* Aliases for easy usage */
var getMapFromId = infosoftglobal.PowerMapUtil.getMapObject;
var PowerMap = infosoftglobal.PowerMap;

function showAllDivs (sudoID,start, limit) {
  changeAllDivsDisplay(sudoID, start, limit, true);
}

function hideAllDivs (sudoID,start, limit) {
  changeAllDivsDisplay(sudoID, start, limit, false);
}

function changeAllDivsDisplay (sudoID,start, limit, show) {
  for (i=start; i < limit; i++) {
    id = sudoID.replace(/\{0\}/gi,parseInt(i));
    if (document.getElementById(id)) {
      if (show) {
        showDiv(id);
      } else {
        hideDiv(id);
      }
    }
  }
}

function processElements (elements, performAction) {
    for (var i=0; i < elements.length; i++) {
        element = elements[i];
        performAction(element);
    }
}


function changeAllDivsClass (sudoID,start, limit, clazz) {
    for (i=start; i < limit; i++) {
        id = sudoID + i;
        if (document.getElementById(id)) {
            document.getElementById(id).className=clazz;
        }
    }
}

function changeAllDivsStyle (sudoID,start, limit, clazz) {
    for (i=start; i < limit; i++) {
        id = sudoID + i;
        if (document.getElementById(id)) {
            setStyle(document.getElementById(id), clazz);
        }
    }
}


function isInternetExplorer () {
    var browserName=navigator.appName.toLowerCase();
    return (browserName && browserName.indexOf("microsoft") > -1);
}


function isFirefox() {
    var browserName=navigator.appName.toLowerCase();
    return (browserName && browserName.indexOf("firefox") > -1);
}

function isChrome() {
    var browserName= navigator.userAgent.toLowerCase();
    return (browserName && browserName.indexOf("chrome") > -1);
}

function isAndroidChrome() {
    var browserName= navigator.userAgent.toLowerCase();
    return (browserName && (browserName.indexOf("gecko") > -1 && browserName.indexOf("android") >=0));
}

function displayInlineUploadInfo(id, value) {
  obj = document.getElementById(id);
  obj.innerHTML = "<img src='/images/iconshock/tick_16.gif'>&nbsp;" + value;
}

function refreshOpener (loc) {
     window.opener.document.location=loc;
}

function addOptionToSelectBox(selectElement, name, value) {
	addOptionToSelectBox(selectElement, name, value, null)
}

function addOptionToSelectBox(selectElement, name, value, selectElemet2) {
    if (selectElement) {
        selectElement.add(new Option(name, value), selectElement.options[0]);
        selectElement.value = value;
    } else {
        var selectNames = document.getElementsByTagName("select")
        for (i=0; i<selectNames.length; i++) {
            if(selectNames[i].name.indexOf(selectElemet2)!= -1) {
                selectNames[i].options[0] = new Option(name,value);
                selectNames[i].value = value;
            }
        }

    }
} 

function addOptionToOpenerSelect(selectId, name, value){
       var selectElement = document.getElementById(selectId);
       selectElement.add(new Option(name, value), selectElement.options[0]);
       selectElement.value = value;
}

function transferFieldValue(form, sourceName, targetName) {
  var target = form.elements[targetName];
  target.value = form.elements[sourceName].value;
  target.focus();
  target.select();
}

function syncCheckBox(masterCheckBoxObject) {
    var myForm = masterCheckBoxObject.form;
    for (i=0; i < myForm.elements.length; i++) {
        var formElement = myForm.elements[i];
        if (formElement.type && formElement.type == "checkbox") {            
            formElement.checked = masterCheckBoxObject.checked;        
        }
    }
}

function sectionMenu(itemArray, currentItem) {
    for (i = 0; i < itemArray.length; ++i) {
        var tableId = 'section_menu_' +  itemArray[i];
        var obj = document.getElementById(tableId);
        if (obj) {
            if (itemArray[i] != currentItem) {
                obj.className = 'sectionMenuNormal';

		obj.setAttribute("onMouseOver","this.className='sectionMenuNormalhover'");
		obj.setAttribute("onMouseOut","this.className='sectionMenuNormal'");

                obj.onmouseover = function() {this.className='sectionMenuNormalhover'};
                obj.onmouseout = function()  {this.className='sectionMenuNormal'};

              
                var contentObj = document.getElementById('section_menu_content_' + itemArray[i]);
                if (contentObj) {    
                  contentObj.style.display = 'none';
                }
            } else {
		obj.className = 'sectionMenuHighlight';

  		obj.setAttribute("onMouseOver","this.className='sectionMenuHighlight'");
	        obj.setAttribute("onMouseOut","this.className='sectionMenuHighlight'");

                obj.onmouseover = function() {this.className='sectionMenuHighlight'};
                obj.onmouseout = function()  {this.className='sectionMenuHighlight'};
 
        	var contentObj = document.getElementById('section_menu_content_' + currentItem);
	        if (contentObj) {
        	    contentObj.style.display = 'block';
	        }
	    }
        }
    }
}

function showTableRow (tableID, rowID) {
    updateTableRowDisplay(tableID, rowID, "");
}

function hideTableRow (tableID, rowID) {
    updateTableRowDisplay(tableID, rowID, "none");
}

function updateTableRowDisplay (tableID, rowID, display) {
    var tableObject = document.getElementById(tableID);
    for (i=0; i < tableObject.rows.length; i++) {
        if (tableObject.rows[i].id == rowID) {
            tableObject.rows[i].style.display=display;
            break;
        }
    }
}


function ajaxSearch(inputBox, divId, resetURL) {
  if (inputBox.value != null && inputBox.value.length >= 3) {
    // 
    ajaxSubmitFormObject(divId, inputBox.form.action, inputBox.form);
  } else {
    if (inputBox.value == null || inputBox.value.length == 0) {
      // Reset the search
      ajaxLink(divId, resetURL);
    }
  }       
}


function setStyle(element, styleText) {
    element.setAttribute("style", styleText);
    element.style.cssText = styleText;
}

function addDiv(divID) {
    var dialog = document.createElement('div');
    dialog.innerHTML = '<div id="' + divID + '"></div>';
    document.body.appendChild(dialog);
    return document.getElementById(divID);
} 

function addImage(id, src) {
    var img = document.createElement("img");
    img.src = src;
    img.id = id;
    return img;
}

/*** START AJAX FUNCTIONS ***/
function ajaxInlinePopupForm(divID, htmlForm) {
    hideSeeThroughElements();

    container = document.getElementById('shadowedBox');
    dataContainer = document.getElementById('shadowedBoxBody');    
    linkNode = document.getElementById(divID);
    ajaxRequestV2({divID:'shadowedBoxBody' , url:htmlForm.action,htmlForm:htmlForm, spinnerDivID:'shadowedBoxBodyTitleSpinner'});

    container.style.left = 220 + parseInt(document.documentElement.scrollLeft) + "px";
    container.style.top = 200 + parseInt(document.documentElement.scrollTop) + "px";
    container.style.display='inline';

    if (document.getElementById("headerDiv")) {
        $("#shadowedBox").draggable({ cursor: "move", handle: "#headerDiv", containment:"document" });
    }
    try {
        $("#shadowedBox").fadeIn('slow');
    } catch (e) {
        container.style.display="inline";
    }
}

function ajaxSubmitFormObjectFinal(divID, url, htmlForm, evaluateJS) {
    ajaxRequestV2({divID:divID, url:url, htmlForm:htmlForm, evaluateJS:evaluateJS});
    return false;
}


function ajaxRequestV2(params) {
    divID = params.divID;
    url = params.url;
    htmlForm = params.htmlForm;
    evaluateJS = params.evaluateJS;
    silent = params.silent;
    overlaySpinner = params.overlaySpinner;
    spinnerDivID = params.spinnerDivID;
    spinnerDiv = spinnerDivID ? document.getElementById(spinnerDivID) : null;
    inlinePopupTitle = params.inlinePopupTitle;
    inlinePopupTitleDiv = document.getElementById('titlePopupHeader');
    spinnerImage = params.spinnerImage;
    onajaxcomplete = params.onajaxcomplete;
    focusfield =params.autoFocusField;
    autofocus = params.autofocus;
    loadingTextColor = params.loadingTextColor;

    if (htmlForm) {
      url = convertFormToURL(url, htmlForm);
    }
    
    var element = document.getElementById(divID);
    isGet = (htmlForm ? false : true);

    var r = getAjaxRequestFinal(url, element, isGet);
    r.onreadystatechange = function () {
        if (r.readyState != 4) {
            return;
        }
	var responseText = r.responseText;
      if (spinnerDiv) {
	    spinnerDiv.innerHTML = '';
	  }
	  if (inlinePopupTitle && inlinePopupTitleDiv) {
	      inlinePopupTitleDiv.innerHTML = inlinePopupTitle;
	  }
          if (responseText.indexOf("ajax-eval-code") > 0) {
            var ary = responseText.split("<ajax-eval-code>");
            $('#' + element.id).html(ary[0]);
            eval(ary[1].split("</ajax-eval-code>")[0]);
          } else if (responseText.indexOf("//JavaScript") > 0) {
            eval(responseText);
          } else {
	      $('#' + element.id).html(responseText);
          }
        if(autofocus != null && autofocus == 'true'){
            if(focusfield != null){
                if ($('#' + focusfield).length > 0) {
                    $("#"+focusfield).focus();
                } else {
                   $("[name='"+focusfield+"']").focus();
                }
            }else{
                $("#"+divID+" :input[type='text']:first").focus();
            }
        }

          if (onajaxcomplete) {
            onajaxcomplete();
          }

    }

    if (overlaySpinner) {
	element.innerHTML = '<div  align="center" style="position:absolute;' + 
	    'width:' + element.clientWidth + 
	    'px;height:' + element.clientHeight + 'px;">' +
	    '<div style="margin-top:' + (element.clientHeight/2) + 'px;"><img src="/images/loading-c.gif" > &nbsp; <span style="color:white;position:relative;top:-5px;">Loading...</span></div></div>' +
	    element.innerHTML;
    } else if (!silent) {
	(spinnerDiv ? spinnerDiv : element).innerHTML = params.spinner ? params.spinner : '<div ' + 
	' align="center">' + 
        '<img src="/images/' + (spinnerImage ? spinnerImage : "loading-c.gif") + '"> &nbsp; <span style="color:' + (loadingTextColor ? loadingTextColor : 'white') + ';position:relative;top:-5px;">Loading...</span></div>';
    }    

    if (htmlForm) {
      return false;
    }
}


function ajaxLinkCallback(url, callback) {
    var element = null;
    var r = getAjaxRequestFinal(url, element, false);
    r.onreadystatechange = function () {
        if (r.readyState != 4) {
            return;
        }
        callback.call(this, r);
    }
    return false;        
}

function ajaxSubmitSilent(htmlForm, callback) {
    var url = convertFormToURL(htmlForm.action, htmlForm);
    var element = null;
    var r = getAjaxRequestFinal(url, element, false);

    r.onreadystatechange = function () {
        if (r.readyState != 4) {
            return;
        }

        if (callback) {
          callback.call(this, r);
        }
    }
    return false;
}


function ajax2Form(spinnerDiv, targetDiv, htmlForm) {    
    var url = convertFormToURL(htmlForm.action, htmlForm);

    var spinnerDivElement = document.getElementById(spinnerDiv);
    var currentHTML = spinnerDivElement.innerHTML;

    var targetDivElement = document.getElementById(targetDiv);
    var threadId = 0;
    var r = getAjaxRequestFinal(url, targetDivElement, false);

    r.onreadystatechange = function () {

        if (r.readyState != 4) {
            return;
        }

        if (r.responseText.indexOf("//JavaScript") > 0) {
          eval(r.responseText);
        } else {
          targetDivElement.innerHTML = r.responseText;
        }

        spinnerDivElement.innerHTML = "";

        if (threadId != 0) { 
            clearTimeout(threadId);
        }
    }

    spinnerDivElement.innerHTML = '<div style="position:absolute;padding:0px 10px;margin-top:-5px;" align="center"><img src="/images/waiting.gif"> &nbsp; <span style="position:relative;top:-7px;">Loading...</span></div>';
    return false;
}


function ajaxDeleteRow(rowID, url, identifierValue) {
        ajaxDeleteRow1(rowID, url, identifierValue, "Are you sure ?");
}

function ajaxDeleteRow1(rowID, url, identifierValue, confirmMessage, identifierName) {
    if (! identifierName) {
        identifierName = "id";
    }
    var element = document.getElementById(rowID);
    url = url + (url.indexOf("?") >= 0 ? "&" : "?") + identifierName + "=" + identifierValue;
    if (confirm(confirmMessage) && element) {
        var r = getAjaxRequest(url, element);
        r.onreadystatechange = function () {
            if (r.readyState != 4) {
                return;
            }
            
            element.parentNode.deleteRow(element.rowIndex);

            if (r.responseText.indexOf("//JavaScript") > 0) {
              eval(r.responseText);
            }
        }

        statusSpan = document.getElementById("status_" + identifierValue);
        if (statusSpan) {
            statusSpan.innerHTML = '<div style="position:absolute;0px 10px;margin-top:-5px;" align="center"><img src="/images/waiting.gif">  <span style="position:relative;top:-7px;">Loading...</span></div>';
        }
    }
}

function ajaxInlinePopup(id, url, autoFocusField) {

    container = document.getElementById('shadowedBox');

    if (document.getElementById('titlePopupHeader')) {
	document.getElementById('titlePopupHeader').innerHTML='';
    }

    if (!container) {
        alert('Container not found. Please wait for the page to load');
    }    
    dataContainer = document.getElementById('shadowedBoxBody');
    dataContainer.innerHTML = '';

    leftPx = 220 + (document.body.scrollLeft || document.documentElement.scrollLeft);
    topPx = 200 + (document.body.scrollTop || document.documentElement.scrollTop);
    container.style.left = leftPx + 'px';
    container.style.top = topPx + 'px';
    container.style.zIndex = 100;
    container.style.direction = "ltr";

    ajaxRequestV2({divID:dataContainer.id , url:url, spinnerDivID:'shadowedBoxBodyTitleSpinner', autoFocusField:autoFocusField, autofocus:'true'});

    
    if (document.getElementById("headerDiv")) {
	$("#shadowedBox").draggable({ cursor: "move", handle: "#headerDiv", containment:"document" });
    }

    try {
	$("#shadowedBox").fadeIn('slow');
    } catch (e) {
        container.style.display="inline";
    }
}

function ajaxInlineDiv(params) {
    var elementID = params.elementID;
    var divID = params.divID;
    var url = params.url;
    var focusfield =params.autoFocusField;
    var autofocus = params.autofocus;
    var container = document.getElementById('inlineDiv');

    if (!container) {
        alert('Container not found. Please wait for the page to load');
    }

    var element = document.getElementById(divID);
    var dataContainer = document.getElementById('inlineDivBody');
    dataContainer.innerHTML = '';
    var r = getAjaxRequestFinal(url, element, true);
    r.onreadystatechange = function () {
        if (r.readyState != 4) {
            return;
        }
        var responseText = r.responseText;
        if (responseText.indexOf("ajax-eval-code") > 0) {
            var ary = responseText.split("<ajax-eval-code>");
            $('#' + element.id).html(ary[0]);
            eval(ary[1].split("</ajax-eval-code>")[0]);
        } else if (responseText.indexOf("//JavaScript") > 0) {
            eval(responseText);
        } else {
            $('#' + element.id).html(responseText);
        }

        var leftPx = $('#' + elementID).offset().left + ($('#' + elementID).width()/2);
        var topPx = $('#' + elementID).offset().top - $(container).height() - 30;
        container.style.left = leftPx + 'px';
        container.style.top = topPx + 'px';
        container.style.zIndex = 100;
        container.style.direction = "ltr";

        try {
            container.style.display="inline";
            if(autofocus != null && autofocus == 'true') {
                if(focusfield != null) {
                    if ($('#' + focusfield).length > 0) {
			$("#"+focusfield).focus();
                    } else {
                        $("[name='" + focusfield + "']").focus();
                    }
                }else{
                    $("#" + divID + " :input[type='text']:first").focus();
                }
            }
        } catch (e) {

        }

        $(container).click(function(e) {
            e.stopPropagation();
        });

        $(document).click(function(e) {
            container.style.display="none";
        });
    }
}

function ajaxLink(divID, url, spinnerDivId) {
  ajaxRequestV2({divID:divID , url:url, spinnerDivID:spinnerDivId, spinnerImage:'blue-whitebg-spinner.gif'});
}



function getAjaxRequestFinal(url, element, encURL) {
    var req = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));

    if (!req) {
        alert("Could not execute AJAX Request");
        return;
    }
    sendAjaxRequest(url, req, encURL, element);
    return req;
}

function getAjaxRequest(url, element) {
    return getAjaxRequestFinal(url, element, true);
}

function sendAjaxRequest(url, req, encURL) {
	sendAjaxRequest(url,req,encURL,null);
}

function sendAjaxRequest(url, req, encURL, element) {
    var debugURL = encodeURIComponent("[" + url + "]");
    var noAlert = element && element.type && element.type.indexOf("text") >=0 ? "noAlert=true" : "";
    url = (url.indexOf("?") > 0 ? 
           url.split("?")[0] + "?ajax=true&engine=dojo&"  + noAlert + "&" + url.split("?")[1] : 
           url + "?ajax=true&engine=dojo&" + noAlert);
    url = (encURL ? encodeURL(url) : url);    
    if (!encURL) {
        var baseurl = url.split("?")[0];    
        req.open("POST", baseurl ,true);
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded;charset=UTF-8');
        if (element && (url.indexOf("discussionVote") > 0) || (url.indexOf("showCreateTopic") > 0)) { // HACK - talk to JP
	        /* Shove in the ID of the target element so that we know where to go later if authentication is needed */
    	    req.setRequestHeader('AJAX-TARGET-DIV', element.id);
    	}
        req.setRequestHeader('Connection', 'close');
        var params = url.split("?")[1];
        req.setRequestHeader('Content-length', params.length);
        req.send(params);
    } else {
        req.open("GET", url, true);
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded;charset=UTF-8');
        if (element && (url.indexOf("discussionVote") > 0) || (url.indexOf("showCreateTopic") > 0)) { // HACK - talk to JP
	        /* Shove in the ID of the target element so that we know where to go later if authentication is needed */
	        req.setRequestHeader('AJAX-TARGET-DIV', element.id);
	    }
        req.setRequestHeader('Connection', 'close');
        req.send(null);
    }
}

function encodeURL(url) {
    if (url.split("?").length == 0) {
        return;
    }
    url = url.split("#")[0];
    var ary = url.split("?")[1].split("&");
    var params = "";
    for (i=0; i < ary.length; i++) {
        params += ary[i].split("=")[0] + "=" + encodeURIComponent(ary[i].split("=")[1]) + "&";
    }
    return url.split("?")[0] + "?" + params.replace(/\&$/gi,"");
}

function convertFormToURL(url, formObj) {
    var str = "";
    for (i=0; i < formObj.elements.length;i++) {
        if (formObj[i].name && formObj[i].name != '' &&
            formObj[i].type &&
            formObj[i].type.toLowerCase() != 'button' &&
            formObj[i].type.toLowerCase() != 'submit') {
            if (formObj[i].type.toLowerCase() == 'checkbox' || formObj[i].type.toLowerCase() == 'radio') {
                str += (formObj[i].checked ?
                        formObj[i].name + "=" + encodeURIComponent(formObj[i].value) + "&" : "");
            } else {
                if (formObj[i].type.toLowerCase().indexOf('select') >= 0 &&
                    formObj[i].multiple) {
                    for (multiInd=0; multiInd < formObj[i].options.length; multiInd++) {
                        if (formObj[i].options[multiInd].selected) {
                            str += formObj[i].name + "=" + encodeURIComponent(formObj[i].options[multiInd].value) + "&";
                        }
                    }
                } else {
                    str += formObj[i].name + "=" + encodeURIComponent(formObj[i].value) + "&";
                }
            }
        }
    }
    str = url + (url.indexOf("?") >= 0 ? "&" : "?") + str.replace(/\&$/gi,"");
    return str;
}

function ajaxLinkForControl(controlID, url) {
    ajaxLinkForControl1(document.getElementById(controlID), url, true);
}

function ajaxLinkForControl1(element, url, append) {
    var r = getAjaxRequest(url, element);
    r.onreadystatechange = function () {
        if (r.readyState != 4) {
            return;
        }
        element.value = stringTrim(r.responseText) + (append ? element.value.replace(/Please wait\.\.\./i,""): "");
    }
    element.value = 'Please wait...' + element.value;
}

function ajaxLink1(element, url) {
    var r = getAjaxRequest(url, element);
    r.onreadystatechange = function () {
        if (r.readyState != 4) {
            return;
        }
        element.innerHTML = r.responseText;
    }
    element.innerHTML = '<div style="position:absolute;padding:0px 10px;margin-top:-5px;" align="center"><img src="/images/waiting.gif"><span style="position:relative;top:-7px;">Loading...</span></div>';
}

function ajaxLink2(divID, url) {
    element = document.getElementById(divID);
    var r = getAjaxRequest(url, element);
    r.onreadystatechange = function () {
        if (r.readyState != 4) {
            return;
        }
        eval(r.responseText);
        element.innerHTML = '';
    }
    element.innerHTML = '<div style="position:absolute;padding:0px 10px;margin-top:-5px;" align="center"><img src="/images/waiting.gif"><span style="position:relative;top:-7px;">Loading...</span></div>';
}

function ajaxLinkSilent(divID, url) {
    ajaxRequestV2({divID:divID , url:url, silent:'true'});
}

function ajaxFormValidation(divID, url, htmlForm) {
    var element = document.getElementById(divID);
    var url = convertFormToURL(url, htmlForm);
    var r = getAjaxRequestFinal(url, element, false);
    r.onreadystatechange = function () {
        if (r.readyState != 4) {
            return;
        }
        eval(r.responseText);
        element.innerHTML = "";
    }
    element.innerHTML = '<div align="center"><img src="/images/waiting.gif"><br/>Validation in processs..</div>';
}


/*** END AJAX FUNCTIONS ***/




/*** START LIGHTBOX FUNCTIONS ***/
if (!LightboxInternal) {
    var LightboxInternal = {};    
}

var LIGHTBOX_STYLES = new Array();
LIGHTBOX_STYLES['lightbox-overlay'] = 'position:fixed;' +
    '   border:2px solid #000000;' +
    '   top:0;' +
    '   left:0;' +
    '   width:100%; ' +
    '   height:5000px;' +
    '   z-index:5000;  ' +
    '   background-color:#110f0f; ' +
    '   opacity:.70;' +
    '   -moz-opacity: 0.7; ' +
    '   filter: alpha(opacity=80); ';

LIGHTBOX_STYLES['lightbox-widget-body'] = 'position:fixed; ' +
    '   z-index:10001;    ' +
    '   border:1px solid #cccccc; ' +
    '   background-color:#fff;  ' +
    '   padding: 5px; ' +
    '   left:35%; ' +
    '   top:20%; ' +
    '   border-radius: 5px;  ' +
    '   box-shadow: 0 0 5px #000000;  ' +
    '   -webkit-box-shadow: 0 0 5px #000000;  ';


LightboxInternal.JS = {
    
    blockBg: function() {
        var div = (document.getElementById("lightboxOverlay") == null ?
                   addDiv("lightboxOverlay"):
                   document.getElementById("lightboxOverlay"));
        setStyle(div, LIGHTBOX_STYLES['lightbox-overlay']);
        div.style.display='block';        
        div.style.top = LightboxInternal.JS.getTopOffset() + "px";
        div.onclick = function() {
            LightboxInternal.JS.unblockBg();
        };
    },

    unblockBg: function() {
        hideDiv("lightboxBodyDiv");
        hideDiv("lightboxOverlay");
        showSeeThroughElements();
    },

    showDiv: function(url) {
        LightboxInternal.JS.showDiv1(url, 450, 500);
    },

    getLightboxDiv: function() {
        var div = (document.getElementById("lightboxBodyDiv") == null ?
                   addDiv("lightboxBodyDiv"):
                   document.getElementById("lightboxBodyDiv"));
        div.innerHTML = "";
        setStyle(div, LIGHTBOX_STYLES['lightbox-widget-body']);
        div.style.display='block';
        div.style.top = (parseInt(LightboxInternal.JS.getTopOffset()) + (screen.height/6)) + "px";
        return div;
    },

    showDiv1: function(url, height, width) {
        hideSeeThroughElements();
        LightboxInternal.JS.blockBg();                
        var div = LightboxInternal.JS.getLightboxDiv();
        var spinner = LightboxInternal.JS.getWaitingSpinner();
        div.appendChild(spinner);
        div.style.width = width + 'px';
        div.style.height = height + 'px';
        div.innerHTML = div.innerHTML + ('<div align="center">' +
                                         '<div align="right"><a href="javascript:LightboxInternal.JS.unblockBg();" class="iconLink"><img class="iconLink" ' +
                                         'src="' + (BASE_URL ? BASE_URL : '') + '/images/iconshock/delete_16.gif" border="0"></a></div>' +
                                         '<iframe src="' + url + '&rand=1" frameborder="0" scrolling="auto" style="width:95%;height:' + 
                                         (parseInt(height) - 10) + 'px;"></iframe></div>');
        setTimeout("hideDiv('waitingImg');", 2000);
    },

    playVid: function(url) {
        LightboxInternal.JS.playVid1(url, 400, 580);
    },

    playVid1: function(url, height, width) {
        hideSeeThroughElements();
        LightboxInternal.JS.blockBg();
        var div = LightboxInternal.JS.getLightboxDiv();
        div.innerHTML = "<object type=\"application/x-shockwave-flash\" data=\"/images/FlowPlayerDark.swf\" id=\"FlowPlayerObj\" " + 
        "width=\"580\" height=\"400\">" +
        "<param name=\"allowScriptAccess\" value=\"always\"/>" +
        "<param name=\"movie\" value=\"/images/FlowPlayerDark.swf\"/>" +
        "<param name=\"quality\" value=\"high\"/>" +
        "<param name=\"scale\" value=\"noScale\"/>" +
        "<param name=\"wmode\" value=\"transparent\"/>" +
        "<param name=\"flashvars\" value=\"config={ autoPlay:true,loop:false,bufferLength:1," +
        "playList:[{overlayId: 'play'}, { name: 'Help Video', url:'" + url + "'}], showMenu:false,showLoopButton:false}\"/>" +
        "<embed id=\"FlowPlayer\" wmode=\"transparent\" src=\"/images/FlowPlayerDark.swf\" " +
        "type=\"application/x-shockwave-flash\" width=\"320\" height=\"263\" "+
	"flashvars=\"config={ autoPlay:true,loop:false,bufferLength:1,playList:[{overlayId: 'play'}, { name: 'Help Video', url:'" + url + "'}], showMenu:false,showLoopButton:false}\" " +
	" ></embed>" +
        "</object>";
        var overlayDiv = document.getElementById("lightboxOverlay");
        overlayDiv.onclick = function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        };
    },
    
    loadHtml: function(divID) {
        hideSeeThroughElements();
        LightboxInternal.JS.blockBg();
        var div = LightboxInternal.JS.getLightboxDiv();	
        div.innerHTML = getSalesChatDiv();
        var overlayDiv = document.getElementById("lightboxOverlay");
        overlayDiv.onclick = function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        };
        $(".chatCloseDiv").click(function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        });
    },
   
    openImage: function(url) {
        hideSeeThroughElements();
        LightboxInternal.JS.blockBg();
        var div = LightboxInternal.JS.getLightboxDiv();
	div.style.top = "15%";
	div.style.left = "30%";
        div.innerHTML = "<div id='imageLBDiv'><div class='chatCloseDiv' onclick=\"hideDiv(\'imageLBDiv\');\" style='float:right;position:relative;left:22px;top:-20px;cursor:pointer;'>" +
			"<img src='/images/chat-Close.png'></div><div><img src='" + url + "'></div>";
        var overlayDiv = document.getElementById("lightboxOverlay");
	overlayDiv.style.top = 0;
        overlayDiv.onclick = function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        };
        $(".chatCloseDiv").click(function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        });
    },

    openNonProfit: function() {
        hideSeeThroughElements();
        LightboxInternal.JS.blockBg();
        var div = LightboxInternal.JS.getLightboxDiv();
	var lbDiv = document.getElementById("lightboxBodyDiv");
        div.style.top = "15%";
        div.style.left = "30%";
	lbDiv.style.background = "#E9F2F7";
	lbDiv.style.border = "#BEDDEE";
	lbDiv.style.width = "710px";
        div.innerHTML = "<div id='imageLBDiv'><div class='chatCloseDiv' onclick=\"LightboxInternal.JS.unblockBg();\" style='float:right;position:relative;left:22px;top:-20px;cursor:pointer;'>" +
                        "<img src='/images/qphome/chat-Close.png'></div><div class=\"nonprofit_blob\" style=\"top:-35px;height:320px;\"><div><div class=\"r7_c2_c1 nonprofit_blob_c1\" > Get Started! </div><div class=\"nonprofit_blob_c3\"><div>1. Signup for a free account with QuestionPro. </div><div>2. Add a short statement to your website  homepage that acknowledges/thanks QuestionPro as the sponsor of your survey  software. This text should be 1-3 sentences long  and must include a link to http://www.questionpro.com.</div><div style=\"top:5px;\">3. After adding the link to your homepage, please send an email to <a href='mailto:non-profit@questionpro.com'>non-profit@questionpro.com</a> <br/>one of our representatives will get back to you shortly to upgrade your account for free! <b><i>Your account will remain active as long as the text and link to QuestionPro's homepage remains on your site.</i></b></div></div></div></div></div>";
        var overlayDiv = document.getElementById("lightboxOverlay");
        overlayDiv.style.top = 0;
        overlayDiv.onclick = function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        };
        $(".chatCloseDiv").click(function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        });
    },

    openFreeStudentSponsorship: function() {
        hideSeeThroughElements();
        LightboxInternal.JS.blockBg();
        var div = LightboxInternal.JS.getLightboxDiv();
        var lbDiv = document.getElementById("lightboxBodyDiv");
        div.style.top = "15%";
        div.style.left = "30%";
        lbDiv.style.background = "#E9F2F7";
        lbDiv.style.border = "#BEDDEE";
        lbDiv.style.width = "710px";
        lbDiv.style.height = "330px";
        div.innerHTML = "<div id='imageLBDiv'><div class='chatCloseDiv' onclick=\"LightboxInternal.JS.unblockBg();\" style='float:right;position:relative;left:22px;top:-20px;cursor:pointer;'>" +
            "<img src='/images/qphome/chat-Close.png'></div><div class=\"nonprofit_blob\" style=\"top:-35px;height:265px;\"><div><div class=\"r7_c2_c1 nonprofit_blob_c1\" > Getting Started </div><div class=\"nonprofit_blob_c2\">To get started with Free student sponsorship:</div><div class=\"nonprofit_blob_c3\"><div>1. Create a basic free account on QuestionPro.com using your .edu email address </div><div>2. From your personal twitter account, send this tweet:</div><div class=\"nonprofit_blob_c4\" >Using free student survey software from @QuestionPro, check it out: http://www.questionpro.com/student-research/</div><div style=\"top:26px;height:5px;\">3. Like us on <a href=\"http://www.facebook.com/questionpro\" target=\"_blank\">Facebook</a> or plus one us on <a href=\"http://plus.google.com/106353018583808475161\" target=\"_blank\">Google</a></div><div style=\"top:46px;height:5px;\">4. After you have completed the above, write us from your .edu email account at: &nbsp;&nbsp;<a href=\"mailto:students@questionpro.com\" style=\"color: #0073C9\">students@questionpro.com</a> And we will upgrade your account.</div></div></div></div>";
        var overlayDiv = document.getElementById("lightboxOverlay");
        overlayDiv.style.top = 0;
        overlayDiv.onclick = function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        };
        $(".chatCloseDiv").click(function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        });
    },

    openHTML: function(url) {
        hideSeeThroughElements();
        LightboxInternal.JS.blockBg();
        var div = LightboxInternal.JS.getLightboxDiv();
        div.style.top = "15%";
        div.style.left = "30%";
        div.innerHTML = "<div id='imageLBDiv'><div class='chatCloseDiv' onclick=\"hideDiv(\'imageLBDiv\');\" style='float:right;position:relative;left:22px;top:-20px;cursor:pointer;'>" +
                        "<img src='/images/qphome/chat-Close.png'></div><div>" + url + "</div>";
        var overlayDiv = document.getElementById("lightboxOverlay");
        overlayDiv.style.top = 0;
        overlayDiv.onclick = function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        };
        $(".chatCloseDiv").click(function() {
            LightboxInternal.JS.unblockBg();
            div.innerHTML = "";
        });
    },

    getWaitingSpinner: function() {
        return (document.getElementById("waitingImg") == null ?
                addImage("waitingImg", (BASE_URL ? BASE_URL : '') + "/images/waiting.gif") :
                document.getElementById("waitingImg"));
    },
       
    getTopOffset: function() {
        var s;
        // scrolling offset calculation via www.quirksmode.org
        if (self.pageYOffset){
            s = self.pageYOffset;
        } else if (document.documentElement && document.documentElement.scrollTop) {
            s = document.documentElement.scrollTop;
        } else if (document.body) {
            s = document.body.scrollTop;
        }
        return s;
    }
};

/*** END LIGHTBOX FUNCTIONS ***/


DynamicSearcher = { 
  hookupFocus: function(searchInputElement, defaultValue) {
    if (!defaultValue) {
        defaultValue = "Search";
    }

    if (searchInputElement.value == defaultValue) {
      searchInputElement.value = '';
    }
  },
  hookupBlur: function(searchInputElement, defaultValue) {
    if (!defaultValue) {
        defaultValue = "Search";
    }
    if (searchInputElement.value == '') { 
      searchInputElement.value = defaultValue;
    }
  },
  search: function(query, url, divId, resetURL) {

    if (query != null && query.length >= 3) {
      // only do the search if more than 3 letters

      if (this.currentSearch != query) {
        if (query.split(" ").length <= 3) {
          ajaxLinkSilent(divId, url + query);
        } 

        this.currentSearch = query;
      }
    } else if (query == null || query.length == 0) { 
      // Reset the search
      ajaxLinkSilent(divId, resetURL);
    }    
  },
  currentSearch: null
};

AutoComplete = {
  complete: function(sourceInput, targetName, postFix) {
    var form = sourceInput.form;
    var targetObject = form[targetName];
    if (targetObject.value == '' && sourceInput.value != '') {
      targetObject.value = sourceInput.value + " " + postFix;
    }   
  },

  completeURL: function(sourceInput, targetName, postFix) {
    var form = sourceInput.form;
    var targetObject = form[targetName];
    if (sourceInput.value != '') {
      targetObject.value = (sourceInput.value.split(' ').join('') + postFix).toLowerCase();
    }
  }
};

SmartCommentBox = {
  mouseIn: function (textArea, div) {
        showDiv(div);
  },
  mouseOut: function(textArea, div) {
    if (textArea.value.length == 0) { 
        hideDiv(div);
    }
  }
};


SmartExplanation = {
  onFocus: function(inputElement, divId) {
    showDiv(divId);        
  },
  onBlur: function(inputElement, divId) {
    // Do Not Hide Immediately
    timeoutId = window.setTimeout(function() { 
        hideDiv(divId);
        }, 5000);
  }
};

DirtyBitProcessor = {
  register: function(inputElement) {
    // Register this inputElement
    // For Dirty bit processing
    var dirtyBitElement = DirtyBitProcessor.getDirtyBitElement(inputElement.form);
    if (dirtyBitElement) { 
      // We have storage
      dirtyBitElement.value = 'true';
    }
  },
  processAjaxLink: function(formName, divId, linkURL) {
    var myForm = document.forms[formName];
    if (myForm) {
      // Havea form
      var dirtyBitElement = DirtyBitProcessor.getDirtyBitElement(myForm);
      if (dirtyBitElement && dirtyBitElement.value == 'true') {
	if (confirm("You are about to navigate away from a page where changes have not been saved." + 
        " Select Cancel to return to the page. Select OK to discard changes.")) {
	        // This form is Dirty 
        	// Need to save this
	        ajaxSubmitSilent(myForm);
	}
      }
    } 

    return ajaxLink(divId, linkURL);         
  },
  getDirtyBitElement: function(form) {
    return form.elements['DirtyBitField'];
  }
};


InteractiveSurveyProcessor = {
  maxDiff: function(sourceElement, targetCheckboxName, targetCheckboxValue, currentAnswerID, answerIDValues, styleClassName) {

  var myform = sourceElement.form;

  for (i = 0; i < myform.elements.length; ++i) { 
    var element = myform.elements[i];
    if (element.name == targetCheckboxName) {       
      element.disabled = false; 
    }
  }

  targetElement = document.getElementById('element_' + targetCheckboxValue);
  if (targetElement) {
    targetElement.disabled = true;
  }



  // First cleanup
  for (i = 0 ; i < answerIDValues.length; ++i) {
    var element = document.getElementById("MaxDiffContent_" + answerIDValues[i]);
    if (element) {    
      if (element.className == styleClassName) {
        element.className = 'SurveyNoVote';
      }
    }
  }




  var leastTarget = document.getElementById('MaxDiffContent_' + targetCheckboxValue);
  if (leastTarget) {
    leastTarget.className = styleClassName;
  }        

  var mostTarget  = document.getElementById('MaxDiffContent_' + currentAnswerID);
  if (mostTarget) {
    mostTarget.className = styleClassName;
  }

  
  },
  register: function(inputElement) {
    // Register this inputElement
        
  },
  delayedDisplay: function(divId, timeout) {
    divElement = document.getElementById(divId);
    if (divElement) {
        window.setTimeout(function() {
          showDiv(divId)
        }, timeout * 1000);
    }
  },
  displayContinueButton: function() {
    showDiv('SurveySubmitButton');
  },
  disableContinueButton: function() {
    $("#SurveySubmitButtonElement").attr("disabled", "disabled");
  },
  enableContinueButton: function() {
    $("#SurveySubmitButtonElement").removeAttr("disabled");
  },
  ajaxConditionalSubmit: function(inputElement) {
    if (inputElement.checked) {
      this.ajaxSubmit(inputElement);
    }
  },
  ajaxSubmit: function(inputElement) {
    var fadeDone = false;;
    var response = null;

    $("#SurveyAjaxContainer").fadeOut("slow", function() { 
                                                fadeDone = true;
                                                if (response) { 
                                                  InteractiveSurveyProcessor.displayResponse(response, "#SurveyAjaxContainer");
                                                 }
                                              });
					      document.getElementById('SurveySubmitButtonElement').click();
					      sleep(400);
					      $("#SurveyAjaxContainer").fadeIn("slow");
  },
  ajaxLink: function(url, divId) {
    var fadeDone = false;;
    var response = null;
    $(divId).fadeOut("slow", function() { 
                                                fadeDone = true;
                                                if (response) { 
                                                  InteractiveSurveyProcessor.displayResponse(response, divId);
                                                }
                                              });

    ajaxLinkCallback(url, function(r) {   
                                          response = r;
                                          if (fadeDone) {
                                            InteractiveSurveyProcessor.displayResponse(response, divId);
                                          }
                                      });
  },
  displayResponse: function(response, divId) {
alert("I am in displayResponse")
    $(divId).html(response.responseText );
    $(divId).fadeIn("slow");
  }
}


function showFBDD(divID) {
    var header = document.getElementById(divID + "Header");
    var selHeader = document.getElementById(divID + "SelHeader");    
    var ddbody = document.getElementById(divID + "-body");

    if (ddbody.style.display == 'none') {
        if( oldPopUpDiv != null)
        {
           hideFBDD(oldPopUpDiv);
        }
	if (selHeader)
	selHeader.style.display='';
	if(header)
	header.style.display='none';
        ddbody.style.display='';
        ddbody.className='fbDDBody';        

        oldPopUpDiv = divID;
    } else {
        hideFBDD(divID);
    }
}

function hideFBDD(divID) {
    try {
        var header = document.getElementById(divID + "Header");
        var selHeader = document.getElementById(divID + "SelHeader");
        var ddbody = document.getElementById(divID + "-body");
        if (selHeader)
            selHeader.style.display='none';
        if (header)
            header.style.display='';
        ddbody.style.display='none';
        oldPopUpDiv = null;
    } catch(e) {
    }
}


function setElementText(eleID, text) {
    document.getElementById(eleID).innerHTML=text;
}


function displayCharacterLimit(textBoxElement, maxLength, displayDivID) {
    targetDiv = document.getElementById(displayDivID); 
    if (targetDiv) {
        targetDiv.innerHTML = (maxLength - textBoxElement.value.length);
    }
}

AIM = { 
        frame : function(c) {
                 var n = 'f' + Math.floor(Math.random() * 99999);
                var d = document.createElement('DIV');
                d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="AIM.loaded(\''+n+'\', \''+c.responseDivId+'\')"></iframe>';
                document.body.appendChild(d);
 
                var i = document.getElementById(n);
                if (c && typeof(c.onComplete) == 'function') {
                        i.onComplete = c.onComplete;
                }
                return n;
        },
 
        form : function(f, name) {
                f.setAttribute('target', name);
        },
 
        submit : function(f, c) {
                AIM.form(f, AIM.frame(c));

                if (c) {
                  if (typeof(c.onStart) == 'function') {
                        return c.onStart();
                  }
                  if (c.spinnerDivId) {
                    document.getElementById(c.spinnerDivId).innerHTML = '<div style="position:absolute;padding:0px 10px;margin-top:-5px;" align="center"><img src="/images/'  + (c.spinnerImage ? c.spinnerImage : "waiting.gif") + '"><span style="position:relative;top:-7px;">Loading...</span></div>';
                  }
                } 

                return true;
        },
 
        loaded : function(id, responseDivId) {
                var i = document.getElementById(id);
                if (i.contentDocument) {
                        var d = i.contentDocument;
                } else if (i.contentWindow) {
                        var d = i.contentWindow.document;
                } else {
                        var d = window.frames[id].document;
                }
                if (d.location.href == "about:blank") {
                        return;
                }
 
                if (responseDivId) {
                  document.getElementById(responseDivId).innerHTML = d.body.innerHTML;
                }

                if (typeof(i.onComplete) == 'function') {
                        i.onComplete(d.body.innerHTML);
                }
        }
 
}

function disableLinks(excludeStr) {
        disableLinks(null, excludeStr);
}

function disableLinks(defaultLink, excludeStr) {
    var elements = document.getElementsByTagName("a");
    var exclude = excludeStr.split(",");
    for(i=0; i < elements.length; i++) {
        var ele = elements[i];
        try {
          var linkDis = true;
          for (j=0;j < exclude.length;j++) {
            if (ele.href && ele.href.indexOf(exclude[j]) >= 0) {
              linkDis = false;
            }
          }         
          if (linkDis) {            
            if (defaultLink != null) {
                ele.href = defaultLink;
            } else {
              ele.onclick = function (){
                return false;
              };
            }
          }
        } catch (e) {
          //eat
        }
    }
}


function imageQuestionHilite(id, ary) {
    var inp = document.getElementById(id + 'ID');
    var div = document.getElementById(id + 'ImageDiv');
    
    if (inp && inp.checked) {
        //div.className='sectionMenuHighlight';
        //setStyle(div, 'cursor:pointer;cursor:hand;');
        div.onmouseout=function() {return false;};
    } else {
        //setStyle(div, 'background: #d2f0fb;cursor:pointer;cursor:hand;border-radius:5px;');
        //div.className='sectionMenuNormal';      
        div.onmouseout=function() {imageQuestionMouseOutLogic(id);};
    }

    if (inp) {
        inp.onclick=function(){inp.clickedOn="true";};
    }

    div.onclick=function(){
        if (inp && inp.clickedOn != "true"){
            inp.checked=!inp.checked;
            inp.clickedOn="false"
        }
        imageQuestionHilite(id, ary);
    };
    
    for (i=0; i < ary.length;i++) {
        var e = document.getElementById(ary[i] + "ID");
        div = document.getElementById(ary[i] + "ImageDiv");
        if (ary[i] != id && !e.checked) {            
            //div.className='';
            setStyle(div,'');
        }
    }
}

function imageQuestionMouseOutLogic(id) {
    var inp = document.getElementById(id + 'ID');
    var div = document.getElementById(id + 'ImageDiv');
    if (!inp || !inp.checked) { 
        //div.className='';
        setStyle(div,'');
    }
}


function liveWireForm(origState , form) {
    form.isTripped = function() {
        var currState = convertFormToURL(form.action, form);
        return (currState != origState);
    };
}

function questionWizardNavAjaxLink(url) {
    var form=document.forms['Wizard2Form'];
    if(form != null && form.isTripped()){
        if(confirm('Are you sure you want to navigate away from this page ?\n\n' +
                   'WARNING: You have edited settings on this page. To save settings, click OK\n\n' + 
                   'Press OK to save changes and continue, or Cancel to stay on the current page')){
            var el = document.createElement('input');
            el.type  = 'hidden';
            el.name  = 'leaveInlinePopupOpen';
            el.value = 'true';
            form.appendChild(el);
            form.elements[form.elements.lenght] = el;
            form.onsubmit();
        } else {
            return;
        }
    }
    ajaxLink('shadowedBoxBody', url);
}

function getCookie1(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function salesChatPopup(livePersonURL) {
    salesChatPopup(livePersonURL,false);
}

function salesChatPopup(livePersonURL, showMin) {
    salesChatPopup(livePersonURL, showMin, false);
}

function salesChatPopup(livePersonURL, showMin, chatOverride) {
    var noSalesPopup = getCookie1("noSalesPopup");
    showMin = (showMin ? showMin : ("true" == getCookie1("noSalesPopup")));

    if (!showMin) {
        var pages = (getCookie1("VISITEDPAGES") != null ? getCookie1("VISITEDPAGES") :"");
        //dont let the cookie grow out of hand
        //keep track of the last 10 pages only
        if (pages.split("]").length >= 10) {
            var len = pages.split("]").length;
            var ary = pages.split("]");
            pages="";
            for (i=(len-2);i > (len-10);i--) {
                pages = ary[i] + "]" + pages;
            }
        }        
        var loc = pages + "[" + document.location.href + "];"; 
        document.cookie = "VISITEDPAGES=" + loc + "path=/;";

        if (loc.split("]").length < 4 && !chatOverride) {
            return;
        }        
    }

    document.write('<div id="SalesChatPopup" style="background:url(\'/images/sales-chat-popup-bg.gif\') ' + 
                   'no-repeat;width:330px;height:300px;position:absolute;top:0;' + 
                   ';left:40%;z-index:10;">' +
                   '<div align="right" style="padding-top:15px;padding-bottom:90px;padding-right:10px;">' +
                   '<a href="javascript:document.cookie=\'minimizeSalesPopup=true;path=/;\' + ' + 
                   'document.cookie;hideDiv(\'SalesChatPopup\');showDiv(\'SalesChatPopupMin\');"><img src="/images/minimize.png" border="0"></a>' + 
                   '</div>' +
                   '<div align="center" onclick="hideDiv(\'SalesChatPopup\');showDiv(\'SalesChatPopupMin\');markNoSalesChat();">' +
                   '  <a href="' + livePersonURL +  '" ><img src="/images/sales-chat-popup-blank.gif" border="0"></a>' +
                   '</div>' +
                   '<div align="center" style="padding-top:10px;">' +
                   '<a href="javascript:markNoSalesChat();hideDiv(\'SalesChatPopup\');showDiv(\'SalesChatPopupMin\');" >' + 
                   '<img src="/images/sales-chat-popup-blank.gif" border="0"></a>' +
                   '</div>' +
                   '</div>' +
		   '<a href="' + livePersonURL +  '" >' +
                   '<div id="SalesChatPopupMin" style="background:url(\'/images/sales-chat-popup-min.gif\') ' + 
                   'no-repeat;width:330px;height:76px;right:0;bottom:0;position:fixed;z-index:10;display:none;cursor:pointer;cursor:hand;">' +
                   '</div></a>');
        
        var min = (showMin ? "true" : getCookie1("minimizeSalesPopup"));
        if ("true" == min && !chatOverride) {
            hideDiv('SalesChatPopup');showDiv('SalesChatPopupMin');
        } else {
            hideDiv('SalesChatPopupMin');showDiv('SalesChatPopup');
            animateDivToCenter('SalesChatPopup',0, 120);
        }
        window.onscroll = function () {
            document.getElementById('SalesChatPopup').style.top = parseInt(document.body.scrollTop) + 120 + "px";
            document.getElementById('SalesChatPopupMin').style.bottom = -1 * parseInt(document.body.scrollTop) + "px";
        };
}

function markNoSalesChat() {
    if (!getCookie1('noSalesPopup')) { 
        var expFromNow = 60*24*60*60*1000;  // Expires in 60 Days
        var exp = new Date();
        exp.setTime(exp.getTime() + expFromNow);
        document.cookie = "noSalesPopup=true;path=/;expires=" + exp.toGMTString() + ";" + document.cookie ; 
        hideDiv('SalesChatPopup');
        showDiv('SalesChatPopupMin');
    }     
}

function deleteCookie(name){
    var d = new Date();
    document.cookie = name + "=1;path=/;expires=" + d.toGMTString() + ";" ;
}


function animateDivToCenter(divID, currPos, finalPos) {
    var div = document.getElementById(divID);
    if (currPos >= finalPos) {
        showDiv(divID);
        return;
    }
    currPos = parseInt(div.style.top) + 1;
    div.style.top = parseInt(div.style.top) + 10;
    setTimeout("animateDivToCenter('" + divID + "', " + currPos + ", "+ finalPos + ");", 100);
}

function animateDivUpToPos(divID, currPos, finalPos, exec) {
    var div = document.getElementById(divID);
    if (currPos <= finalPos) {
        exec(divID);
        return;
    }
    currPos = parseInt(div.style.top) + 1;
    div.style.top = parseInt(div.style.top) - 14;
    var func = function() {
        animateDivUpToPos(divID, currPos,  finalPos);
    };
    setTimeout(func, 30);
}


function animateDivToPos(divID, currPos, finalPos, exec) {
    var div = document.getElementById(divID);
    if ((finalPos < 0 && currPos <= finalPos) ||
        (finalPos >= 0 && currPos >= finalPos) ){
        exec(divID);
        return;
    }
    currPos = parseInt(div.style.top) + 1;
    div.style.top = parseInt(div.style.top) + ((finalPos < 0 ? -1 : 1) * 14);

    var func = function() {
        animateDivToPos(divID, currPos,  finalPos, exec);
    };
    setTimeout(func, 30);
}

function findPosX(obj) {
    var curleft = 0;
    if(obj.offsetParent)
        while(1) 
        {
            curleft += obj.offsetLeft;
            if(!obj.offsetParent)
                break;
            obj = obj.offsetParent;
        }
    else if(obj.x)
        curleft += obj.x;
    return curleft;
}

function findPosY(obj) {
    var curtop = 0;
    if(obj.offsetParent)
        while(1)
        {
            curtop += obj.offsetTop;
            if(!obj.offsetParent)
                break;
            obj = obj.offsetParent;
        }
    else if(obj.y)
        curtop += obj.y;
    return curtop;
}


SimpleDropdown = {

    selectElement: function(hideBody, div) {        
        var mainDivID = '';
        var par = div.parentNode;
        for (i=0;i < 5;i++) {
            if (par.mainID) {
                mainDivID = par.mainID;
                break;
            } else {
                par = par.parentNode;
            }            
        }
        var selEleID = "sel-element-" + mainDivID;
        document.getElementById(selEleID).innerHTML = div.innerHTML;
        if (hideBody) {        
            hideDiv('sel-div-' + mainDivID);
        } 
    },

    showDropdown: function(mainDivID){    
        var mainDiv = document.getElementById('div-' + mainDivID);
        var div = document.getElementById('sel-div-' + mainDivID);
        var overflowDiv = document.getElementById('sel-div-overflow' + mainDivID);
        var xpos = findPosX(mainDiv);
        var ypos = findPosY(mainDiv);
        div.style.display='';
        var w = div.clientWidth;
        div.style.position='absolute'; 
        div.style.zIndex='100';
        div.style.width= w + 'px';
        if (mainDiv.popupAlign == 'right' ) { 
            div.style.left= (parseInt(xpos) - parseInt(w)) + (parseInt(mainDiv.clientWidth) +5);
            if (mainDiv.height) {
              div.style.top= parseInt(ypos) + parseInt(mainDiv.height);
            }
            else 
              div.style.top= parseInt(ypos) + parseInt(mainDiv.clientHeight);
        }

        var h = div.clientHeight;
        if (parseInt(h) > 300) {
            overflowDiv.style.height = '300px';
        }
    },

    checkDDAjax: function(mainDivID) {
        var selDiv = document.getElementById('sel-div-' + mainDivID);
        var bodyDiv = document.getElementById('body-div-' + mainDivID);
        if (bodyDiv.innerHTML && bodyDiv.innerHTML != '') {
            SimpleDropdown.showDropdown(mainDivID);
            hideDiv('ajax-div-' + mainDivID);
            return;
        } else {
        setTimeout('SimpleDropdown.checkDDAjax(\'' + mainDivID + '\');',1000);
        }
    }
};


function insertAtCaret(obj, text) {
	if(document.selection) {
		obj.focus();
		var orig = obj.value.replace(/\r\n/g, "\n");
		var range = document.selection.createRange();

		if(range.parentElement() != obj) {
			return false;
		}

		range.text = text;
		
		var actual = tmp = obj.value.replace(/\r\n/g, "\n");

		for(var diff = 0; diff < orig.length; diff++) {
			if(orig.charAt(diff) != actual.charAt(diff)) break;
		}

		for(var index = 0, start = 0; 
			tmp.match(text) 
				&& (tmp = tmp.replace(text, "")) 
				&& index <= diff; 
			index = start + text.length
		) {
			start = actual.indexOf(text, index);
		}
	} else if(obj.selectionStart != undefined) {
		var start = obj.selectionStart;
		var end   = obj.selectionEnd;

		obj.value = obj.value.substr(0, start) 
			+ text 
			+ obj.value.substr(end, obj.value.length);
        if(start != null) {
            setCaretTo(obj, start + text.length);
        } else {
            obj.value += text;
        }
	}

}

function setCaretTo(obj, pos) {
	obj.focus();
	obj.setSelectionRange(pos, pos);
}



var popupManager = {};

// Library constants

popupManager.constants = {
  'darkCover' : 'popupManager_darkCover_div',
  'darkCoverStyle' : ['position:absolute;',
                      'top:0px;',
                      'left:0px;',
                      'padding-right:0px;',
                      'padding-bottom:0px;',
                      'background-color:#000000;',
                      'opacity:0.5;', //standard-compliant browsers
                      '-moz-opacity:0.5;',           // old Mozilla 
                      'filter:alpha(opacity=0.5);',  // IE
                      'z-index:10000;',
                      'width:100%;',
                      'height:100%;'
                      ].join(''),
  'openidSpec' : {
     'identifier_select' : 'http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select',
     'namespace2' : 'http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0'
  } };

// Computes the size of the window contents. Returns a pair of
// coordinates [width, height] which can be [0, 0] if it was not possible
// to compute the values.
popupManager.getWindowInnerSize = function() {
  var width = 0;
  var height = 0;
  var elem = null;
  if ('innerWidth' in window) {
    // For non-IE
    width = window.innerWidth;
    height = window.innerHeight;
  } else {
    // For IE,
    if (('BackCompat' === window.document.compatMode)
        && ('body' in window.document)) {
        elem = window.document.body;
    } else if ('documentElement' in window.document) {
      elem = window.document.documentElement;
    }
    if (elem !== null) {
      width = elem.offsetWidth;
      height = elem.offsetHeight;
    }
  }
  return [width, height];
};

// Computes the coordinates of the parent window.
// Gets the coordinates of the parent frame
popupManager.getParentCoords = function() {
  var width = 0;
  var height = 0;
  if ('screenLeft' in window) {
    // IE-compatible variants
    width = window.screenLeft;
    height = window.screenTop;
  } else if ('screenX' in window) {
    // Firefox-compatible
    width = window.screenX;
    height = window.screenY;
  }
  return [width, height];
};

// Computes the coordinates of the new window, so as to center it
// over the parent frame
popupManager.getCenteredCoords = function(width, height) {
   var parentSize = this.getWindowInnerSize();
   var parentPos = this.getParentCoords();
   var xPos = parentPos[0] +
       Math.max(0, Math.floor((parentSize[0] - width) / 2));
   var yPos = parentPos[1] +
       Math.max(0, Math.floor((parentSize[1] - height) / 2));
   return [xPos, yPos];
};

//  A utility class, implements an onOpenHandler that darkens the screen
//  by overlaying it with a semi-transparent black layer. To use, ensure that
//  no screen element has a z-index at or above 10000.
//  This layer will be suppressed automatically after the screen closes.
//
//  Note: If you want to perform other operations before opening the popup, but
//  also would like the screen to darken, you can define a custom handler
//  as such:
//  var myOnOpenHandler = function(inputs) {
//    .. do something
//    popupManager.darkenScreen();
//    .. something else
//  };
//  Then you pass myOnOpenHandler as input to the opener, as in:
//  var openidParams = {};
//  openidParams.onOpenHandler = myOnOpenHandler;
//  ... other customizations
//  var myOpener = popupManager.createOpener(openidParams);
popupManager.darkenScreen = function() {
  var darkCover = window.document.getElementById(window.popupManager.constants['darkCover']);
  if (!darkCover) {
    darkCover = window.document.createElement('div');
    darkCover['id'] = window.popupManager.constants['darkCover'];
    darkCover.setAttribute('style', window.popupManager.constants['darkCoverStyle']);
    window.document.body.appendChild(darkCover);
  }
  darkCover.style.visibility = 'visible';
};

//  Returns a an object that can open a popup window customized for an OP & RP.
//  to use you call var opener = popupManager.cretePopupOpener(openidParams);
//  and then you can assign the 'onclick' handler of a button to
//  opener.popup(width, height), where width and height are the values of the popup size;
//
//  To use it, you would typically have code such as:
//  var myLoginCheckFunction = ...  some AJAXy call or page refresh operation
//  that will cause the user to see the logged-in experience in the current page.
//  var openidParams = { realm : 'openid.realm', returnToUrl : 'openid.return_to',
//  opEndpoint : 'openid.op_endpoint', onCloseHandler : myLoginCheckFunction,
//  shouldEncodeUrls : 'true' (default) or 'false', extensions : myOpenIDExtensions };
//
//  Here extensions include any OpenID extensions that you support. For instance,
//  if you support Attribute Exchange v.1.0, you can say:
//  (Example for attribute exchange request for email and name,
//  assuming that shouldEncodeUrls = 'true':)
//  var myOpenIDExtensions = {
//      'openid.ax.ns' : 'http://openid.net/srv/ax/1.0',
//      'openid.ax.type.email' : 'http://axschema.org/contact/email',
//      'openid.ax.type.name1' : 'http://axschema.org/namePerson/first',
//      'openid.ax.type.name2' : 'http://axschema.org/namePerson/last',
//      'openid.ax.required' : 'email,name1,name2' };
//  Note that the 'ui' namespace is reserved by this library for the OpenID
//  UI extension, and that the mode 'popup' is automatically applied.
//  If you wish to make use of the 'language' feature of the OpenID UI extension
//  simply add the following entry (example assumes the language requested
//  is Swiss French:
//  var my OpenIDExtensions = {
//    ... // other extension parameters
//    'openid.ui.language' : 'fr_CH',
//    ... };
popupManager.createPopupOpener = (function(openidParams) {
  var interval_ = null;
  var popupWindow_ = null;
  var that = this;
  var shouldEscape_ = ('shouldEncodeUrls' in openidParams) ? openidParams.shouldEncodeUrls : true;
  var encodeIfRequested_ = function(url) {
    return (shouldEscape_ ? encodeURIComponent(url) : url);
  };
  var identifier_ = ('identifier' in openidParams) ? encodeIfRequested_(openidParams.identifier) :
      this.constants.openidSpec.identifier_select;
  var identity_ = ('identity' in openidParams) ? encodeIfRequested_(openidParams.identity) :
      this.constants.openidSpec.identifier_select;
  var openidNs_ = ('namespace' in openidParams) ? encodeIfRequested_(openidParams.namespace) :
      this.constants.openidSpec.namespace2;
  var onOpenHandler_ = (('onOpenHandler' in openidParams) &&
      ('function' === typeof(openidParams.onOpenHandler))) ?
          openidParams.onOpenHandler : this.darkenScreen;
  var onCloseHandler_ = (('onCloseHandler' in openidParams) &&
      ('function' === typeof(openidParams.onCloseHandler))) ?
          openidParams.onCloseHandler : null;
  var returnToUrl_ = ('returnToUrl' in openidParams) ? openidParams.returnToUrl : null;
  var realm_ = ('realm' in openidParams) ? openidParams.realm : null;
  var endpoint_ = ('opEndpoint' in openidParams) ? openidParams.opEndpoint : null;
  var extensions_ = ('extensions' in openidParams) ? openidParams.extensions : null;

  // processes key value pairs, escaping any input;
  var keyValueConcat_ = function(keyValuePairs) {
    var result = "";
    for (key in keyValuePairs) {
      result += ['&', key, '=', encodeIfRequested_(keyValuePairs[key])].join('');
    }
    return result;
  };

  //Assembles the OpenID request from customizable parameters
  var buildUrlToOpen_ = function() {
    var connector = '&';
    var encodedUrl = null;
    var urlToOpen = null;
    if ((null === endpoint_) || (null === returnToUrl_)) {
      return;
    }
    if (endpoint_.indexOf('?') === -1) {
      connector = '?';
    }
    encodedUrl = encodeIfRequested_(returnToUrl_);
    urlToOpen = [ endpoint_, connector,
        'openid.ns=', openidNs_,
        '&openid.mode=checkid_setup',
        '&openid.claimed_id=', identifier_,
        '&openid.identity=', identity_,
        '&openid.return_to=', encodedUrl ].join('');
    if (realm_ !== null) {
      urlToOpen += "&openid.realm=" + encodeIfRequested_(realm_);
    }
    if (extensions_ !== null) {
      urlToOpen += keyValueConcat_(extensions_);
    }
    urlToOpen += '&openid.ns.ui=' + encodeURIComponent(
        'http://specs.openid.net/extensions/ui/1.0');
    urlToOpen += '&openid.ui.mode=popup';
    return urlToOpen;
  };

  // Tests that the popup window has closed
  var isPopupClosed_ = function() {
    return (!popupWindow_ || popupWindow_.closed);
  };

  // Check to perform at each execution of the timed loop. It also triggers
  // the action that follows the closing of the popup
  var waitForPopupClose_ = function() {
    if (isPopupClosed_()) {
      popupWindow_ = null;
      var darkCover = window.document.getElementById(window.popupManager.constants['darkCover']);
      if (darkCover) {
        darkCover.style.visibility = 'hidden';
      }
      if (onCloseHandler_ !== null) {
        onCloseHandler_();
      }
      if ((null !== interval_)) {
        window.clearInterval(interval_); //jquery 1.3
	window.clearTimeout(interval_);  //jquery 1.4
        interval_ = null;
      }
    }
  };

  return {
    // Function that opens the window.
    popup: function(width, height) {
      var urlToOpen = buildUrlToOpen_();
      if (onOpenHandler_ !== null) {
        onOpenHandler_();
      }
      var coordinates = that.getCenteredCoords(width, height);
      popupWindow_ = window.open(urlToOpen, "",
          "width=" + width + ",height=" + height +
          ",status=1,location=1,resizable=yes" +
          ",left=" + coordinates[0] +",top=" + coordinates[1]);
      interval_ = window.setInterval(waitForPopupClose_, 80);
      return true;
    }
  };
});



function scrollDivs(limit, idPrefix, offset) {
    var index=-1;
    for (i=0; i < limit; i++) {
        var div = document.getElementById(idPrefix + i);
        if (div) {
          if (div.style.display != 'none') {
              index = i;
          }
          div.style.display='none';
        }
    }

    var leftLast = 'false';
    var rightLast = 'false';
    if (offset > 0 && index >= (limit-2)) {
        index = limit - 2;  
        leftLast = 'true';
    } 
    if (offset < 0 && (index+offset)-1 < 0) {
        index = 1;
        rightLast = 'true';
    }

    var displayDiv = document.getElementById(idPrefix + (index+offset));
    displayDiv.style.display='';
    displayDiv.style.leftLast = leftLast; 
    displayDiv.style.rightLast = rightLast;    
    return displayDiv;
}

var Lst;

function CngClass(obj){
 if (typeof(obj)=='string') obj=document.getElementById(obj);
 if (Lst) Lst.className='navRow';
 obj.className='navRowCurrent';
 Lst=obj;
}


Carousel = {

    simpleCarousel: function (serease, moveDir) {
        Carousel.NextButton.style.display='';
        Carousel.BackButton.style.display='';

        Carousel.carousel(serease, moveDir, 10, Carousel.getCurrentDisplayIndex(serease));
    },
    carousel: function(serease, moveDir, opc,dispIndex) {
    
        var div = document.getElementById(serease + dispIndex);    
        var nextDiv = document.getElementById(serease + (dispIndex + moveDir));

        if (!div || ! nextDiv) {
            return;
        }    

        if (opc <= 0) {
            div.style.display="none";
            div.style.left='';
            setOpacity(nextDiv, 10);
            nextDiv = document.getElementById(serease + ((dispIndex + moveDir) + (1 * moveDir)));

            if (moveDir < 0 && !nextDiv) {
                Carousel.BackButton.style.display='none';
            }
            if (moveDir > 0 && !nextDiv) {
                Carousel.NextButton.style.display='none';
            }
            return;
        }

        var currPos = parseInt(getPos(div).left) + moveDir;
        div.style.left = parseInt(currPos) + (10 * moveDir);

        div.style.display='';
        setOpacity(div, opc);

        setOpacity(nextDiv, (10 - (opc-1)));
        nextDiv.style.display='';

        setTimeout("Carousel.carousel('" + serease + "', " + moveDir  + " , " + (opc-2)  + ", " + dispIndex + ");", 100);
    
    },
    getCurrentDisplayIndex: function (serease) {
        for (i=0; document.getElementById(serease + i); i++) {
            var ele = document.getElementById(serease + i);    
            if (ele.style.display != 'none') {
                return i;
            }
        }
        return 1;
    }

};

function setOpacity(ele, value) {
    ele.style.opacity = value/10;
    ele.style.filter = 'alpha(opacity=' + value*10 + ')';
}


function roll_over(img_name, img_src) {
   document[img_name].src = img_src;
}

function hideMessage(closeEle) {	
    closeEle = closeEle.parentNode;
    for (i=0;i < 3;i++) {
        if (closeEle.id == 'AlertMessage') {
            closeEle.style.display='none';
            break;
        }
        closeEle = closeEle.parentNode;
    }
}

CarouselII = {

    init:function() {
        var div = document.getElementById(CarouselII.contentDivID);
        CarouselII.iframeID = "iframe-" + CarouselII.contentDivID;
        CarouselII.currentBlockID = "currentBlock-" + CarouselII.contentDivID;
        CarouselII.width = (CarouselII.width ?  CarouselII.width : 500);
        CarouselII.height = (CarouselII.height ?  CarouselII.height : 300);
        CarouselII.iframeStyle = (CarouselII.iframeStyle ?  CarouselII.iframeStyle : "border:1px solid #ccc;");
        
        CarouselII.initMainTable();
        
        CarouselII.speed = (CarouselII.speed ? CarouselII.speed :30);
        CarouselII.pxMove= (CarouselII.pxMove ? CarouselII.pxMove : 10);

        CarouselII.stylesheets = (CarouselII.stylesheets ? CarouselII.stylesheets : 
                                  '<link rel="stylesheet" type="text/css" href="/stylesheets/sitestyle.css?version=5">' + '\n' +
                                  '<link rel="stylesheet" type="text/css" href="/stylesheets/common.css?version=5">');

        CarouselII.nextButtonID = (CarouselII.nextButtonID ? CarouselII.nextButtonID  : "nextButton-" + CarouselII.contentDivID);
        CarouselII.prevButtonID = (CarouselII.prevButtonID ? CarouselII.prevButtonID  : "prevButton-" + CarouselII.contentDivID);
        
        
        CarouselII.nextButtonOnclick =  (document.getElementById(CarouselII.nextButtonID) ? 
                                         document.getElementById(CarouselII.nextButtonID).onclick : null);
        CarouselII.prevButtonOnclick =  (document.getElementById(CarouselII.prevButtonID) ?
                                         document.getElementById(CarouselII.prevButtonID).onclick : null);
        
        CarouselII.disableButton(CarouselII.nextButtonID);

        var iframeID = CarouselII.iframeID;
        var iframe = document.getElementById(iframeID);
        if (!iframe) {
            var str = "<ht" + "ml><bo" + "dy style='margin:0px;padding:0px;'>" + 
                div.innerHTML +
                "</bo" + "dy>" + "</ht" + "ml>";
            div.innerHTML="<iframe style=\"width:" + CarouselII.width + "px;height:" + CarouselII.height + "px;" + 
                CarouselII.iframeStyle + "\" scrolling=\"no\" frameborder=\"0\" id=\"" + iframeID + "\"></iframe>";
            iframe = document.getElementById(iframeID);
            iframe.contentWindow.document.write((CarouselII.stylesheets ? CarouselII.stylesheets : "" ) + str);
        }

        var blockCounter = document.getElementById(CarouselII.currentBlockID);
        if (!blockCounter) {
            //blockCounter = addDiv(CarouselII.currentBlock);
            document.write("<div id='" + CarouselII.currentBlockID + "'>0</div>");
            blockCounter = document.getElementById(CarouselII.currentBlockID);
            blockCounter.style.display='none';
        }    

        CarouselII.mainDiv = document.getElementById(CarouselII.iframeID).contentWindow.document.getElementById(CarouselII.contentDivID + "-table");
        document.getElementById(this.iframeID).contentWindow.document.close();

    },
    
    initMainTable:function() {
        var div = document.getElementById(CarouselII.contentDivID);        
        var table = div.getElementsByTagName("table")[0];
        table.id = CarouselII.contentDivID + "-table";
        table.style.position="absolute";
        table.style.left=0;
        table.style.width=(table.rows[0].cells.length * CarouselII.width);
        for (i=0; i < table.rows[0].cells.length; i++) {
            table.rows[0].cells[i].style.width=CarouselII.width;
        }
    },

    moveHorizontal:function(dir) {
        CarouselII.enableButton(CarouselII.nextButtonID);
        CarouselII.enableButton(CarouselII.prevButtonID);

        var origPos = parseInt(getPos(CarouselII.mainDiv).left);  
        var blockSize = parseInt(CarouselII.mainDiv.clientWidth)/CarouselII.mainDiv.rows[0].cells.length;
        var blockCounter = document.getElementById(CarouselII.currentBlockID);  

        var currBlock = (blockCounter.innerHTML ? parseInt(blockCounter.innerHTML) : 0);

        CarouselII.moveHorizontal1(blockSize , origPos, CarouselII.mainDiv, 0, dir);

        if (dir > 0) {
            var ind = ((currBlock - dir) > 0 ? currBlock - dir : 0);
            if(ind <= 0) {
                CarouselII.disableButton(CarouselII.nextButtonID);
            }
            blockCounter.innerHTML = "" + ind;
        } 
 
        if (dir < 0) {
            var ind = (currBlock + (-1*dir));
            if(ind >= (CarouselII.mainDiv.rows[0].cells.length-1)) {
                CarouselII.disableButton(CarouselII.prevButtonID);
            }
            blockCounter.innerHTML = "" + ind;
        }

        if (CarouselII.postMoveExecute) {
            CarouselII.postMoveExecute();
        }
    },

    disableButton:function(buttonID) {
        var button =  document.getElementById(buttonID);
        if (button) {
            button.onclick=function(){};
            setOpacity(button, 5);
        }
    },

    enableButton:function(buttonID) {
        var button =  document.getElementById(buttonID);
        if (button) {
            button.onclick = (CarouselII.nextButtonID == buttonID ? 
                              CarouselII.nextButtonOnclick : CarouselII.prevButtonOnclick);
            setOpacity(button, 10);
        }
    },

    moveHorizontal1:function(leftPx, origPos, mainDiv, count, dir) {

        if (count >= leftPx) {
            mainDiv.style.left = (origPos + (leftPx * dir));
            return;
        }

        mainDiv.style.left = (origPos + (count * dir));

        var func = function() {
            CarouselII.moveHorizontal1(leftPx, origPos, mainDiv, count + CarouselII.pxMove, dir);
        };
        setTimeout(func, CarouselII.speed);
    },

    executeLoop:function(count) {
        if (count >= (CarouselII.mainDiv.rows[0].cells.length-1)) {
            CarouselII.stopLoop = true;  
            CarouselII.resetLoop(count);
            count = 1;
        }   
  
        if (!CarouselII.stopLoop) {
            CarouselII.moveHorizontal(-1);  
            var func = function() { CarouselII.executeLoop(count + 1);};
            setTimeout(func, 8000);
        }
    },

    resetLoop:function(count) {

        if (count == 0) {    
            CarouselII.stopLoop = false;  
            var func = function () {  CarouselII.pxMove = 10; CarouselII.executeLoop(0); };
            CarouselII.mainDiv.style.left=0;
            setTimeout(func, 8000);
            return;
        }

        CarouselII.pxMove = CarouselII.pxMove + 100;
        CarouselII.moveHorizontal(1);    
        var func = function() {CarouselII.resetLoop(count-1);};
        setTimeout(func, 200);
    }

};


function CountDown () {

    this.initLook = function() {
        this.tableID = this.divID + "-table";
        this.bgDivID = this.divID + "-bg";
        this.mainDivID = this.divID + "-main";
        var div = document.getElementById(this.divID);
        div.innerHTML = '<div id="' + this.bgDivID + '" style="background:#000;-moz-border-radius:10px;' + 
        'border-radius:10px;border:1px solid #ccc;height:90px;opacity:.30;" ></div>' +
        '<div id="' + this.mainDivID  + '" style="height:90px;position:absolute;margin-top:-87px;" align="center">' +
        '<table style="font-size:44px;font-family:arial;font-weight:bold;color:#fff;" id="' + this.tableID + '" >' +
        '<tr >' +
        //'  <td>00 :</td>' +
        '  <td>00 :</td>' +
        '  <td>00 :</td>' +
        '  <td>00</td>' +
        '</tr>' +
        '<tr style="font-size:12px;">' +
        //'  <td style="padding-left:5px;">Days</td>' +
        '  <td style="padding-left:5px;">Hours</td>' +
        '  <td style="padding-left:5px;">Mins</td>' +
        '  <td style="padding-left:5px;">Secs</td>' +
        '</tr>' +
        '</table>' +
        '</div>';
        var backgroundDiv = document.getElementById(this.bgDivID);
        var mainDiv = document.getElementById(this.mainDivID);
        var table = document.getElementById(this.tableID);

        backgroundDiv.style.width = table.clientWidth + 10;
        mainDiv.style.width = backgroundDiv.style.width;
        var i=0;
        //this.dayDiv = table.rows[0].cells[i++];
        this.hourDiv = table.rows[0].cells[i++];
        this.minDiv = table.rows[0].cells[i++];
        this.secDiv = table.rows[0].cells[i++];
    };


    this.countDown = function(t) {
        var i = 0;

        if (t >= 0) {
            this.setTimeDisplay(this.getTimeStr(t));
            var tmpcd = this;
            var func = function () {
                tmpcd.countDown((t-1000));
            };
            if (this.oncountdown) {
                this.oncountdown(t);
            }
            setTimeout(func, 1000);
        } else {    
            this.setTimeDisplay("00:00:00:00");
            if (this.onfinish) {
                this.onfinish();
            }
        }
    };

    this.getTimeStr = function(ms) {
        ms = ms / 1000;
        var d = Math.floor(ms / 86400);
        var h = Math.floor(ms / 3600) - (d * 24); 
        var m = Math.floor(ms / 60) - (( d > 0 && h == 0 ? 24 : h) * 60); 
        var s = ms - (d * 86400) - (h * 3600) - (m * 60);  
        return (d >= 10 ? d : "0" + d) + ":" + (h >= 10 ? h : "0" + h) + ":" + (m >= 10 ? m : "0" + m) + ":" + (s >= 10 ? s : "0" + s);
    };

    this.setTimeDisplay = function(str) {
        if (this.dayDiv) {
            this.dayDiv.innerHTML = str.split(":")[0] + " :";
        }
        if (this.hourDiv) {
            this.hourDiv.innerHTML = str.split(":")[1]  + " :";
        }
        if (this.minDiv) {
            this.minDiv.innerHTML = str.split(":")[2] + " :";
        }
        if (this.secDiv) {
            this.secDiv.innerHTML = str.split(":")[3];
        }
    };
};


function Slider() {

    this.move = function(e, dx, x){

        var clientX = this.getClientX(e);
        var i = (clientX - this.ORIGINAL_LEFT) - (x-dx);
        var sliderWidth = (this.SLIDE_ELEMENT.clientWidth / 2);
        var slideDiv = (i > -sliderWidth  && i < (this.WIDTH - sliderWidth));

        if (slideDiv) {
            this.SLIDE_ELEMENT.style.marginLeft = i + "px";
            this.printLabel();
            if (this.onmovehook) {
                this.onmovehook();
            }
            return;
        }
  
    };

    this.initMove = function (div, ary) {
 
        this.SLIDE_ELEMENT = div;
        this.POINTS = ary;
        this.POSITION=0;
        this.WIDTH = parseInt(this.SLIDE_ELEMENT.parentNode.clientWidth);
        this.ORIGINAL_LEFT = getPos(this.SLIDE_ELEMENT.parentNode).left;
	
        var obj = this;
        document.onmousedown = function(e) {
	    var clientX = obj.getClientX(e);
	    var clientY = obj.getClientY(e);
	    var pos = getPos(obj.SLIDE_ELEMENT);

	    var heightRange = pos.top + obj.SLIDE_ELEMENT.clientHeight;
	    var widthRange = pos.left + obj.SLIDE_ELEMENT.clientWidth;
	    if (clientX > pos.left && clientX < widthRange &&
		clientY > pos.top && clientY < heightRange) {
		obj.startdrag(e);
	    } 	    
        };
    };

    this.printLabel = function () {
        var dx =  (parseInt(this.SLIDE_ELEMENT.style.marginLeft) ? parseInt(this.SLIDE_ELEMENT.style.marginLeft) : 0) + 48;
        var unitWidth = (this.WIDTH / this.POINTS.length) > 0 ? (this.WIDTH / this.POINTS.length) : 1;
        var currentUnit = (parseInt(dx / unitWidth) ? parseInt(dx / unitWidth) : 0);
        var sliderWidth = ((this.SLIDE_ELEMENT.clientWidth / 4)-5);
        this.POSITION = currentUnit;
        this.SLIDE_ELEMENT.innerHTML = "<div align='center' class='QuestionText' style='background:#fff;position:absolute;width:90px;" +
                "margin-top:35px;margin-left:" + sliderWidth / 4 + ";" +
                "border:1px solid #ccc;font-weight:bold;cursor:pointer;cursor:hand;'>" + this.POINTS[currentUnit] + "</div>";

        if(this.onfinish) {
            this.onfinish();
        }
    };

    this.getClientX = function(e) {
        e = (!e ? event : e);
        return parseInt((e.pageX ? e.pageX : e.clientX));
    };

    this.getClientY = function(e) {
        e = (!e ? event : e);
        return parseInt((e.pageY ? e.pageY : e.clientY));
    };

    this.startdrag = function (e) {

        var x = this.getClientX(e);
        //var dx = parseInt(this.SLIDE_ELEMENT.style.left+0);
        var dx = this.ORIGINAL_LEFT + (parseInt(this.SLIDE_ELEMENT.style.marginLeft)  ? parseInt(this.SLIDE_ELEMENT.style.marginLeft)  : 0) ;
        var obj = this;

        document.onmousemove = function(e) {
            obj.move(e,dx,x);
        };  
  
        document.onmouseup = function(e) {    
            return obj.stopdrag();
        };

    };

    this.stopdrag = function(div) {
        document.onmousemove = null;
        this.shiftFocus();
        if (this.stopdraghook) {
            this.stopdraghook();
        }
        return false;
    };

    this.shiftFocus = function () {
        var dummyDiv = document.forms[0];
        if (dummyDiv) {
          dummyDiv.focus();
        }
    };


    this.printInfo = function(str) {
        document.getElementById('SurveyAjaxReceiver').innerHTML = str;
    };

}


function slideOpenElement(id, count, dir) {
    slideOpenElement(id, count,dir,0);
}

function slideOpenElement(id,count, dir, moveDir) {
    var ele = document.getElementById(id);
    if (!ele.style.top) {
        ele.style.top = getPos(ele).top;
    }
    if (dir > 0) {
        document.getElementById(id).style.display='';
    }
    var tmpHeight = parseInt(ele.clientHeight);
    ele.style.height="";
    var eleHeight = parseInt(ele.clientHeight) + 10;
    ele.style.height=tmpHeight;

    ele.style.overflow='hidden';
    var top = parseInt(ele.style.top);
   
    slideOpenElementII(id, count,dir, top, eleHeight, moveDir);
}


function slideOpenElementII(id,count, dir, origTop, origHeight, moveDiv) {
    var ele = document.getElementById(id);
    var eleHeight = parseInt(ele.clientHeight);

    if (count >= origHeight) {
        ele.style.height = (dir > 0 ? origHeight : 0);
        ele.style.display = (parseInt(ele.style.height) == 0 ? 'none' : '');
        return;
    }   

    if (moveDiv < 0) {
        ele.style.top = (origTop - count);
    } else if (moveDiv > 0) {
        ele.style.top = origTop + count;
    }

    ele.style.height = ( (dir < 0 ? origHeight : 0) + (count*dir)); 
   
    var func = function () {
        slideOpenElementII(id, (count + 20), dir, origTop, origHeight, moveDiv);
    };   
    setTimeout(func, 30);  
}


function slideOpenElementUp(id,count) {
    document.getElementById(id).style.display='';
    slideOpenElement(id, count, 1, -1);
}

function slideCloseElementDown(id,count) {
    slideOpenElement(id, count, -1, 1);
}

function highlightDefaultSelect(rows) {
    for (i=0; i < rows.length;i++) {
        var ele = rows[i];
        var cid=ele.id.split('_')[1];
        var checkbox = document.getElementById(cid + 'ID');
        if (checkbox.checked) { 
            checkbox.onclick();
        } 
    }
}

function printCurrentYear() {
    var date = new Date();
    document.write(date.getFullYear());
}

function recordTubePulse(params) {
    var inputBox = params['inputBox'];
    var str = inputBox.value;
    var playerObj = params['playerObj'];

    var ratingVal = getCheckedValue(params['ratingObj']);

    str = ("" == str ? "{duration:\"" + playerObj.getDuration() + "\", ratingMap:["  : str + ",");
    str = str.replace(/\]}/gi, '');   
    str +=  "{\"seconds\":\"" + params['seconds'] + "\""  + ",\"rating\":\"" + ratingVal + "\"}]}";
    inputBox.value = str;
    var ary = eval("(" + str + ")");
}


function printTubePulseDebug(debugDivID) {
    var qid = debugDivID.split("_")[1];
    var inputBox = document.getElementById('p_' + qid + '_json');
    var ary = eval("(" + inputBox.value + ")");
    var s = "<table class=\"AnswerText SurveyTableGrid\"><tr><td><b>Seconds</b></td><td><b>Rating</b></td></tr>";
    for (i=ary.ratingMap.length-1; i >= 0;i--) {
        s += "<tr><td align=\"center\">" + ary.ratingMap[i].seconds +  "</td><td align=\"center\">" + ary.ratingMap[i].rating + "</td></tr>";
    }
    s += "</table>";
    document.getElementById(debugDivID).innerHTML=s;
}

function getCheckedValue(ratingObj) {
    for (i=0; i < ratingObj.length;i++) {
        if (ratingObj[i].checked) {
            return ratingObj[i].value;
        }
    }
    return -1;
}

/**
var sagscroller_constants={
    navpanel: {height:'16px', downarrow:'down.gif', opacity:0.6, background:'black'},
    loadingimg: {src:'ajaxloading.gif', dimensions:[100,15]}
}

function sagscroller(options){
    this.setting={mode:'manual', inittype:'stunted', pause:3000, animatespeed:500, ajaxsource:null, rssdata:null, refreshsecs:0, navpanel:{show:true, cancelauto:false}} //default settings
    jQuery.extend(this.setting, options) //merge default settings with options
    options=null
    this.curmsg=0
    var slider=this
    jQuery(function($){ //on document.ready
        var data = document.getElementById('mysagscroller').innerHTML
        slider.$slider=$('#'+slider.setting.id)
        if (slider.setting.inittype=="onload") { //load scroller when page has completely loaded?
                $(window).load(function(){slider.init($)})
        } else {//load scroller immediately and get dimensions progressively instead
                slider.init($)
        }
        $("#mysagscroller").mouseenter(function() {
            slider.stopscroll();
        });
         $("#mysagscroller").mouseleave(function() {
            slider.reloadul(data)
        });
    })
}

sagscroller.prototype={

    addnavpanel:function(){
        var slider=this, setting=this.setting
        var $navpanel=$('<div class="sliderdesc"><div class="sliderdescbg"></div><div class="sliderdescfg"><div class="sliderdesctext"></div></div></div>')
                .css({position:'absolute', width:'100%', left:0, top:-1000, zIndex:'1001'})
                .find('div').css({position:'absolute', left:0, top:0, width:'100%'})
                .eq(0).css({background:sagscroller_constants.navpanel.background, opacity:sagscroller_constants.navpanel.opacity}).end() //"sliderdescbg" div
                .eq(1).css({color:'white'}).end() //"sliderdescfg" div
                .appendTo(this.$slider)
        $navpanel.css({top:this.$slider.height()-parseInt(sagscroller_constants.navpanel.height), height:sagscroller_constants.navpanel.height}).find('div').css({height:'100%'})
    },

    resetuls:function(){ //function to swap between primary and secondary ul
        var $tempul=this.$mainul
        this.$mainul=this.$secul.css({zIndex:1000})
        this.$secul=$tempul.css({zIndex:999})
        this.$secul.css('top', this.ulheight)
    },

    reloadul:function(newhtml){ //function to empty out SAG scroller UL contents then reload with new contents
        this.$slider.find('ul').remove()
    navpanel: {height:'16px', downarrow:'down.gif', opacity:0.6, background:'black'},
    loadingimg: {src:'ajaxloading.gif', dimensions:[100,15]}
}

function sagscroller(options){
    this.setting={mode:'manual', inittype:'stunted', pause:3000, animatespeed:500, ajaxsource:null, rssdata:null, refreshsecs:0, navpanel:{show:true, cancelauto:false}} //default settings
    jQuery.extend(this.setting, options) //merge default settings with options
    options=null
    this.curmsg=0
    var slider=this
    jQuery(function($){ //on document.ready
        var data = document.getElementById('mysagscroller').innerHTML
        slider.$slider=$('#'+slider.setting.id)
        if (slider.setting.inittype=="onload") { //load scroller when page has completely loaded?
                $(window).load(function(){slider.init($)})
        } else {//load scroller immediately and get dimensions progressively instead
                slider.init($)
        }
        $("#mysagscroller").mouseenter(function() {
            slider.stopscroll();
        });
         $("#mysagscroller").mouseleave(function() {
            slider.reloadul(data)
        });
    })
}



sagscroller.prototype={

    addnavpanel:function(){
        var slider=this, setting=this.setting
        var $navpanel=$('<div class="sliderdesc"><div class="sliderdescbg"></div><div class="sliderdescfg"><div class="sliderdesctext"></div></div></div>')
                .css({position:'absolute', width:'100%', left:0, top:-1000, zIndex:'1001'})
                .find('div').css({position:'absolute', left:0, top:0, width:'100%'})
                .eq(0).css({background:sagscroller_constants.navpanel.background, opacity:sagscroller_constants.navpanel.opacity}).end() //"sliderdescbg" div
                .eq(1).css({color:'white'}).end() //"sliderdescfg" div
                .appendTo(this.$slider)
        $navpanel.css({top:this.$slider.height()-parseInt(sagscroller_constants.navpanel.height), height:sagscroller_constants.navpanel.height}).find('div').css({height:'100%'})
    },

    resetuls:function(){ //function to swap between primary and secondary ul
        var $tempul=this.$mainul
        this.$mainul=this.$secul.css({zIndex:1000})
        this.$secul=$tempul.css({zIndex:999})
        this.$secul.css('top', this.ulheight)
    },

    reloadul:function(newhtml){ //function to empty out SAG scroller UL contents then reload with new contents
        this.$slider.find('ul').remove()
        this.ulheight=null
        this.curmsg=0;
        this.$slider.append(newhtml)
        this.init($)		
    },

    setgetoffset:function($li){
        var recaldimensions=(this.setting.ajaxsource || this.setting.rssdata) && this.setting.inittype=="onload" //bool to see if script should always refetch dimensions
        if (this.curmsg==this.$lis.length)
                return (!this.ulheight || recaldimensions)? this.ulheight=this.$mainul.height() : this.ulheight
        else{
                if (!$li.data('toppos') || recaldimensions)
                        $li.data('toppos', $li.position().top)
                return $li.data('toppos')
        }
    },

    scrollmsg:function(repeat){
        var slider=this, setting=this.setting
        var ulheight=this.ulheight || this.$mainul.height()
        var endpoint=-this.setgetoffset(this.$lis.eq(this.curmsg))
        this.$mainul.animate({top: endpoint}, setting.animatespeed, function(){
                slider.curmsg=(slider.curmsg<slider.$lis.length+1)? slider.curmsg+1 : 0
                if (slider.curmsg==slider.$lis.length+1){ //if at end of UL
                        slider.resetuls() //swap between main and sec UL
                        slider.curmsg=1
                }
                if (repeat)
                        slider.scrolltimer=setTimeout(function(){slider.scrollmsg(repeat)}, setting.pause)
        })
        var secendpoint=endpoint+ulheight
        this.$secul.animate({top: secendpoint}, setting.animatespeed)
    },

    stopscroll:function(){
        if (this.$mainul){
                this.$mainul.add(this.$secul).stop(true, false)
                clearTimeout(this.scrolltimer)
        }
    },

    init:function($){
        var setting=this.setting
        this.$mainul=this.$slider.find('ul:eq(0)').css({zIndex:1000})
        this.$lis=this.$mainul.find('li')
        if (setting.navpanel.show)
                this.addnavpanel()
        this.$secul=this.$mainul.clone().css({top:this.$mainul.height(), zIndex:999}).appendTo(this.$slider) //create sec UL and add it to the end of main UL
        this.scrollmsg(setting.mode=="auto")
    }
}


**/

function seekVid(seconds, vidID) {
    var ytplayer = document.getElementById(vidID);
    ytplayer.seekTo(seconds, true);
}

function initVid(myplayer,ytplayer, vidID) {
    var params = { allowScriptAccess : 'always' };
    var atts = { id : myplayer};
    swfobject.embedSWF('http://www.youtube.com/apiplayer?enablejsapi=1&version=3', ytplayer, '425', '344', '8', null, null, params, atts);
    var func = document.ytvideofunc;
    document.ytvideofunc = function(){loadVid(myplayer,vidID);if (func) {func();}};
}

function loadVid(myplayer,vidID) {
    var ytplayer = document.getElementById(myplayer);
    ytplayer.loadVideoById(vidID);
    ytplayer.playVideo();
    var func = function() {ytplayer.pauseVideo()};
    setTimeout(func,1000); 
}


function fadeInDiv(div_id, speed) {
    $('#'+div_id).fadeIn(speed, function () {
    });   
}

function fadeOutDiv(div_id, speed) {
    $('#'+div_id).fadeOut(speed, function () {
    });
}

function getDDSelectedValue(eleID) {
    var sel = document.getElementById(eleID);
    return sel.options[sel.selectedIndex].value;
}


function playVid(vidID) {
    var ytplayer = document.getElementById(vidID);
    ytplayer.playVideo();
}

function pauseVid(vidID) {
    var ytplayer = document.getElementById(vidID);
    ytplayer.pauseVideo();
}

function seekVidRelative(seconds, vidID) {
    var ytplayer = document.getElementById(vidID);
    ytplayer.seekTo((ytplayer.getCurrentTime() + seconds), true);
}

function toggleVid(vidID) {
    var ytplayer = document.getElementById(vidID);
    if (ytplayer.getPlayerState() == 1) {
	ytplayer.pauseVideo();
    } else {
	ytplayer.playVideo();
    }
}

function renderCaptcha(params) {
    document.write("<div id=\"recaptcha_area\" style=\"display:none;\"></div>" +
		   "<div id=\"custom_captcha_image\"></div>" +
		   "<iframe id=\"recaptcha_iframe\" src=\"" + params.appPath + "jsp/includes/captcha.jsp\" " + 
		   "frameborder=\"0\" scrolling=\"no\" style=\"width:300px;height:200px;\" ></iframe>");
}

function populateRecaptchaFields(params) {
    var iframe = document.getElementById(params.iframeID);
    var innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
    var fieldArea = document.getElementById(params.fieldArea);
    fieldArea.innerHTML = innerDoc.getElementById("recaptcha_area").innerHTML;
}



function playHelpVid(params) {
    var div = document.getElementById(params.divID);
    var width = params.width ? params.width : "640";
    var height = params.height ? params.height : "400";
    div.style.height = parseInt(height) + 30 + "px"
    div.innerHTML = "<div id=\"closeDiv_" + div.id + "\" style=\"background-color: transparent;float:right;padding:2px;cursor:pointer;\"><img src=\"/images/close.png\"></div>" +
        "<div id=\"containerDiv_" + div.id + "\" style=\"background-color: transparent;padding:15px;height:"+height+"px\">" +
        "<object type=\"application/x-shockwave-flash\" data=\"/images/FlowPlayerDark.swf\" id=\"FlowPlayerObj\" " +
        "width=\"" + width + "\" height=\"" + height + "\">" +
        "<param name=\"allowScriptAccess\" value=\"always\"/>" +
        "<param name=\"movie\" value=\"/images/FlowPlayerDark.swf\"/>" +
        "<param name=\"quality\" value=\"high\"/>" +
        "<param name=\"scale\" value=\"noScale\"/>" +
        "<param name=\"wmode\" value=\"transparent\"/>" +
        "<param name=\"flashvars\" value=\"config={ autoPlay:true,loop:false,bufferLength:1," +
        "playList:[{overlayId: 'play'}, { name: 'Help Video', url:'" + params.url + "'}], showMenu:false,showLoopButton:false}\"/>" +
        "<embed id=\"FlowPlayer\" wmode=\"transparent\" src=\"/images/FlowPlayerDark.swf\" " +
        "type=\"application/x-shockwave-flash\" width=\""  + width + "\" height=\""  + height + "\" "+
        "flashvars=\"config={ autoPlay:true,loop:false,bufferLength:1,playList:[{overlayId: 'play'}, { name: 'Help Video', url:'" + params.url + "'}], showMenu:false,showLoopButton:false}\" " +
        " ></embed>" +
        "</object>"
        "</div>";

    $("#" + div.id).slideToggle(1000, function() {
        $("#containerDiv_" + div.id).fadeIn('fast');    // fade in of content happens after slidedown
        if($(this).is(":hidden")) {
            $("#containerDiv_" + div.id).html("");
        }
    });

    $("#closeDiv_" + div.id).click(function(){
        $("#containerDiv_" + div.id).fadeOut('fast');
        $("#" + div.id).slideUp(1000);
        $("#containerDiv_" + div.id).html("");
    });
}


function playYoutube(params) {
    var div = document.getElementById(params.divID);
    var width = params.width ? params.width : "640";
    var height = params.height ? params.height : "400";
    div.style.height = parseInt(height) + 30 + "px"
    div.innerHTML = "<div id=\"closeDiv_" + div.id + "\" style=\"background-color: transparent;float:right;padding:2px;cursor:pointer;\"><img src=\"/images/close.png\"></div>" +
        "<div id=\"containerDiv_" + div.id + "\" style=\"background-color: transparent;padding:15px;height:"+height+"px\">" +
        "<iframe width=" + width + " height=" + height + " src=" + params.url + " frameborder=\"0\"></iframe>"+
        "</div>";

    $("#" + div.id).slideToggle(1000, function() {
        $("#containerDiv_" + div.id).fadeIn('fast');    // fade in of content happens after slidedown
        if($(this).is(":hidden")) {
            $("#containerDiv_" + div.id).html("");
        }
    });

    $("#closeDiv_" + div.id).click(function(){
        $("#containerDiv_" + div.id).fadeOut('fast');
        $("#" + div.id).slideUp(1000);
        $("#containerDiv_" + div.id).html("");
    });
}

function addWysiwyg(elementID) {
    new nicEditor({fullPanel : true}).panelInstance(elementID);
}


function addQWizardWysiwyg(elementID) {
    var func = function() {
        var txtarea = document.getElementById(elementID);
        var val = nicEditors.findEditor(elementID).getContent();
        txtarea.value = qWizardWysiwygFormatForSubmission(val);
    };

    var myNic = new nicEditor({fullPanel : true}).panelInstance(elementID).addEvent('blur',func);
    var txt = document.getElementById(elementID).value;
    var re = new RegExp("<br(.*?)>", "gi");
    txt = txt.replace(re, "<br id=\"userbr\">");

    re = new RegExp("(\r)?\n", "gi");
    txt = txt.replace(re, "<br>");

    txt = "<div id=\"wizopts\">" + txt + "</div>";
    setWysiwygContent(elementID, txt);
}

function dropWysiwyg(editor, elementID) {
    editor.removeInstance(elementID);
    editor = null;
}

function putWysiwygContent(wysiwyg, elementID) {
    if (wysiwyg) {
        document.getElementById(elementID).value = nicEditors.findEditor(wysiwyg).getContent();
    }
}

function setWysiwygContent(wysiwyg, text) {
    nicEditors.findEditor(wysiwyg).setContent(text);
}

function qWizardWysiwygFormatForSubmission(txt) {
    var re = new RegExp("<br( style(.*?))?>", "gi");
    txt = txt.replace(re, "\r\n");
    re = new RegExp("<div id=\"wizopts\">", "gi");
    txt = txt.replace(re, "");
    re = new RegExp("</div>[ ]*$", "gi");
    txt = txt.replace(re, "");
    return txt;
}


function getQWidthSliderIndex ($peg) {
    $div = $('#' + $peg.attr('track'));
    $pos = $peg.position().left;
    var ary = eval($peg.attr('ansarray'));
    $label = $('#' + $peg.attr('label'));
    
    $totalWidth = $div.width()- parseInt($peg.attr("totalWidthOffset"));
    var steps = $totalWidth / ary.length;
    var index = ary.length-1;
    for (var i=0; i < ary.length;i++) {
	range = ((i+1) * steps);
	if ($pos < range) {
	    index = i;
	    break;
	}
    }
    index = (index >= ary.length ? ary.length-1 : index);
    return index;
}



function qWidthDragSetup(params) {

    var printLabel = function(e) {
        $peg = $(this);
        var ary = eval($peg.attr('ansarray'));
	$label = $('#' + $peg.attr('label'));	
        index = getQWidthSliderIndex($peg);
        $label.html(ary[index] + "%");
        $label.css('marginLeft', parseInt($peg.attr("labelMarginLeft")));	
        $("#" + $peg.attr('widthCtrlID')).css("width" , ary[index] + "%");

        $row = $("#" + $peg.attr('widthCtrlID')).parent();
        var tds = $row.find("td");
        var remaining = 100 - (parseInt(ary[index]));
        var intervals = remaining / (tds.length-1);
        for (i=1; i < tds.length; i++) {
            td = tds[i];
            if (td.id != $peg.attr('widthCtrlID')) {
                td.style.width = intervals + "%";
            }
        }

	document.getElementById($peg.attr('pinnedDivID')).tmpPinned='pinned';
    };

    var setQWidth = function(e) {
        $peg = $(this);
        var ary = eval($peg.attr('ansarray'));
	index = getQWidthSliderIndex($peg);
	sectionID = $peg.attr('sectionID')
	questionID = $peg.attr('questionID')
	appPath = $peg.attr('appPath');	
	ajaxLinkSilent('shadowedBoxBody',
		       appPath + 'wizard2CustomOptionII.do?sectionID=' + sectionID + '&mode=setWidth&width=' + ary[index]);

	document.getElementById($peg.attr('pinnedDivID')).tmpPinned=null;
    };

    var setInitPos = function(evnt, widthStr) {
	$peg = $(this);
        var ary = eval($peg.attr('ansarray'));	
	$label = $('#' + $peg.attr('label'));
        $div = $('#' + $peg.attr('track'));
	index = 0;
	
	for (i=0; i < ary.length;i++) {
	    if (ary[i] == widthStr) {
		index = i;
		break;
	    }
	}

	$label.html(ary[index] + "%");
	$label.css('marginLeft', parseInt($peg.attr("labelMarginLeft")));
	$totalWidth = $div.parent().width() - parseInt($peg.attr("totalWidthOffset"));
	var steps = $totalWidth / ary.length;
	var currPos = (steps * (index + 1));
	$peg.css('left', ($peg.position().left + (currPos-5)));	
    };


    var arystr = "";
    for (i=1; i < 10;i++) {
	arystr += (i > 1 ? "," : "") + "'" + (i * 10) + "'";
    }
    arystr = "[" + arystr + "]";   

    $peg = $('#' + params.pegID);
    $peg.draggable({axis : 'x',containment:'parent', drag:printLabel, stop:setQWidth});
    
    $peg.attr('ansarray' , arystr);
    $peg.attr('track', params.sliderID);
    $peg.attr('label', params.labelID);
    $peg.attr('widthCtrlID', params.widthCtrlID);
    $peg.attr('sectionID', params.sectionID);
    $peg.attr('questionID', params.questionID);
    $peg.attr('appPath', params.appPath);
    $peg.attr('totalWidthOffset', params.totalWidthOffset);
    $peg.attr('labelMarginLeft', params.labelMarginLeft);
    $peg.attr('pinnedDivID', params.pinnedDivID);
    
    $peg.bind('stopfunc', setQWidth);
    $peg.bind('setInitPos', setInitPos);
    
}


function aTextBoxWidthDragSetup(params) {

    var printLabel = function(e) {
        $peg = $(this);
        var ary = eval($peg.attr('ansarray'));
        $label = $('#' + $peg.attr('label'));
        index = getQWidthSliderIndex($peg);
	multiplier = parseInt($peg.attr('multiplier'));
        $label.html(ary[index]);
	cssAttr = $peg.attr("slideEditAttr");
        $label.css('marginLeft', parseInt($peg.attr("labelMarginLeft")));
	$("#" + $peg.attr('widthCtrlID')).css(cssAttr , (ary[index] * multiplier));
	document.getElementById($peg.attr('pinnedDivID')).tmpPinned='pinned';
    };

    var setQWidth = function(e) {
        $peg = $(this);
        var ary = eval($peg.attr('ansarray'));
        index = getQWidthSliderIndex($peg);

        sectionID = $peg.attr('sectionID');
        questionID = $peg.attr('questionID');
        answerID = $peg.attr('answerID');
        appPath = $peg.attr('appPath');
	paramValue = ary[index];

	$label = $('#' + $peg.attr('label'));
	$label.html(paramValue);
        $label.css('marginLeft', parseInt($peg.attr("labelMarginLeft")));
        ajaxLinkSilent('shadowedBoxBody',
                       appPath + 'wizard2CustomOptionII.do?sectionID=' + sectionID + '&mode=setanswer' + $peg.attr("slideEditAttr") + 
		       '&value=' + paramValue + "&questionID=" + questionID);
	
	$tbox = $("#" + $peg.attr('widthCtrlID'));
	pegPosAttrKey = $peg.attr("slideEditAttr") == "width" ? "currPegPos" : "currPegPosHeight";
	$tbox.attr(pegPosAttrKey, ary[index]);
	document.getElementById($peg.attr('pinnedDivID')).tmpPinned=null;	
    };

    var setInitPos = function(evnt, widthStr) {	
        $peg = $(this);
        var ary = eval($peg.attr('ansarray'));
        $label = $('#' + $peg.attr('label'));
        $div = $('#' + $peg.attr('track'));
	pegPosAttrKey = $peg.attr("slideEditAttr") == "width" ? "currPegPos" : "currPegPosHeight";
	
	if ($("#" + $peg.attr('widthCtrlID')) && $("#" + $peg.attr('widthCtrlID')).attr(pegPosAttrKey)) {
	    widthStr = $("#" + $peg.attr('widthCtrlID')).attr(pegPosAttrKey);
	}

        index = 0;
        for (i=0; i < ary.length;i++) {
            if (ary[i] == widthStr) {
                index = i;
                break;
            }
        }

        $label.html(ary[index]);
        $label.css('marginLeft', parseInt($peg.attr("labelMarginLeft")));
        $totalWidth = $div.parent().width() - parseInt($peg.attr("totalWidthOffset"));
        var steps = $totalWidth / ary.length;
        var currPos = (steps * (index + 1));
        $peg.css('left', ($peg.position().left + (currPos-5)));
    };


    $peg = $('#' + params.pegID);
    $peg.draggable({axis : 'x',containment:'parent', drag:printLabel, stop:setQWidth});

    $peg.attr('ansarray' , params.valary);
    $peg.attr('track', params.sliderID);
    $peg.attr('label', params.labelID);
    $peg.attr('widthCtrlID', params.widthCtrlID);
    $peg.attr('sectionID', params.sectionID);
    $peg.attr('questionID', params.questionID);
    $peg.attr('appPath', params.appPath);
    $peg.attr('totalWidthOffset', params.totalWidthOffset);
    $peg.attr('labelMarginLeft', params.labelMarginLeft);
    $peg.attr('slideEditAttr', params.slideEditAttr);
    $peg.attr('multiplier', params.multiplier);
    $peg.attr('pinnedDivID', params.pinnedDivID);

    $peg.bind('stopfunc', setQWidth);
    $peg.bind('setInitPos', setInitPos);
}




function styleResizable (params) {
    eleID = params.elementID;
    zIndex = params.zindex ? params.zindex : 10;
    height = params.height ? params.height : 16;
    width = params.width ? params.width : 16;
    height = params.height ? params.height : 16;
    mainDivHeight = params.mainDivHeight? params.mainDivHeight : -3;
    mainDivWidth = params.mainDivWidth ? params.mainDivWidth : 3;
    img = params.img ? params.img : '/images/resizable.png';


    txt = $('#' + eleID);    
    mainDiv = txt.parent();
    txt.parent().children('div').each(function(){
					  var kid = $(this);
					  var val = kid.css('z-index');
					  if (parseInt(val)) {
					      txt = kid;
					      return;
					  }
				      });
    
    
    txt.css('zIndex', zIndex);
    txt.css('background', 'none');
    mainDiv.css('paddingBottom', 2);
    mainDiv.css('paddingRight', 2);

    txt.mouseover(function() {
                      var label = $('#' + params.labelID);
                      label.css('display', '');
                  });
    txt.mouseout(function() {
		     var label = $('#' + params.labelID);
		     label.css('display', 'none');
		 });
}



function getBetweenRange(params) {
 
    if (params.val < params.min) {
	return params.min;
    }

    if (params.val > params.max) {
	return params.max;
    }

    return params.val;
}

function updatePollAnswers(answersDivID, data, answerRowDivID, inputType) {

    var answersDiv = document.getElementById(answersDivID);
    var rowDivID = document.getElementById(answerRowDivID);
    var ansArray = new Array();
    var str = "";

    answersDiv.innerHTML = "";
    rowDivID.style.display = "";
    if (inputType == "textbox") {
        rowDivID.style.display="none";
        answersDiv.innerHTML = "<input type=\"text\" value=\"\" name=\"t_answer\" class=\"textbox\" id=\"qWidthCtrl\">";
        return;
    }

    ansArray = data.split("\n");
    str += "<table cellspacing=\"5\">";
    for (var i=0; i<ansArray.length; i++) {
        if (ansArray[i]==null || ansArray[i] == "") {
            continue;
        }


        str += "<tr>" +
               "<td class=\"answer_control\">";
                if (inputType == "radio") {
        str +=  "<div style=\"padding-bottom:3px;width:22px\">";
                }
        str +=  "<input type=\"" + inputType + "\" id=\"" + answersDivID  + "\" name=\"" + answersDivID + "\" value=\"\">";
                if (inputType == "radio") {
        str +=  "</div>";
                }
        str +=  "</td>" +
                "<td class=\"handPointer answer_text\">" + ansArray[i] + "</td>" +
                "</tr>";
    }
    str += "</table>";
    answersDiv.innerHTML = str;
}


function microPollOptionModifyMicroPollFont(id, selectBox, customColorField) {
    for (i=1; i > 0; i++) {
        var idStr = id+"_"+i;
        if(document.getElementById(idStr)) {
            modifyMicroPollFont(idStr, selectBox, customColorField);
        } else {
            break;
        }
    }
}

function modifyMicroPollFont(id, selectBox, customColorField) {
    if (document.getElementById) {
        obj = document.getElementById(id);
        if (selectBox.selectedIndex >= 0) {
            var selectedValue = selectBox.options[selectBox.selectedIndex].value;
            if(selectedValue == 0) {
                obj.style.fontFamily = "Tahoma";
            } else if(selectedValue == 1) {
                obj.style.fontFamily = "Arial";
            } else if(selectedValue == 2) {
                obj.style.fontFamily = "Times New Roman";
            }
        }
    }
}

function microPollOptionModifyMicroPollFontSize(id, selectBox, customColorField) {
    for (i=1; i > 0; i++) {
        var idStr = id+"_"+i;
        if(document.getElementById(idStr)) {
            modifyMicroPollFontSize(idStr, selectBox, customColorField);
        } else {
            break;
        }
    }
}

function modifyMicroPollFontSize(id, selectBox, customColorField) {
    if (document.getElementById) {
        obj = document.getElementById(id);
        if (selectBox.selectedIndex >= 0) {
            var selectedValue = selectBox.options[selectBox.selectedIndex].value;
            if(selectedValue == 0) {
                obj.style.fontSize = "8.5pt";
            } else if(selectedValue == 1) {
                obj.style.fontSize = "7pt";
            } else if(selectedValue == 2) {
                obj.style.fontSize = "7.5pt";
            } else if(selectedValue == 3) {
                obj.style.fontSize = "8pt";
            } else if(selectedValue == 4) {
                obj.style.fontSize = "8.5pt";
            } else if(selectedValue == 5) {
                obj.style.fontSize = "9pt";
            } else if(selectedValue == 6) {
                obj.style.fontSize = "9.5pt";
            } else if(selectedValue == 7) {
                obj.style.fontSize = "10pt";
            } else if(selectedValue == 8) {
                obj.style.fontSize = "10.5pt";
            } else if(selectedValue == 9) {
                obj.style.fontSize = "11pt";
            }
            obj.style.color = selectedValue;
        }
    }
}

function modifyTDRowBGColor(id,selectedValue) {
    if (document.getElementById) {
        obj = document.getElementById(id);
        obj.style.backgroundColor = selectedValue;
    }
}

function applyCustomThemeWidth(width,syndicate) {
 document.getElementById('border_table_mp_table_view').width = width;
 document.getElementById('border_table_mp_table_result').width = width;
 document.getElementById('mp_view_syndicateTd').style.width = syndicate;
 document.getElementById('mp_results_syndicateTd').style.width = syndicate;
}

function salesChatFlyDown() {
    var noSalesPopup = getCookie1("noSalesPopup");

    if (noSalesPopup) {
	return;
    }

    var divID = "SalesChatDiv";
    var pages = (getCookie1("VISITEDPAGES") != null ? getCookie1("VISITEDPAGES") :"");
    //dont let the cookie grow out of hand
    //keep track of the last 10 pages only
    if (pages.split("]").length >= 10) {
	var len = pages.split("]").length;
	var ary = pages.split("]");
	pages="";
	for (i=(len-2);i > (len-10);i--) {
	    pages = ary[i] + "]" + pages;
	}
    }
    var loc = pages + "[" + document.location.href + "];";
    document.cookie = "VISITEDPAGES=" + loc + "path=/;";
    if (loc.split("]").length < 4) {
	return;
    }

    LightboxInternal.JS.loadHtml();
}


function getSalesChatDiv() {
return  '<div id="SalesChatDiv">' +
	'<div class="chatCloseDiv" onclick="hideDiv(\'SalesChatDiv\');markNoSalesChat();" style="float:right;position:relative;left:22px;top:-20px;cursor:pointer;">' +
    	'<img src="/images/qphome/chat-Close.png">' +
	'</div>' +
	'<div style="height: 273px;width: 336px;text-align:center;">' +
	'<div style="color:#002f59;font-size:24px;font-weight:bold;top:22px;left:12px;">Hi, can we help you?</div>' +
        '<div style="color:#353535;font-size:12px;top:35px;width:240px;left:45px;font-family:\lucida grande\,verdana,sans-serif;line-height:18px;">' +
        'A questionpro.com sales agent is <br> available to answer your questions.</div>' +
        '<div class="chatCloseDiv"  style="top:71px;cursor:pointer;" onclick="hideDiv(\'SalesChatDiv\');markNoSalesChat();openWindow(\'/a/liveperson.do?queue=sales\');">' +
        '<img src="/images/qphome/yes-Chat.png"> ' +
        '</div> ' +
        '<div class="chatCloseDiv" onclick="hideDiv(\'SalesChatDiv\');markNoSalesChat();" style="top:78px;cursor:pointer;"> ' +
        ' <img src="/images/qphome/no-Chat.png">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
}

function gotoUpgradeScreen(loc) {
    if (window.opener) {
       window.opener.location.href=loc;
       self.close();
    }
    else {
        window.location.href=loc;
    }
}

function openImageLightbox(url) {
    LightboxInternal.JS.openImage(url);
}

function openNonProfitBlob(url) {
    LightboxInternal.JS.openNonProfit(url);
}

function openFreeStudentSponsorshipBlob(url) {
    LightboxInternal.JS.openFreeStudentSponsorship(url);
}

function openHTMLLightbox(url) {
    LightboxInternal.JS.openHTML(url);
}


function changeRule(className, key, value) {
    var srule = getCSSRule(className);
    if (srule) {
        srule.style.setProperty(key, value, 'important');
    }
}

function getCSSRule(className) {
    var styleSheets = document.styleSheets;
    for (i=0; i < styleSheets.length;i++) {
        var styleSheet = styleSheets[i];
        var srules = styleSheet.cssRules ? styleSheet.cssRules : styleSheet.rules;
        for (j=srules.length-1; j > 0;j--) {
            var srule = srules[j];
            if (srule.selectorText.indexOf(className) >= 0) {
                return srule;
            }
        }
    }
    return null;
}

function highLightNavLink(classID, heightLightClassName, currentClassName) {
    $("." + classID).click(function() {
        $(this).removeClass(currentClassName).siblings().addClass(currentClassName);
        $(this).addClass(heightLightClassName).siblings().removeClass(heightLightClassName);
    });
}

function checkHexCode(id) {
  var surveyBG = document.getElementById(id).value;
  if(surveyBG.indexOf("#") < 0) {
    document.getElementById(id).value = "#" + document.getElementById(id).value
  }
}

function gotoLocation (loc) {
  document.location = loc;
}

function setHeightWidth(params) {
    var currentElement = params.currentElement;
    var targetElement =  params.targetElement;
    var innerHtml = $(currentElement).html();
    var width = innerHtml.length + 20;
    var height = 15;
    if(width > 35) {
      width = width * 6;
    } else {
      width =  width * 4;
    } 
    if (width > 800) {
       height = width/800;
       height = Math.round(height * 35);
       width = 800;
    }
    if(isInternetExplorer) {
       width = width + 35;
       height = height + 10;	
    }	

    $("#"+targetElement).css('height',height);
    $("#"+targetElement).css('width', width);
}

function isAboveFold(eleID) {
    var win = $(window);
    var el = $('#' + eleID);
    var winPos = win.scrollTop() + win.height();
    var elPos = el.offset().top + el.height();
    return winPos > (elPos);
}

function processDateFilter(sdateStr, edateStr) {
        if (!sdateStr || !edateStr) {
	       return false;
	    }
    
        sdate = new Date(sdateStr);
    edate = new Date(edateStr);
    return sdate.getTime() < edate.getTime();
}


function resetForm(frm, url) {
  url = url.replace(/^\?/gi,"");
  ary = url.split("&");
  //alert(ary.length + " " + url);
   
  for (i=0; i < ary.length;i++) {
      key = ary[i].split("=")[0];
      value = ary[i].split("=")[1];
      frm[key].value = decodeURIComponent(value);
      //alert(key + " --> " + frm[key].value);
  } 
  
}

function addOption(openerDoc,imageName, imageID){
    addOptionToSelectBox(openerDoc.forms[2].elements['bannerUserFileID'],imageName,imageID);
}

function changeChartImg(chartType, questionID) {
    if(chartType == 0) {
        document.getElementById('chartImg_0_'+questionID).src = "/images/reports/piechart-selected-new.png";
        document.getElementById('chartImg_1_'+questionID).src = "/images/reports/columnchart-normal-new.png";
        document.getElementById('chartImg_2_'+questionID).src = "/images/reports/barchart-normal-new.png";
        document.getElementById('chartImg_3_'+questionID).src = "/images/reports/linechart-normal-new.png";
    }
    if(chartType == 1) {
        document.getElementById('chartImg_0_'+questionID).src = "/images/reports/piechart-normal-new.png";
        document.getElementById('chartImg_1_'+questionID).src = "/images/reports/columnchart-selected-new.png";
        document.getElementById('chartImg_2_'+questionID).src = "/images/reports/barchart-normal-new.png";
        document.getElementById('chartImg_3_'+questionID).src = "/images/reports/linechart-normal-new.png";
    }
    if(chartType == 2) {
        document.getElementById('chartImg_0_'+questionID).src = "/images/reports/piechart-normal-new.png";
        document.getElementById('chartImg_1_'+questionID).src = "/images/reports/columnchart-normal-new.png";
        document.getElementById('chartImg_2_'+questionID).src = "/images/reports/barchart-selected-new.png";
        document.getElementById('chartImg_3_'+questionID).src = "/images/reports/linechart-normal-new.png";
    }
    if(chartType == 3) {
        document.getElementById('chartImg_0_'+questionID).src = "/images/reports/piechart-normal-new.png";
        document.getElementById('chartImg_1_'+questionID).src = "/images/reports/columnchart-normal-new.png";
        document.getElementById('chartImg_2_'+questionID).src = "/images/reports/barchart-normal-new.png";
        document.getElementById('chartImg_3_'+questionID).src = "/images/reports/linechart-selected-new.png";
    }
}
