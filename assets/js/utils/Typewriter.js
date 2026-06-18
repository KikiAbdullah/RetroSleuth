export async function typewrite(element, text, speed = 30) {
  return new Promise(resolve => {
    let i = 0;
    let isSkipped = false;

    const skip = () => {
      isSkipped = true;
    };

    element.addEventListener('click', skip, { once: true });

    function step() {
      if (isSkipped) {
        element.innerHTML = text.replace(/\n/g, '<br>');
        element.removeEventListener('click', skip);
        resolve();
        return;
      }

      if (i < text.length) {
        const char = text.charAt(i);
        if (char === '\n') {
          element.innerHTML += '<br>';
        } else {
          element.innerHTML += char;
        }
        i++;
        setTimeout(() => requestAnimationFrame(step), speed);
      } else {
        element.removeEventListener('click', skip);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}
