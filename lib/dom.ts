export function originFromEvent(e: React.SyntheticEvent<HTMLElement>): { x: string; y: string } {
  const native = e.nativeEvent as MouseEvent;
  let x = native.clientX;
  let y = native.clientY;
  if (!x && !y) {
    const rect = e.currentTarget.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }
  return { x: `${(x / window.innerWidth) * 100}%`, y: `${(y / window.innerHeight) * 100}%` };
}
