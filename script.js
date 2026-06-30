const target = new Date("2026-07-21T11:38:00+08:00").getTime();
const fields = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const distance = Math.max(0, target - Date.now());
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;
  const minute = 60 * 1000;

  fields.days.textContent = Math.floor(distance / day);
  fields.hours.textContent = pad(Math.floor((distance % day) / hour));
  fields.minutes.textContent = pad(Math.floor((distance % hour) / minute));
  fields.seconds.textContent = pad(Math.floor((distance % minute) / 1000));
}

updateCountdown();
setInterval(updateCountdown, 1000);
