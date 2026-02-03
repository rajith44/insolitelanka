import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { shareReplay } from 'rxjs';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private menuService = inject(MenuService);
  menu$ = this.menuService.getMenu().pipe(shareReplay(1));
}
