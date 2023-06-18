let time = 0;

let countdown = document.getElementById('countdown');

setInterval(updateCountdown, 1000);

function updateCountdown() {
    let minutes = Math.floor(time/60);
    let seconds = time % 60;
    countdown.innerHTML = `${minutes} : ${seconds}`;
    time++;
}