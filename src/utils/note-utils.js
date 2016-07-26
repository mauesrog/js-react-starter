function getNoteWidth(titleLength) {
  let widthVal = 250;

  if (titleLength > 4) {
    for (let i = 0; i < titleLength - 4; i++) {
      widthVal += 10;
    }
  }

  return widthVal;
}

function getNotePosition(noteWidth) {
  const windowHeight = window.innerWidth * 40 / 100;

  const boundsWidth = [10, window.innerWidth - noteWidth - 12];
  const boundsHeight = [52, windowHeight - 262];

  const px = Math.floor(Math.random() * boundsWidth[1]) + boundsWidth[0];
  const py = Math.floor(Math.random() * boundsHeight[1]) + boundsHeight[0];

  return [px, py];
}

function convertHistoryToJSON(history, index) {
  console.log(history);
  return history;
}

const NoteUtils = {
  getNoteWidth,
  getNotePosition,
  convertHistoryToJSON,
};

export default NoteUtils;
