const fetchBusData = async () => {
  try {
    const response = await fetch('/next-departure');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${error.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching bus data: ${error}`);
  }
};

const formateDate = (date) => date.toISOString().split('T')[0];
const formateTime = (date) => date.toTimeString().split(' ')[0].slice(0, 5);

const getTimeRemeiningSeconds = time => {
  const now = new Date();
  const deferenseTime = time - now;
  return Math.floor(deferenseTime / 1000);
}

const renderBusData = (buses) => {
  const tableBody = document.querySelector('#bus tbody');
  tableBody.textContent = '';

  buses.forEach(bus => {
    const row = document.createElement('tr');
    const nextDepartureDateTimeUTC = new Date(`${bus.nextDeparture.date}T${bus.nextDeparture.time}Z`);

    const remainingSeconds = getTimeRemeiningSeconds(nextDepartureDateTimeUTC);
    const remainingTimeText = remainingSeconds < 60 ? 'Отправляется' : bus.nextDeparture.remaining;

    row.innerHTML = `
      <td>${bus.busNumber}</td>
      <td>${bus.startPoint} - ${bus.endPoint}</td>
      <td>${formateDate(nextDepartureDateTimeUTC).split('-').reverse().join('.')}</td>
      <td>${formateTime(nextDepartureDateTimeUTC)}</td>
      <td>${remainingTimeText}</td>
    `;
    tableBody.append(row);
  });
};

const initWebSocket = () => {
  const ws = new WebSocket(`wss://${location.host}`);

  ws.addEventListener('open', () => {
    console.log('Websocket connection');
  });

  ws.addEventListener('message', (event) => {
    const buses = JSON.parse(event.data);
    renderBusData(buses);
  });

  ws.addEventListener('error', (error) => {
    console.log(`Websocket error: ${error} `);
  });

  ws.addEventListener('close', () => {
    console.log(`Websocket connection close`);
  });
};


const updateCurrentTime = () => {
  const currentTimeElem = document.querySelector('#current-time');
  const now = new Date();
  currentTimeElem.textContent = now.toTimeString().split(' ')[0];

  setTimeout(updateCurrentTime, 1000);
};

const init = async () => {
  updateCurrentTime();
  const buses = await fetchBusData();
  renderBusData(buses);

  initWebSocket();
};

init();