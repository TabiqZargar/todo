window.RT = window.RT || {};
RT.Hooks = RT.Hooks || {};

RT.Hooks.useTimer = function () {
  const state = {
    interval: null,
    seconds: RT.Store.data.settings.focusDuration * 60,
    running: false,
    phase: 'focus',
    sessions: 0,
  };

  function getDisplay() {
    const m = Math.floor(state.seconds / 60);
    const s = state.seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getPhaseStyle() {
    return state.phase === 'focus' ? 'var(--accent-green)' : 'var(--accent-blue)';
  }

  function updateDisplay() {
    const displayEl = document.getElementById('timer-display');
    const phaseEl = document.getElementById('timer-phase');
    if (displayEl) displayEl.textContent = getDisplay();
    if (phaseEl) {
      phaseEl.textContent = state.phase.toUpperCase();
      phaseEl.style.color = getPhaseStyle();
    }
  }

  function completePhase() {
    clearInterval(state.interval);
    state.running = false;
    document.getElementById('focus-start-btn').disabled = false;
    document.getElementById('focus-pause-btn').disabled = true;

    if (state.phase === 'focus') {
      RT.FocusService.addSession(RT.Store.data.settings.focusDuration, 'focus');
      state.sessions++;
      state.phase = 'break';
      state.seconds = RT.Store.data.settings.breakDuration * 60;
      if (RT.Features && RT.Features.Focus) RT.Features.Focus.updateStats();
      if (RT.Store.data.settings.soundEnabled) {
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4CAgH9/f3+AgIB/f39/gICAf39/f4CAgI=').play(); } catch {}
      }
    } else {
      state.phase = 'focus';
      state.seconds = RT.Store.data.settings.focusDuration * 60;
    }

    document.getElementById('focus-start-btn').textContent = 'Start';
    updateDisplay();
  }

  function start() {
    if (state.running) return;
    state.running = true;
    document.getElementById('focus-start-btn').disabled = true;
    document.getElementById('focus-pause-btn').disabled = false;
    state.interval = setInterval(() => {
      state.seconds--;
      updateDisplay();
      if (state.seconds <= 0) completePhase();
    }, 1000);
  }

  function pause() {
    state.running = false;
    clearInterval(state.interval);
    document.getElementById('focus-start-btn').disabled = false;
    document.getElementById('focus-start-btn').textContent = 'Resume';
    document.getElementById('focus-pause-btn').disabled = true;
  }

  function reset() {
    state.running = false;
    clearInterval(state.interval);
    state.phase = 'focus';
    state.seconds = RT.Store.data.settings.focusDuration * 60;
    updateDisplay();
    document.getElementById('focus-start-btn').disabled = false;
    document.getElementById('focus-start-btn').textContent = 'Start';
    document.getElementById('focus-pause-btn').disabled = true;
  }

  function initTimer(focusDuration) {
    state.seconds = focusDuration * 60;
    updateDisplay();
  }

  function syncSettings() {
    if (state.phase === 'focus' && !state.running) {
      state.seconds = RT.Store.data.settings.focusDuration * 60;
      updateDisplay();
    }
  }

  return { state, start, pause, reset, initTimer, updateDisplay, syncSettings };
};
