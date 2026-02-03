import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Preloader } from './layout/preloader/preloader';
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, Footer, Preloader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
