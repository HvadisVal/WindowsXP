import { setLightState } from '../../services/hueService';

export function updateStatus(text) {
  const el = document.getElementById('statusText');
  if (el) el.innerText = text;
}

export async function cycleColor(hueValue) {
  const color = {
    on: true,
    bri: 254,
    hue: hueValue,
    sat: 200,
    colormode: 'hs',
  };
  console.log('Changing color to:', color);
  await setLightState(color);
}