export function isDoubleTap(e) {
  let lastTap = 0;
  let tm;
  return function detectDoubleTap(e) {
    const curTime = new Date().getTime();
    const tapLen = curTime - lastTap;
    if (tapLen < 500 && tapLen > 0) {
      console.log('Double tapped!');
      e.preventDefault();
      return true;
    } else {
      tm = setTimeout(() => {
        clearTimeout(tm);
      }, 500);
    }
    lastTap = curTime;
    return false;
  };
}
