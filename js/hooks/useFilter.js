window.RT = window.RT || {};
RT.Hooks = RT.Hooks || {};

RT.Hooks.useFilter = function () {
  const state = {
    search: '',
    priority: '',
    category: '',
    done: undefined,
  };

  function getState() {
    return { ...state };
  }

  function setSearch(val) { state.search = val; }
  function setPriority(val) { state.priority = val; }
  function setCategory(val) { state.category = val; }
  function setDone(val) { state.done = val; }

  function apply() {
    return RT.TaskService.getList({
      search: state.search,
      priority: state.priority,
      category: state.category,
      done: state.done,
    });
  }

  return { getState, setSearch, setPriority, setCategory, setDone, apply };
};
