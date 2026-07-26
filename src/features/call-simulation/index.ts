/**
 * API pública de F5 · call-simulation.
 *
 * Única superficie por la que `closer-briefing` puede tocar esta feature
 * (aislamiento de features): nunca importa `ui/`, `model/` ni `api/` directo.
 */

export { CallOverlay, type CallOverlayProps } from './ui/call-overlay';
export { DifficultyPicker, type DifficultyPickerProps } from './ui/difficulty-picker';
