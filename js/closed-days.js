(function () {
  const board = document.querySelector('[data-closed-days-board]');
  if (!board) return;

  const list = board.querySelector('[data-closed-days-list]');
  const note = board.querySelector('[data-closed-days-note]');
  const fallbackMessage = 'お知らせは活動案内ページでご確認ください';
  const emptyMessage = '現在、お休みのお知らせはありません';
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  function formatClosedDay(value) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.getMonth() + 1}月${date.getDate()}日(${weekdays[date.getDay()]})はお休みです`;
  }

  function renderMessage(message) {
    list.innerHTML = '';
    const item = document.createElement('li');
    item.textContent = message;
    list.appendChild(item);
  }

  function render(data) {
    const closedDays = Array.isArray(data.closedDays) ? data.closedDays : [];
    list.innerHTML = '';

    if (closedDays.length === 0) {
      renderMessage(emptyMessage);
    } else {
      closedDays.forEach((day) => {
        const item = document.createElement('li');
        item.textContent = formatClosedDay(day);
        list.appendChild(item);
      });
    }

    if (data.note) {
      note.textContent = data.note;
      note.hidden = false;
    } else {
      note.textContent = '';
      note.hidden = true;
    }
  }

  fetch('data/closed-days.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load closed-days.json');
      return response.json();
    })
    .then(render)
    .catch(() => {
      renderMessage(fallbackMessage);
      note.textContent = '';
      note.hidden = true;
    });
}());
