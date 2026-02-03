import { Component, OnInit, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MediaItem } from './media.model';
import { MediaService } from '../../core/services/media.service';
import { NotificationService } from '../../core/services/notification.service';
import type { MediaListResponse } from './media.model';

@Component({
  selector: 'app-media-picker',
  standalone: false,
  templateUrl: './media-picker.component.html',
  styleUrls: ['./media-picker.component.scss']
})
export class MediaPickerComponent implements OnInit {
  /** Set by MediaPickerService when opening the modal */
  multiple = false;
  /** Set by MediaPickerService: 'image' | 'video' | null */
  typeFilter: 'image' | 'video' | null = null;

  items: MediaItem[] = [];
  selected: MediaItem[] = [];
  loading = false;
  uploading = false;
  currentPage = 1;
  lastPage = 1;
  total = 0;
  pages: number[] = [];
  activeTab: 'all' | 'image' | 'video' = 'all';

  private activeModal = inject(NgbActiveModal);
  private mediaService = inject(MediaService);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading = true;
    const typeParam =
      this.activeTab === 'image' ? 'image' : this.activeTab === 'video' ? 'video' : undefined;
    this.mediaService
      .getList({ page, per_page: 24, type: typeParam })
      .subscribe((res: MediaListResponse) => {
        this.items = res.data;
        this.currentPage = res.meta.current_page;
        this.lastPage = res.meta.last_page;
        this.total = res.meta.total;
        this.pages = Array.from({ length: this.lastPage }, (_, i) => i + 1);
        this.loading = false;
      });
  }

  setTab(tab: 'all' | 'image' | 'video'): void {
    this.activeTab = tab;
    this.loadPage(1);
  }

  isSelected(item: MediaItem): boolean {
    return this.selected.some((s) => s.id === item.id);
  }

  toggle(item: MediaItem): void {
    const idx = this.selected.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      this.selected.splice(idx, 1);
    } else {
      if (this.multiple) {
        this.selected.push(item);
      } else {
        this.selected = [item];
      }
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;
    const fileList = Array.from(files).filter((f) => {
      const t = f.type?.split('/')[0];
      return t === 'image' || t === 'video';
    });
    if (!fileList.length) {
      this.notify.warning('Please select image or video files.');
      input.value = '';
      return;
    }
    this.uploading = true;
    this.mediaService.upload(fileList).subscribe((created: MediaItem[]) => {
      this.uploading = false;
      input.value = '';
      if (created?.length) {
        this.notify.success(`${created.length} file(s) uploaded`);
        this.items = [...created, ...this.items];
        this.total += created.length;
      }
    });
  }

  selectAndClose(): void {
    if (this.multiple) {
      this.activeModal.close(this.selected);
    } else {
      this.activeModal.close(this.selected.length ? this.selected[0] : null);
    }
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  isImage(item: MediaItem): boolean {
    return (item.type ?? '').startsWith('image/');
  }

  isVideo(item: MediaItem): boolean {
    return (item.type ?? '').startsWith('video/');
  }

  thumbUrl(item: MediaItem): string {
    if (!item.url) return '';
    if (this.isVideo(item)) {
      return item.url.replace(/\.(mp4|webm|mov|avi)$/i, '.jpg') || item.url;
    }
    return item.url;
  }
}
