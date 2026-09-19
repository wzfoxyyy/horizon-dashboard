// Member-facing support chat widget + the Admin "Support Inbox" tab.
// Both render the same conversation — appendMessage() writes into whichever
// of the two containers exist in the DOM, so an admin reply shows up in the
// member's widget instantly (and vice versa) since it's one shared page.
//
// TODO (backend): this is a single hardcoded ticket for the demo account.
// A real version needs a ticket list, per-member threads, and the message
// history persisted server-side (e.g. over websockets) instead of living
// only in this tab's memory.

import { showToast, timeNow, openModal, closeModal, wireBackdropClose } from './utils.js';

let ticketOpen = false;
let autoThanksSent = false;

// sender kinds: 'user' (member, right side), 'bot' (automated, left side,
// amber label), 'agent' (human admin reply, left side, purple label)
function buildMessageEl(kind, senderLabel, text){
  const isUser = kind === 'user';
  const group = document.createElement('div');
  group.className = 'chat-msg-group ' + (isUser ? 'from-user' : 'from-agent');
  group.innerHTML = `
    ${!isUser ? `<div class="chat-sender ${kind === 'agent' ? 'agent' : 'bot'}" style="color:${kind === 'agent' ? 'var(--purple-2)' : 'var(--amber)'}">${senderLabel}</div>` : ''}
    <div class="chat-bubble">${text}</div>
    <div class="chat-time">${timeNow()}</div>`;
  return group;
}

function appendMessage(chatBody, adminChatBody, kind, senderLabel, text){
  const emptyNote = document.getElementById('adminChatEmpty');
  if(emptyNote) emptyNote.remove();

  chatBody.appendChild(buildMessageEl(kind, senderLabel, text));
  chatBody.scrollTop = chatBody.scrollHeight;

  if(adminChatBody){
    adminChatBody.appendChild(buildMessageEl(kind, senderLabel, text));
    adminChatBody.scrollTop = adminChatBody.scrollHeight;
  }
}

function showTyping(containers){
  containers.forEach(container => {
    if(!container) return;
    const t = document.createElement('div');
    t.className = 'chat-msg-group from-agent typing-instance';
    t.innerHTML = `<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>`;
    container.appendChild(t);
    container.scrollTop = container.scrollHeight;
  });
}
function hideTyping(){
  document.querySelectorAll('.typing-instance').forEach(t => t.remove());
}

export function initChat(){
  const supportOverlay = document.getElementById('supportOverlay');
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');
  const adminChatBody = document.getElementById('adminChatBody');
  const adminChatInput = document.getElementById('adminChatInput');

  const append = (kind, sender, text) => appendMessage(chatBody, adminChatBody, kind, sender, text);

  document.getElementById('supportBtn').addEventListener('click', () => openModal(supportOverlay));
  document.getElementById('supportClose').addEventListener('click', () => closeModal(supportOverlay));
  wireBackdropClose(supportOverlay);

  document.getElementById('openTicketBtn').addEventListener('click', () => {
    if(ticketOpen) return;
    ticketOpen = true;
    document.getElementById('ticketStart').remove();
    showTyping([chatBody, adminChatBody]);
    setTimeout(() => {
      hideTyping();
      append('bot', 'BOT', 'Hi! We\'re here to help you with your problem. While you\'re waiting for a response from our support team, please take a look at our FAQ: <a href="#">dash.horizon.cloud/dashboard/guides</a>');
      showToast('Ticket opened');
    }, 900);
  });

  function sendChatMessage(){
    const val = chatInput.value.trim();
    if(!val) return;
    if(!ticketOpen){
      ticketOpen = true;
      const start = document.getElementById('ticketStart');
      if(start) start.remove();
    }
    append('user', 'You', val);
    chatInput.value = '';

    // The automated "thanks for the message" reply only fires once per
    // ticket. After that, the member can send as many messages as they
    // want — a human agent replies from the Admin Inbox instead of another
    // bot auto-reply.
    if(!autoThanksSent){
      autoThanksSent = true;
      showTyping([chatBody, adminChatBody]);
      setTimeout(() => {
        hideTyping();
        append('bot', 'BOT', 'Thanks for the message — a member of our team will reply here shortly. You can keep adding details in the meantime.');
      }, 1100 + Math.random() * 700);
    }
  }
  document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      sendChatMessage();
    }
  });

  // Admin replying from the Support Inbox — posts as a human agent, shows
  // up instantly in the member's chat widget too (same shared conversation).
  function sendAdminReply(){
    const val = adminChatInput.value.trim();
    if(!val) return;
    append('agent', 'Foxy · Support', val);
    adminChatInput.value = '';
  }
  document.getElementById('adminChatSendBtn').addEventListener('click', sendAdminReply);
  adminChatInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      sendAdminReply();
    }
  });
}
