const BRIDGE_IP = import.meta.env.VITE_BRIDGE_IP; 
const USERNAME = import.meta.env.VITE_USERNAME; 
const LIGHT_ID = import.meta.env.VITE_LIGHT_ID;

export async function setLightState(state) {
  const url = `http://${BRIDGE_IP}/api/${USERNAME}/lights/${LIGHT_ID}/state`;

  const res = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(state),
  });

  return await res.json();
}

export function turnOn() {
  return setLightState({ on: true, bri: 254, hue: 0, sat: 0 });
}

export function turnOff() {
  return setLightState({ on: false });
}

export function setColorHS(hue = 46920, sat = 254, bri = 254) {
  return setLightState({ on: true, hue, sat, bri });
}