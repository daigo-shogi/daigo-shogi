(function () {
  const boards = document.querySelectorAll('[data-schedule-board]');
  if (!boards.length) return;

  function escapeText(value) {
    return String(value == null ? '' : value);
  }

  function renderBoard(board, data) {
    const list = board.querySelector('[data-schedule-list]');
    const footer = board.querySelector('[data-schedule-footer]');
    const updated = board.querySelector('[data-schedule-updated]');
    const notices = Array.isArray(data.notices) ? data.notices : [];

    if (list) {
      if (notices.length > 0) {
        list.innerHTML = notices
          .map((notice) => {
            const date = escapeText(notice.date);
            const note = notice.note ? `　${escapeText(notice.note)}` : '';
            return `<li>${date}${note}</li>`;
          })
          .join('');
      } else {
        list.innerHTML = '<li>現在、お休みの予定はありません。</li>';
        list.style.color = 'var(--color-primary-dark)';
      }
    }

    if (footer) {
      footer.textContent = data.footer_note || '';
      footer.hidden = !data.footer_note;
    }

    if (updated) {
      updated.textContent = data.last_updated ? `※最終更新: ${data.last_updated}` : '';
      updated.hidden = !data.last_updated;
    }
  }

  function renderError(board) {
    const list = board.querySelector('[data-schedule-list]');
    const footer = board.querySelector('[data-schedule-footer]');
    const updated = board.querySelector('[data-schedule-updated]');
    if (list) list.innerHTML = '<li>お知らせは活動案内ページでご確認ください</li>';
    if (footer) {
      footer.textContent = '';
      footer.hidden = true;
    }
    if (updated) {
      updated.textContent = '';
      updated.hidden = true;
    }
  }

  boards.forEach((board) => {
    const src = board.dataset.scheduleSrc || 'data/schedule.json';
    fetch(`${src}?${Date.now()}`)
      .then((response) => {
        if (!response.ok) throw new Error('schedule.json load failed');
        return response.json();
      })
      .then((data) => renderBoard(board, data))
      .catch((error) => {
        console.error('schedule.json の読み込みに失敗:', error);
        renderError(board);
      });
  });
}());
