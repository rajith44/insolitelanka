import { Component, OnInit, inject } from '@angular/core';
import { GalleryItem } from '../gallery.model';
import { GalleryService } from '../gallery.service';
import { SwalService } from '../../../core/services/swal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-gallery-list',
  templateUrl: './gallery-list.component.html',
  styleUrls: ['./gallery-list.component.scss'],
  standalone: false
})
export class GalleryListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  items: GalleryItem[] = [];
  uploading = false;
  deletingId: string | null = null;

  private service = inject(GalleryService);
  private swal = inject(SwalService);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Settings' },
      { label: 'Gallery', active: true }
    ];
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe(list => {
      this.items = list ?? [];
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;
    const fileList = Array.from(files);
    this.uploading = true;
    this.service.upload(fileList).subscribe(created => {
      this.uploading = false;
      input.value = '';
      if (created?.length) {
        this.notify.success(`${created.length} photo(s) uploaded`);
        this.load();
      }
    });
  }

  onDelete(item: GalleryItem): void {
    this.swal.confirmDelete({
      title: 'Remove photo?',
      text: 'This will remove the photo from the gallery. This cannot be undone.'
    }).then(confirmed => {
      if (confirmed) {
        this.deletingId = item.id;
        this.service.delete(item.id).subscribe(success => {
          this.deletingId = null;
          if (success) {
            this.notify.success('Photo removed');
            this.load();
          }
        });
      }
    });
  }

  isDeleting(id: string): boolean {
    return this.deletingId === id;
  }
}
