import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MediaPickerComponent } from '../../shared/media-picker/media-picker.component';
import { MediaItem } from '../../shared/media-picker/media.model';
import { MediaPickerConfig } from '../../shared/media-picker/media.model';

@Injectable({ providedIn: 'root' })
export class MediaPickerService {
  constructor(private modal: NgbModal) {}

  /**
   * Open the media library popup (WordPress-style).
   * @param config.multiple If true, user can select multiple items; otherwise single selection.
   * @param config.type Optional filter: 'image' | 'video'.
   * @returns Promise resolving to selected MediaItem (single) or MediaItem[] (multiple), or null if cancelled.
   */
  open(config: MediaPickerConfig = {}): Promise<MediaItem | MediaItem[] | null> {
    const ref = this.modal.open(MediaPickerComponent, {
      size: 'xl',
      windowClass: 'media-picker-modal-holder',
      modalDialogClass: 'modal-dialog-scrollable',
      centered: true,
      scrollable: true
    });
    ref.componentInstance.multiple = config.multiple ?? false;
    ref.componentInstance.typeFilter = config.type ?? null;
    return ref.result as Promise<MediaItem | MediaItem[] | null>;
  }

  /**
   * Open for single image selection. Resolves to one MediaItem or null.
   */
  openSingleImage(): Promise<MediaItem | null> {
    return this.open({ multiple: false, type: 'image' }).then((r) =>
      Array.isArray(r) ? (r.length ? r[0] : null) : r
    );
  }

  /**
   * Open for multiple image selection. Resolves to MediaItem[] or null.
   */
  openMultipleImages(): Promise<MediaItem[] | null> {
    return this.open({ multiple: true, type: 'image' }).then((r) =>
      r == null ? null : Array.isArray(r) ? r : [r]
    );
  }
}
