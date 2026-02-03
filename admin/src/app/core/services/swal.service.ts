import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class SwalService {

  /**
   * Show delete confirmation. Returns a Promise that resolves to true if user confirms, false otherwise.
   */
  confirmDelete(options: { title?: string; text?: string; confirmButtonText?: string; cancelButtonText?: string } = {}): Promise<boolean> {
    const {
      title = 'Are you sure?',
      text = 'You won\'t be able to revert this!',
      confirmButtonText = 'Yes, delete it!',
      cancelButtonText = 'Cancel'
    } = options;

    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f46a6a',
      cancelButtonColor: '#74788d',
      confirmButtonText,
      cancelButtonText
    }).then(result => Promise.resolve(!!result.isConfirmed));
  }

  success(title: string, text?: string): Promise<void> {
    return Swal.fire({ title, text, icon: 'success' }).then(() => undefined);
  }

  error(title: string, text?: string): Promise<void> {
    return Swal.fire({ title, text, icon: 'error' }).then(() => undefined);
  }
}
