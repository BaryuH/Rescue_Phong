/**
 * Rescue Phong - Cloud Transition & Input Locking System
 */
import { sound } from './audio';

export type TransitionState = 'idle' | 'closing' | 'holding' | 'opening';
export type TransitionVariant = 'default' | 'battle';

export interface TransitionPayload {
  state: TransitionState;
  label: string;
  variant: TransitionVariant;
  inputLocked: boolean;
}

type TransitionListener = (payload: TransitionPayload) => void;

class TransitionManager {
  private state: TransitionState = 'idle';
  private label: string = '';
  private variant: TransitionVariant = 'default';
  private inputLocked: boolean = false;
  private listeners: Set<TransitionListener> = new Set();

  public get isBusy(): boolean {
    return this.state !== 'idle';
  }

  public get isInputLocked(): boolean {
    return this.inputLocked;
  }

  public subscribe(listener: TransitionListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  public getSnapshot(): TransitionPayload {
    return {
      state: this.state,
      label: this.label,
      variant: this.variant,
      inputLocked: this.inputLocked,
    };
  }

  private wait(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Thực hiện chuyển cảnh mây chuẩn:
   * 1. Khóa thao tác input
   * 2. Chụm mây (500ms; battle: 300ms)
   * 3. Giữ mây, đổi cảnh + tải asset (tối thiểu 300ms)
   * 4. Tản mây ra (500ms; battle: 300ms)
   * 5. Mở khóa input
   */
  public async transitionTo(
    action: () => Promise<void> | void,
    label: string = '',
    variant: TransitionVariant = 'default'
  ): Promise<void> {
    if (this.isBusy) return;

    this.variant = variant;
    this.label = label;
    this.inputLocked = true;
    this.state = 'closing';
    this.notify();

    try {
      sound.playWhoosh();
      // 1. Pha chụm lại
      const closeTime = variant === 'battle' ? 300 : 550;
      await this.wait(closeTime);

      // 2. Pha giữ màn hình (tối thiểu 300ms trong lúc đổi cảnh)
      this.state = 'holding';
      this.notify();

      await Promise.all([
        Promise.resolve(action()),
        this.wait(350),
      ]);

      // 3. Pha tản ra
      this.state = 'opening';
      this.notify();

      const openTime = variant === 'battle' ? 300 : 550;
      await this.wait(openTime);
    } catch (err) {
      console.error('Error during scene transition:', err);
    } finally {
      // 4. Kết thúc và mở khóa (luôn luôn được thực thi)
      this.state = 'idle';
      this.label = '';
      this.inputLocked = false;
      this.notify();
    }
  }
}

export const transitionManager = new TransitionManager();
export const transitionTo = transitionManager.transitionTo.bind(transitionManager);
