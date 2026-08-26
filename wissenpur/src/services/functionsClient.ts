import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { app, assertProtectedOnlineRuntimeReady } from '../firebase';

export const functions = getFunctions(app, 'europe-west1');
export const assertFunctionsClientReady = assertProtectedOnlineRuntimeReady;

const emulatorState = globalThis as typeof globalThis & {
  __WISSENPUR_SHARED_FUNCTIONS_EMULATOR_CONNECTED__?: boolean;
};

if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true' &&
  !emulatorState.__WISSENPUR_SHARED_FUNCTIONS_EMULATOR_CONNECTED__
) {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  emulatorState.__WISSENPUR_SHARED_FUNCTIONS_EMULATOR_CONNECTED__ = true;
}
