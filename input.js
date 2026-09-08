// input.js
// --- INPUTS ---
const keys = { w: false, s: false, up: false, down: false, space: false, enter: false };

window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'w') keys.w = true;
    if (e.key.toLowerCase() === 's') keys.s = true;
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
    if (e.key === ' ') { keys.space = true; activateSkill(1); }
    if (e.key === 'Enter' || e.key === 'Shift') { keys.enter = true; activateSkill(2); }
    if (e.key.toLowerCase() === 'p' || e.key === 'Escape') togglePause();
});

window.addEventListener('keyup', e => {
    if (e.key.toLowerCase() === 'w') keys.w = false;
    if (e.key.toLowerCase() === 's') keys.s = false;
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
    if (e.key === ' ') keys.space = false;
    if (e.key === 'Enter' || e.key === 'Shift') keys.enter = false;
});