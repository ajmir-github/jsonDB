function tryAgain(callback, delay = 100) {
  // None-blocking approach.
  // It tries again and again untill callback returns true.
  return new Promise((resolve) => {
    const unsubscribe = setInterval(() => {
      const sucess = callback();
      if (!sucess) return;
      clearInterval(unsubscribe);
      resolve();
    }, delay);
  });
}

module.exports = {
  tryAgain,
};
