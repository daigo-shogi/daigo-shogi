(function () {
  const calendarRoot = document.querySelector('[data-admin-calendar]');
  if (!calendarRoot) return;

  const title = document.querySelector('[data-calendar-title]');
  const selectedList = document.querySelector('[data-selected-days]');
  const jsonOutput = document.querySelector('[data-json-output]');
  const noteInput = document.querySelector('[data-note-input]');
  const copyButton = document.querySelector('[data-copy-json]');
  const downloadButton = document.querySelector('[data-download-json]');
  const prevButton = document.querySelector('[data-prev-month]');
  const nextButton = document.querySelector('[data-next-month]');
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const activityWeekdays = new Set([0, 4]);
  const selected = new Set();

  let baseMonth = new Date();
  baseMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1);

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function toDateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function formatLabel(key) {
    const date = new Date(`${key}T00:00:00`);
    if (Number.isNaN(date.getTime())) return key;
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${weekdays[date.getDay()]})`;
  }

  function makeJson() {
    return JSON.stringify({
      closedDays: Array.from(selected).sort(),
      note: noteInput.value.trim()
    }, null, 2);
  }

  function updateSelectedView() {
    const days = Array.from(selected).sort();
    selectedList.innerHTML = '';

    if (days.length === 0) {
      const item = document.createElement('li');
      item.textContent = '選択された休み日はありません';
      selectedList.appendChild(item);
    } else {
      days.forEach((day) => {
        const item = document.createElement('li');
        item.textContent = formatLabel(day);
        selectedList.appendChild(item);
      });
    }

    jsonOutput.value = makeJson();
  }

  function renderMonth(monthDate) {
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const monthEl = document.createElement('section');
    monthEl.className = 'admin-month';

    const heading = document.createElement('h2');
    heading.textContent = `${year}年${month + 1}月`;
    monthEl.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'admin-calendar-grid';

    weekdays.forEach((day) => {
      const cell = document.createElement('div');
      cell.className = 'admin-weekday';
      cell.textContent = day;
      grid.appendChild(cell);
    });

    for (let i = 0; i < first.getDay(); i += 1) {
      const blank = document.createElement('div');
      blank.className = 'admin-day is-blank';
      grid.appendChild(blank);
    }

    for (let day = 1; day <= last.getDate(); day += 1) {
      const date = new Date(year, month, day);
      const key = toDateKey(date);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'admin-day';
      button.dataset.date = key;
      button.setAttribute('aria-pressed', selected.has(key) ? 'true' : 'false');
      if (activityWeekdays.has(date.getDay())) button.classList.add('is-activity-day');
      if (selected.has(key)) button.classList.add('is-selected');

      const dayNumber = document.createElement('span');
      dayNumber.className = 'admin-day-number';
      dayNumber.textContent = String(day);
      button.appendChild(dayNumber);

      const marker = document.createElement('span');
      marker.className = 'admin-day-marker';
      marker.textContent = selected.has(key) ? '休' : activityWeekdays.has(date.getDay()) ? '活動日' : '';
      button.appendChild(marker);

      button.addEventListener('click', () => {
        if (selected.has(key)) selected.delete(key);
        else selected.add(key);
        render();
      });

      grid.appendChild(button);
    }

    monthEl.appendChild(grid);
    return monthEl;
  }

  function render() {
    calendarRoot.innerHTML = '';
    const nextMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);
    title.textContent = `${baseMonth.getFullYear()}年${baseMonth.getMonth() + 1}月 - ${nextMonth.getFullYear()}年${nextMonth.getMonth() + 1}月`;
    calendarRoot.appendChild(renderMonth(baseMonth));
    calendarRoot.appendChild(renderMonth(nextMonth));
    updateSelectedView();
  }

  prevButton.addEventListener('click', () => {
    baseMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1);
    render();
  });

  nextButton.addEventListener('click', () => {
    baseMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);
    render();
  });

  noteInput.addEventListener('input', updateSelectedView);

  copyButton.addEventListener('click', async () => {
    jsonOutput.value = makeJson();
    try {
      await navigator.clipboard.writeText(jsonOutput.value);
      copyButton.textContent = 'コピーしました';
      setTimeout(() => { copyButton.textContent = 'JSONをコピー'; }, 1600);
    } catch {
      jsonOutput.focus();
      jsonOutput.select();
    }
  });

  downloadButton.addEventListener('click', () => {
    jsonOutput.value = makeJson();
    const blob = new Blob([jsonOutput.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'closed-days.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  fetch('../data/closed-days.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load closed-days.json');
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data.closedDays)) {
        data.closedDays.forEach((day) => selected.add(day));
      }
      if (data.note) noteInput.value = data.note;
      render();
    })
    .catch(() => {
      ['2026-07-12', '2026-08-16', '2026-08-28'].forEach((day) => selected.add(day));
      render();
    });
}());
