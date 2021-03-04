/* setting up vars.... */
let globalState = {};
let isRunning = false;
let updateTimePerTimer = 0;
const targetDiv = document.getElementById("target");

const timers = {
  globalUpdateRenders: {
    renderCount: 0,
    counted: 0,
    totalTime: 0,
    averageRenderTime: 0,
    rendersPerCount: 0,
  },
  selfUpdateRenders: {
    counted: 0,
    totalTime: 0,
    averageRenderTime: 0,
    renderCount: 0,
    rendersPerCount: 0,
  },
};
/* end Vars setup*/


// updates the timers (both self rendering and group rendering)...
const update = (props) => {
  let { stats, value, selfUpdate, elm, timerId } = props;
  const startTime = new Date();
  // if self updating, we will....
  // update the update the value, this will cause a reRender
  if (selfUpdate) {
    elm.innerHTML = `Timer ${timerId} : ${value}`;
    stats.renderCount = stats.renderCount + 1;
    props.value = props.value + 1;
    setTimeout( // set next update.
      () => isRunning && update({ ...props, elm }),
      updateTimePerTimer
    );
  } else {
    /// if it is not self updating, we will just create a new global state with new timer value.
    globalState = { ...globalState, [timerId]: globalState[timerId] + 1 };
  }
  // just some more calculations. we want to make this processor intensive..
  stats.counted = stats.counted + 1;
  const endTime = new Date();
  stats.totalTime = stats.totalTime + (endTime - startTime);
  stats.averageRenderTime = (stats.totalTime / stats.renderCount).toFixed(3);
  stats.rendersPerCount = (stats.renderCount / stats.counted).toFixed(3);
};

///Creates a timer...
const timer = (props) => {
  let { timerId, value, selfUpdate = false, stats } = props;
  ///creating element...
  const elm = document.createElement("div");
  elm.id = timerId;
  elm.innerHTML = `Timer ${timerId} : ${value}`;

  ///if self updating we will add to page.
  if (selfUpdate) {targetDiv.append(elm)};

  // set updates..
  setTimeout(() => isRunning && update({ ...props, elm }), updateTimePerTimer);

  // return created element
  return elm;
};

(function () {
  let prevGlobalState = globalState; // will tell us if state changed...
  // we will check every event loop if we have to update..
  setInterval(() => { 
    if (isRunning && prevGlobalState !== globalState) {
      const startTime = new Date();
      let { globalUpdateRenders: stats } = timers;
     
      // each time we re-render we will re create all the divs.
      const elmsToAppend = Object.entries(globalState).map(
        ([timerId, value]) => {
          return timer({ timerId, value, stats });
        }
      );
      targetDiv.innerHTML = "";
      targetDiv.append(...elmsToAppend);
      stats.renderCount = stats.renderCount + 1;
      const endTime = new Date();
      stats.totalTime = stats.totalTime + (endTime - startTime);
    }
    prevGlobalState = globalState;
  }, 0);
})();


/** helping and control functions... */

// updates stats on the page
const updateStats = () => {
    Object.entries(timers).forEach(([id, values]) => {
      const parent = document.getElementById(id);
      Object.entries(values).forEach(([stat, value]) => {
        parent.getElementsByClassName(stat)[0].innerHTML = value;
      });
    });
  };
  setInterval(updateStats, 200); // does not update often as to not take processor power
// end updating stats on the page



//creates a self rendering counter.....
let selfTimerId = 0;
const createSelfTimer = () => {
  timer({
    timerId: selfTimerId,
    value: 0,
    selfUpdate: true,
    stats: timers.selfUpdateRenders,
  });
  selfTimerId += 1;
};
// end create self rendering counter creation...

// created counters when go button is clicked....
const renderTimers = () => {
  //prep...
  const qty = document.getElementById("qty").value;
  const autoUpdate = !document.getElementById("isGlobal").checked;
  const duration = document.getElementById("duration").value;
  const button = document.getElementById("goButton");
  updateTimePerTimer = document.getElementById("countSpeed").value;
  
  //setting stuff....
  isRunning = true;
  button.disabled = true;
 // creating the counters.
  for (let i = 0; i < qty; i++) {
    if (autoUpdate) {
      createSelfTimer();
    } else {
      // to create a globally rendered counter, all we do is add it to state!
      // it will render on the next global render cycle, if state changed!
      globalState = { ...globalState, [i]: 0 };
    }
  }
  
  // sets the stop...
  setTimeout(() => {
    isRunning = false;
    button.disabled = false;
  }, duration * 1000);
};
/** end helping and control functions... */
