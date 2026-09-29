import { Events } from 'phaser';

/**
 * EventBus kết nối 2 chiều giữa Phaser Scenes và React Components
 * Theo chuẩn template phaserjs/template-react-ts
 */
export const EventBus = new Events.EventEmitter();
