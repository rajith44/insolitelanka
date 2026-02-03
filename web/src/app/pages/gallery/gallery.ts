import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GalleryService, GalleryPhoto } from '../../services/gallery.service';

@Component({
  selector: 'app-gallery',
  imports: [RouterLink],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery implements OnInit {
  private galleryService = inject(GalleryService);

  private cdr = inject(ChangeDetectorRef);

  loading = true;
  photos: GalleryPhoto[] = [];

  ngOnInit(): void {
    this.galleryService.getPhotos().subscribe(list => {
      this.photos = list ?? [];
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
}
