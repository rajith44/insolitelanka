import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WidgetModule } from './widget/widget.module';
import { PagetitleComponent } from './pagetitle/pagetitle.component';
import { MediaPickerComponent } from './media-picker/media-picker.component';

@NgModule({
  declarations: [
    PagetitleComponent,
    MediaPickerComponent
  ],
  imports: [
    CommonModule,
    WidgetModule
  ],
  exports: [PagetitleComponent, MediaPickerComponent]
})
export class SharedModule { }
