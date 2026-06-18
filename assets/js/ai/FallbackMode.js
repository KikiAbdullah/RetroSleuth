export const getFallbackResponse = (suspectId) => {
  const responses = [
    "Tersangka menatap Anda dengan dingin, tidak memberikan jawaban apa pun.",
    "Karakter tersebut hanya terdiam, seolah-olah menantang Anda dengan kebisuannya.",
    "Anda merasa ada yang salah dengan sistem komunikasi. Tersangka hanya bergumam tidak jelas.",
    "Tersangka memalingkan wajah, menolak untuk berbicara lebih lanjut."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};
