// http://stackoverflow.com/questions/15502691/chrome-webrequest-not-working
// Console not working: http://stackoverflow.com/questions/3829150/google-chrome-extension-console-log-from-background-page
// https://developer.chrome.com/extensions/webRequest
// https://developer.chrome.com/devtools/docs/network#http-headers
// https://developer.chrome.com/extensions/manifest

// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

function DOMtoString(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        case Node.CDATA_SECTION_NODE:
            html += '<![CDATA[' + node.nodeValue + ']]>';
            break;
        case Node.COMMENT_NODE:
            html += '<!--' + node.nodeValue + '-->';
            break;
        case Node.DOCUMENT_TYPE_NODE:
            // (X)HTML documents are identified by public identifiers
            html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
            break;
        }
        node = node.nextSibling;
    }
    return html;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});

var pageDetails;

function containsMedia(str) {
    return (str.indexOf('.mp3') != -1  || str.indexOf('.mp4') != -1  || str.indexOf('.flv') != -1);
}

// Fetch the pageSource from the open tab
function fetchPageSource( tabId ){
    // TODO: This is meant to refactor out the main logic from `onResponseStarted`
};

function postLinkToRemote( name, url, path ) {
    var server_url = "http://0.0.0.0:3000/links.json",
        request_params = "link[name]=" + name + "&link[url]=" + encodeURIComponent(url) + "&link[path]=" + path + "&link[downloaded]=False";

    var xhttp = new XMLHttpRequest();

    xhttp.open("POST", server_url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // xhttp.setRequestHeader("Content-length", request_params.length);
    // xhttp.setRequestHeader("Connection", "close");
    xhttp.send(request_params);
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function detailsToFilename( details ) {
    return 'session_' + pad(details.num, 2);
}

function toCurl( url, filename ) {
    return "curl '" + url + "' -o " + filename;
}

function postLinkToRemote( tab ) {
    var server_url = "http://0.0.0.0:3000/sites.json";

    if(!tab) {
        console.log("Mer");
        return;
    }

    if (tab.url.indexOf("youtube") < 0 && tab.url.indexOf("stackoverflow") < 0) {
        return;
    }

    var url = encodeURIComponent(tab.url)

    var request_params = "site[url]=" +
                         url +
                         "&site[name]=" +
                         "" +
                         "&site[title]=" +
                         tab.title +
                         "&site[is_starred]=" +
                         false;

    var xhttp = new XMLHttpRequest();
    // debugger;

    xhttp.open("POST", server_url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // xhttp.setRequestHeader("Content-length", request_params.length);
    // xhttp.setRequestHeader("Connection", "close");
    xhttp.send(request_params);
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
// document.addEventListener('DOMContentLoaded', function() {
    var queryInfo = {
      active: true,
      currentWindow: true
    };

    // chrome.tabs.query(queryInfo, function(tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        // var tab = tabs[0];
    
    postLinkToRemote( tab );
    
        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        // var url = tab.url;
    
        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        // console.assert(typeof url == 'string', 'tab.url should be a string');
    
        // callback(url);
    // });
  }

})

// chrome.webRequest.onResponseStarted.addListener(function(details){
/*
chrome.webRequest.onCompleted.addListener(function(details){
  var headers = details.responseHeaders,
      blockingResponse = {};

  // Can probably instead just check that the title is 'Headspace'
  // chrome.tabs.get(details.tabId, function(tab){
  //   if (tab.url.indexOf('https://www.headspace.com/') != -1) {
  //       
  //   }
  // });

  console.log("WHAT");
  var a = 'cool';

  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
      // chrome.tabs.query invokes the callback with a list of tabs that match the
      // query. When the popup is opened, there is certainly a window and at least
      // one tab, so we can safely assume that |tabs| is a non-empty array.
      // A window can only have one active tab at a time, so the array consists of
      // exactly one tab.
      var tab = tabs[0];
  
      postLinkToRemote( tab );
  
      // A tab is a plain object that provides information about the tab.
      // See https://developer.chrome.com/extensions/tabs#type-Tab
      // var url = tab.url;
  
      // tab.url is only available if the "activeTab" permission is declared.
      // If you want to see the URL of other tabs (e.g. after removing active:true
      // from |queryInfo|), then the "tabs" permission is required to see their
      // "url" properties.
      // console.assert(typeof url == 'string', 'tab.url should be a string');
  
      // callback(url);
  });
  
    // Most methods of the Chrome extension APIs are asynchronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, function(tabs) {
    //   url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
  // }

  // if ( containsMedia( details.url ) ) {
  //   mediaDetails = details;

  //   chrome.tabs.executeScript(details.tabId, {
  //     file: "getPagesSource.js"
  //   }, function() {
  //     // If you try and inject into an extensions page or the webstore/NTP you'll get an error
  //     if (chrome.runtime.lastError) {
  //       console.log('There was an error injecting script : \n' + chrome.runtime.lastError.message);
  //     }
  //   });

  //   // setInterval here to get page details before logging to console
  //   var printDetailsInt = setInterval( function() {
  //       if( pageDetails != undefined ) {
  //           console.log(mediaDetails.url);
  //           console.log(pageDetails);

  //           var filename = detailsToFilename( pageDetails );
  //           var curl = toCurl( mediaDetails.url, filename );
  //           console.log(curl);

  //           postLinkToRemote( filename, mediaDetails.url, '/' );

  //           pageDetails = undefined;
  //           clearInterval(printDetailsInt);
  //       }
  //   }, 3000);
  // }

  // blockingResponse.responseHeaders = headers;
  // return blockingResponse;
},
{urls: [ "<all_urls>" ]},['responseHeaders']);
*/

chrome.runtime.onMessage.addListener(function(request, sender) {
  console.log("WHAT2");
  // if (request.action == "getSource") {
  //   index = request.source.search('details');
  //   source = request.source.substring(index, index + 1000);

  //   pageDetails = parseHeadspace(source);
  // }
});

function parseHeadspace(source) {
    result = source.split('>');

    session_info = result[4].slice(0, "<br".length * -1);
    session_progress = session_info.substring('Session '.length);
    num = parseInt(session_progress.split('/')[0]);
    total = parseInt(session_progress.split('/')[1]);

    // TODO: Add minutes to details

    details = {
        'title': result[2].slice(0, "</h1".length * -1),
        'session_info': session_info,
        'session_progress': session_progress,
        'num': num,
        'total': total
    }
    return details;
}
