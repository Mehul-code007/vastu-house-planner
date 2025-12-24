
const plot = document.getElementById("plot");
const reasonBox = document.getElementById("reasonBox");

const ZONES = ['NW','N','NE','W','C','E','SW','S','SE'];

const rules = {
  Temple: ['NE'],
  Bathroom: ['NW','SE'],
  Bedroom: ['SW','W'],
  Living: ['N','E','NW'],
  Kitchen: ['SE'],
  Staircase: ['SW','W','S']
};

const reasons = {
  Temple: "Temple should be in North-East (Ishan corner).",
  Bathroom: "Bathroom should be in North-West or South-East.",
  Bedroom: "Bedroom is best placed in South-West or West.",
  Living: "Living room should be in North, East, or North-West.",
  Kitchen: "Kitchen should be in South-East (Agni corner).",
  Staircase: "Staircase is preferred in South, West, or South-West."
};

let rooms = [];

// ====== Clear all rooms ======
function clearAll() {
  rooms.forEach(room => room.remove());
  rooms = [];
}

// ====== Generate rooms ======
function generate() {
  clearAll();

  const poojaVal = document.getElementById("pooja").value;
  const bathVal = document.getElementById("bath").value;
  const bedVal = document.getElementById("bed").value;
  const livingVal = document.getElementById("living").value;
  const kitchenVal = document.getElementById("kitchen").value;
  const stairChecked = document.getElementById("stair").checked;

  // Rooms add 
  addRooms("Temple", poojaVal);
  addRooms("Bathroom", bathVal);
  addRooms("Bedroom", bedVal);
  addRooms("Living", livingVal);
  addRooms("Kitchen", kitchenVal);

  if (stairChecked)
    createRoom("Staircase", 240, 420, true);

  validate();
}

// ====== Add multiple rooms ======
function addRooms(type, count) {
  for (let i = 0; i < count; i++) {
    createRoom(type, 20 + i * 130, 20 + rooms.length * 15);
  }
}

// ====== Create room ======
function createRoom(type, x, y, isStair = false) {
  const room = document.createElement("div");
  room.classList.add("room");
  room.classList.add(isStair ? "stair" : "valid");
  room.textContent = type;

  room.dataset.type = type;
  room.dataset.stair = isStair;

  room.style.left = x + "px";
  room.style.top = y + "px";

  plot.appendChild(room);

  room.lastX = x;
  room.lastY = y;

  makeDraggable(room);
  rooms.push(room);
}

// ====== Drag functionality ======
function makeDraggable(el) {
  let offsetX, offsetY;

  
  el.onmousedown = start;
  el.ontouchstart = (e) => start(e.touches[0]);

  function start(e) {
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.onmousemove = (ev) => move(ev);
    document.onmouseup = stop;

    document.ontouchmove = (ev) => {
      if (ev.cancelable) ev.preventDefault(); 
      move(ev.touches[0]);
    };
    document.ontouchend = stop;
  }

  function move(e) {
    const plotRect = plot.getBoundingClientRect();

    let x = e.clientX - plotRect.left - offsetX;
    let y = e.clientY - plotRect.top - offsetY;

    x = Math.max(0, Math.min(x, plotRect.width - el.offsetWidth));
    y = Math.max(0, Math.min(y, plotRect.height - el.offsetHeight));

    el.style.left = x + "px";
    el.style.top = y + "px";

    if (el.dataset.stair !== "true" && isOverlapping(el)) {
      el.style.left = el.lastX + "px";
      el.style.top = el.lastY + "px";
    } else {
      el.lastX = x;
      el.lastY = y;
    }

    validateRooms(); //
  }

  function stop() {
    document.onmousemove = null;
    document.onmouseup = null;
    document.ontouchmove = null;
    document.ontouchend = null;
  }
}

// ====== Overlap check ======
function isOverlapping(target) {
  const a = target.getBoundingClientRect();

  return rooms.some(room => {
    if (room === target || room.dataset.stair === "true") return false;

    const b = room.getBoundingClientRect();

    return !(
      a.right < b.left ||
      a.left > b.right ||
      a.bottom < b.top ||
      a.top > b.bottom
    );
  });
}

// ====== Get zone ======
function getZone(room) {
  const r = room.getBoundingClientRect();
  const p = plot.getBoundingClientRect();

  const col = Math.floor((r.left + r.width / 2 - p.left) / (p.width / 3));
  const row = Math.floor((r.top + r.height / 2 - p.top) / (p.height / 3));

  return ZONES[row * 3 + col];
}

// ====== Validate rooms ======
function validateRooms() {
  reasonBox.textContent = "All rooms are Vastu compliant.";

  rooms.forEach(room => {
    if (room.dataset.stair === "true") return;

    const currentZone = getZone(room);
    const allowed = rules[room.dataset.type];

    room.classList.remove("valid", "invalid");

    if (allowed.includes(currentZone)) {
      room.classList.add("valid");
      room.title = room.dataset.type + " is correctly placed.";
    } else {
      room.classList.add("invalid");
      const msg = `${room.dataset.type} is in ${currentZone}. ${reasons[room.dataset.type]}`;
      room.title = msg;
      reasonBox.textContent = msg;
    }
  });
}


