// ==UserScript==
// @name         Ruby China Ignore Topics
// @namespace    https://github.com/zhengpd/userscripts
// @version      0.1
// @description  Add 'ignore topic' feature to ruby-china.org
// @author       Zheng Piaodan
// @match        https://ruby-china.org/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var storageKey = 'ignoredTopicIds';

function setIgnoredTopicIds(ids) {
  localStorage.setItem(storageKey, JSON.stringify(ids));
}

function getIgnoredTopicIds() {
  var ids = localStorage.getItem(storageKey);
  return ids ? JSON.parse(ids) : [];
}

function addIgnoredTopicId(id) {
  var ids = getIgnoredTopicIds();
  ids.push(id);
  setIgnoredTopicIds(ids);
}

function removeIgnoredTopicId(id) {
  var ids = getIgnoredTopicIds();
  var index = ids.indexOf(id);
  if (index > -1) {
    ids.splice(index, 1);
    setIgnoredTopicIds(ids);
  }
}

function getTopicIdByNode(topicNode) {
  return topicNode.className.match(/\d+/)[0];
}

function hideNode(node) {
  node.style.display = 'none'; // Hide topic node
}

function filterTopics() {
  var ignoredTopicIds = getIgnoredTopicIds();
  var topicNodes = document.querySelectorAll('div.topic');
  for (var i = 0; i < topicNodes.length; i++) {
    var topicNode = topicNodes[i];
    var topicId = getTopicIdByNode(topicNode);
    if (ignoredTopicIds.indexOf(topicId) > -1) {
      hideNode(topicNode);
    }
  }
}

function onClickIgnoreTopic(event) {
  event.preventDefault();

  var topicNode = event.target.closest('div.topic');
  var topicId = getTopicIdByNode(topicNode);
  addIgnoredTopicId(topicId);
  hideNode(topicNode);
}

function onResetIgnoredTopics(event) {
  var ret = confirm('确定重置已忽略话题？');

  if (ret) {
    setIgnoredTopicIds([]); // clear ignored topics
    window.location.reload();
  }
}

function appendResetIgnoredTopics() {
  var filterNode = document.querySelector('div.filter');
  if (!filterNode) { return false; }

  var separator = document.createTextNode(' / ');
  filterNode.appendChild(separator);

  var el = document.createElement('a');
  el.href = '#';
  el.onclick = onResetIgnoredTopics;
  el.text = '清除已忽略';

  filterNode.appendChild(el);
}

function appendTopicListIgnore(topicNode) {
  var infoNode = topicNode.querySelector('div.info');
  if (!infoNode) { return false; }

  var el = document.createElement('a');
  el.href = '#';
  el.className = 'node';
  el.onclick = onClickIgnoreTopic;
  el.text = '忽略话题';

  infoNode.appendChild(el);
}

function appendTopicListIgnores() {
  var topicNodes = document.querySelectorAll('div.topic');
  for (var i = 0; i < topicNodes.length; i++) {
    appendTopicListIgnore(topicNodes[i]);
  }
}

function appendTopicDetailIgnore() {
  var optsNode = document.querySelector('div.topic-detail div.opts');
  if (!optsNode) { return false; }

  var ignoredTopicIds = getIgnoredTopicIds();
  var el = optsNode.querySelector('a.bookmark').cloneNode();
  var topicId = el.dataset.id;

  if (ignoredTopicIds.indexOf(topicId) > -1) {
    el.className = 'unignore-topic';
    el.title = '取消忽略';
    el.innerHTML = '<i class="fa fa-trash"></i> 取消忽略';
    el.onclick = function (event) {
      event.preventDefault();

      removeIgnoredTopicId(event.target.dataset.id);
      window.location.reload();
    };
  } else {
    el.className = 'ignore-topic';
    el.title = '忽略话题';
    el.innerHTML = '<i class="fa fa-trash"></i> 忽略话题';
    el.onclick = function (event) {
      event.preventDefault();

      addIgnoredTopicId(event.target.dataset.id);
      window.location = '/topics';
    };
  }

  optsNode.appendChild(el);
}

function initialize() {
  var href = window.location.href;
  if (/topics((\?|#|\/[a-z]).*)?$/.test(href)) { // Topic list page
    filterTopics();
    appendResetIgnoredTopics();
    appendTopicListIgnores();
  } else if (/topics\/\d+/.test(href)) { // Topic detail page
    appendTopicDetailIgnore();
  }
}

window.addEventListener('page:load', function (event) {
  initialize();
}, false);

initialize();
