// projects-popup.js
// Fixed on-screen project dialog that appears on hover/focus.

(function () {
  const SHOW_DELAY = 200;
  const HIDE_DELAY = 120;
  let popup = null;
  let showTimer = null;
  let hideTimer = null;

  function createPopup() {
    if (popup) return;
    popup = document.createElement('aside');
    popup.id = 'proj-popup';
    popup.className = 'proj-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-live', 'polite');
    popup.setAttribute('aria-hidden', 'true');
    popup.setAttribute('aria-label', 'Project preview dialog');
    popup.innerHTML = `
      <div class="pp-label">Project Preview</div>
      <h3 class="pp-head" id="pp-title"></h3>
      <p class="pp-desc" id="pp-desc"></p>
    `;
    document.body.appendChild(popup);
  }

  function setPopupContent(projectCard) {
    const title = projectCard.querySelector('.p-name')?.textContent?.trim() || 'Project';
    const desc = projectCard.querySelector('.p-blurb')?.textContent?.trim() || 'No description available.';

    popup.querySelector('#pp-title').textContent = title;
    popup.querySelector('#pp-desc').textContent = desc;
  }

  function showPopup(projectCard) {
    clearTimeout(hideTimer);
    setPopupContent(projectCard);
    popup.classList.add('visible');
    popup.setAttribute('aria-hidden', 'false');
  }

  function hidePopup() {
    clearTimeout(showTimer);
    popup.classList.remove('visible');
    popup.setAttribute('aria-hidden', 'true');
  }

  function scheduleShow(projectCard) {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    showTimer = setTimeout(() => showPopup(projectCard), SHOW_DELAY);
  }

  function scheduleHide() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hidePopup, HIDE_DELAY);
  }

  function initProjectDialog() {
    createPopup();
    const projectCards = document.querySelectorAll('.prow');
    if (!projectCards.length) return;

    projectCards.forEach((card) => {
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }
      card.setAttribute('aria-describedby', 'proj-popup');

      card.addEventListener('mouseenter', () => scheduleShow(card));
      card.addEventListener('mouseleave', scheduleHide);
      card.addEventListener('focus', () => showPopup(card));
      card.addEventListener('blur', scheduleHide);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectDialog);
  } else {
    initProjectDialog();
  }
})();
