const removeFrameAndChildren = async (frame) => {
  if (frame.type === 'frame') {
    const children = await frame.getChildren();
    for (const child of children) {
      await removeFrameAndChildren(child);
    }
  }
  await miro.board.remove(frame);
};

export const deleteAllBoards = async () => {
  const title = 'Chess board';
  const frames = await miro.board.get({ type: 'frame' });

  for (const frame of frames) {
    if (frame.title === title) {
      await removeFrameAndChildren(frame);
    }
  }
};
