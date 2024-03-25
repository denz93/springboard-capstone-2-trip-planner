import bg1 from './assets/bg1.jpg';
import bg2 from './assets/bg2.jpg';
import bg3 from './assets/bg3.jpg';
import bg4 from './assets/bg4.jpg';
import bg5 from './assets/bg5.jpg';

const backgrounds = [bg1, bg2, bg3, bg4, bg5];
export function randomBackgroundUrl() {
  const randIdx = Math.floor(Math.random() * (backgrounds.length - 1));
  return backgrounds[randIdx]
}
