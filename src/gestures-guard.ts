export const guardGestures = () => {
  ['touchmove', 'gesturestart'].forEach((event) => {
    window.addEventListener(
      event,
      (e) => e.preventDefault(),
      { passive: false },
    );
  });
};

guardGestures();
