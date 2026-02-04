import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  HomeDataService,
  HomeTourItem,
  HomeHotelItem,
  HomeDestinationItem,
  PhenomenalDealsData,
  TestimonialSectionData,
  TestimonialItem,
} from '../../services/home-data.service';
import type { HomeSliderItem } from '../../services/home-slider.service';

const DEFAULT_SLIDE: HomeSliderItem = {
  id: '0',
  imageUrl: 'assets/img/home1/home1-banner-img1.png',
  topname: 'United State',
  title: "Let's Travel And Explore Destination.",
  subtitle:
    "Life is unpredictable, and we understand that plans might change. Enjoy flexible booking options, so you can reschedule or modify your trip with ease.",
  sortOrder: 0,
};

const TESTIMONIAL_SLIDE: TestimonialItem[] = [
  { id: '0', personName: 'Morgane Huby', country: '', date: 'Sep 1, 2024', personRating: [1, 2, 3, 4, 5], personComment: 'A wonderful experience with this agency. We had the chance to meet and share moments with local families and to go and visit places where we felt Alon in the world! So amazing! Thanks to Asanka and his team for that unforgettable trip!', sortOrder: 0 },
  { id: '1', personName: 'julie coutarel', country: '', date: 'Jun 13, 2024', personRating: [1, 2, 3, 4, 5], personComment: 'Hello ! Insolite Lanka is a perfect agency for French and english people. Very secure. Very good team for our family. We travelled with a baby and 2 children 12 years old. And it s perfect for us. They understood what we need. Children loved Asanka! And us too.', sortOrder: 1 },
  { id: '2', personName: 'Jean-Claude Bruttin', country: '', date: 'Sep 18, 2025', personRating: [1, 2, 3, 4, 5], personComment: 'Magnifique voyage à la découverte du vrai Sri-Lanka. Quel bonheur d\'avoir choisi InsoliteLanka pour notre premier voyage au Sri-Lanka. Une équipe toujours disponible lors de la préparation de notre voyage, prête à répondre à toutes nos questions et en français. Leur connaissance du pays permet un voyage magnifique avec de nombreuses expériences et activités aussi bien culturelles, vie quotidienne des sri-lankais, nature et historique du Sri Lanka.', sortOrder: 2 },
  { id: '3', personName: 'Cyrille Pignol', country: '', date: 'Jul 28, 2025', personRating: [1, 2, 3, 4, 5], personComment: 'Nous avons fait une merveilleuse découverte du Sri lanka grâce aux choix des excursions des hôtels d Ansaka. Nous etions immergés dans la vie des cingalais loin des tumultes du tourisme. C était formidable ! Merci pour tous ces moments magiques.', sortOrder: 3 },
];

type SwiperInstance = { destroy?: () => void };

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bannerSlider') bannerSliderRef!: ElementRef<HTMLElement>;
  sliders: HomeSliderItem[] = [DEFAULT_SLIDE];
  phenomenalDeals: PhenomenalDealsData | null = null;
  testimonialSection: TestimonialSectionData | null = null;
  testimonials: TestimonialItem[] = TESTIMONIAL_SLIDE as TestimonialItem[];
  tours: HomeTourItem[] = [];
  bundlesTours: HomeTourItem[] = [];
  hotels: HomeHotelItem[] = [];
  destinations: HomeDestinationItem[] = [];
  private bannerSwiper: SwiperInstance | null = null;
  private tabSliders: SwiperInstance[] = [];
  private testimonialSliders: SwiperInstance[] = [];
  private swiperRetryId: ReturnType<typeof setInterval> | null = null;
  private testimonialTabListener: (() => void) | null = null;
  private routerSub: Subscription | null = null;

  constructor(
    private homeDataService: HomeDataService,
    private hostRef: ElementRef<HTMLElement>,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
    // Refetch when navigating back to home (component may be reused so ngOnInit won't run again)
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      filter(e => e.url === '/' || e.url === '')
    ).subscribe(() => this.loadHomeData());
  }

  private loadHomeData(): void {
    this.homeDataService.getHomePageData().subscribe(data => {
      this.sliders = (data.sliders?.length ? data.sliders : [DEFAULT_SLIDE]) as HomeSliderItem[];
      this.phenomenalDeals = data.phenomenalDeals ?? null;
      this.testimonialSection = data.testimonialSection ?? null;
      this.testimonials = data.testimonials?.length ? data.testimonials : TESTIMONIAL_SLIDE;
      this.tours = data.tours ?? [];
      this.bundlesTours = data.bundlesTours ?? [];
      this.hotels = data.hotels ?? [];
      this.destinations = data.destinations ?? [];
      this.cdr.detectChanges();
      if (this.sliders.length) {
        this.scheduleBannerSwiperInit();
      }
      // Re-init testimonial slider so it sees the correct number of slides (fixes 4+ testimonials)
      this.scheduleTestimonialSlidersInit();
    });
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    this.scheduleBannerSwiperInit();
    this.scheduleTabSlidersInit();
    this.scheduleTestimonialSlidersInit();
  }

  /** Run Swiper init after DOM is attached and laid out (fixes client-side navigation). */
  private scheduleBannerSwiperInit(): void {
    if (typeof window === 'undefined') return;
    this.clearSwiperRetry();
    this.bannerSwiper?.destroy?.();
    this.bannerSwiper = null;

    const runInit = () => {
      const el = this.getBannerElement();
      if (!el) return;
      this.initBannerSwiper(el);
    };

    // Wait for DOM to be in document and laid out: rAF + setTimeout so it works on route navigation
    requestAnimationFrame(() => {
      setTimeout(runInit, 150);
    });
  }

  private getBannerElement(): HTMLElement | null {
    const fromView = this.bannerSliderRef?.nativeElement;
    if (fromView && typeof document !== 'undefined' && document.contains(fromView)) return fromView;
    if (typeof document !== 'undefined') {
      return document.querySelector('.home1-banner-slider');
    }
    return null;
  }

  private initBannerSwiper(el: HTMLElement): void {
    if (typeof window === 'undefined') return;
    const win = window as unknown as {
      Swiper?: new (e: HTMLElement, o?: object) => { destroy?: () => void };
    };
    const SwiperConstructor = win.Swiper;
    if (SwiperConstructor) {
      this.createSwiper(el, SwiperConstructor);
      return;
    }
    let attempts = 0;
    this.swiperRetryId = setInterval(() => {
      if (typeof window === 'undefined') return;
      attempts++;
      const S = (window as unknown as { Swiper?: new (e: HTMLElement, o?: object) => { destroy?: () => void } }).Swiper;
      if (S) {
        this.clearSwiperRetry();
        this.createSwiper(el, S);
      } else if (attempts >= 30) {
        this.clearSwiperRetry();
      }
    }, 150);
  }

  private clearSwiperRetry(): void {
    if (this.swiperRetryId) {
      clearInterval(this.swiperRetryId);
      this.swiperRetryId = null;
    }
  }

  private createSwiper(
    el: HTMLElement,
    SwiperConstructor: new (e: HTMLElement, o?: object) => SwiperInstance
  ): void {
    this.bannerSwiper = new SwiperConstructor(el, {
      slidesPerView: 1,
      speed: 2500,
      spaceBetween: 25,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      loop: true,
      autoplay: { delay: 3000, disableOnInteraction: false },
      navigation: { nextEl: '.home1-banner-next', prevEl: '.home1-banner-prev' },
    });
  }

  /** Init all package-card-tab-slider instances (one per tab pane) after DOM is ready. */
  private scheduleTabSlidersInit(): void {
    if (typeof window === 'undefined') return;
    this.destroyTabSliders();
    requestAnimationFrame(() => {
      setTimeout(() => this.initPackageCardTabSliders(), 150);
    });
  }

  private initPackageCardTabSliders(): void {
    if (typeof window === 'undefined') return;
    const SwiperConstructor = (window as unknown as { Swiper?: new (e: HTMLElement, o?: object) => SwiperInstance }).Swiper;
    if (!SwiperConstructor) return;
    const host = this.hostRef?.nativeElement;
    if (!host) return;
    const sliderEls = host.querySelectorAll<HTMLElement>('.package-card-tab-slider');
    sliderEls.forEach(el => {
      const tabPane = el.closest('.tab-pane');
      const prevEl = tabPane?.querySelector<HTMLElement>('.package-card-tab-prev') ?? undefined;
      const nextEl = tabPane?.querySelector<HTMLElement>('.package-card-tab-next') ?? undefined;
      const instance = new SwiperConstructor(el, {
        slidesPerView: 1,
        speed: 1500,
        spaceBetween: 25,
        loop: true,
        autoplay: { delay: 2500, disableOnInteraction: false },
        navigation: prevEl && nextEl ? { nextEl, prevEl } : undefined,
        breakpoints: {
          280: { slidesPerView: 1 },
          386: { slidesPerView: 1 },
          576: { slidesPerView: 1, spaceBetween: 15 },
          768: { slidesPerView: 2, spaceBetween: 15 },
          992: { slidesPerView: 3, spaceBetween: 15 },
          1200: { slidesPerView: 3, spaceBetween: 15 },
          1400: { slidesPerView: 3 },
        },
      });
      this.tabSliders.push(instance);
    });
  }

  private destroyTabSliders(): void {
    this.tabSliders.forEach(s => s?.destroy?.());
    this.tabSliders = [];
  }

  /** Init testimonial-card-slider in the visible tab; one shared nav pair for the section. */
  private scheduleTestimonialSlidersInit(): void {
    if (typeof window === 'undefined') return;
    this.destroyTestimonialSliders();
    this.removeTestimonialTabListener();
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.initTestimonialSliders();
        this.attachTestimonialTabListener();
      }, 150);
    });
  }

  private initTestimonialSliders(): void {
    if (typeof window === 'undefined') return;
    const SwiperConstructor = (window as unknown as { Swiper?: new (e: HTMLElement, o?: object) => SwiperInstance }).Swiper;
    if (!SwiperConstructor) return;
    const host = this.hostRef?.nativeElement;
    if (!host) return;
    const visibleSlider = host.querySelector<HTMLElement>('.tab-pane.show.active .testimonial-card-slider');
    const prevEl = host.querySelector<HTMLElement>('.testimonial-card-tab-prev') ?? undefined;
    const nextEl = host.querySelector<HTMLElement>('.testimonial-card-tab-next') ?? undefined;
    if (!visibleSlider) return;
    // Only enable loop when we have enough slides (6+); otherwise loop duplicates cause layout bugs with 4–5 slides
    const slideCount = this.testimonials?.length ?? 0;
    const enableLoop = slideCount >= 6;
    const instance = new SwiperConstructor(visibleSlider, {
      slidesPerView: 1,
      speed: 1500,
      spaceBetween: 25,
      loop: enableLoop,
      loopAdditionalSlides: enableLoop ? 2 : 0,
      autoplay: slideCount > 1 ? { delay: 2500, disableOnInteraction: false } : false,
      navigation: prevEl && nextEl ? { nextEl, prevEl } : undefined,
      breakpoints: {
        280: { slidesPerView: 1 },
        386: { slidesPerView: 1 },
        576: { slidesPerView: 1, spaceBetween: 15 },
        768: { slidesPerView: 2, spaceBetween: 15 },
        992: { slidesPerView: 3, spaceBetween: 15 },
        1200: { slidesPerView: 3, spaceBetween: 15 },
        1400: { slidesPerView: 3 },
      },
    });
    this.testimonialSliders.push(instance);
  }

  private attachTestimonialTabListener(): void {
    const host = this.hostRef?.nativeElement;
    if (!host || typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#pills-tab')) return;
      this.destroyTestimonialSliders();
      requestAnimationFrame(() => setTimeout(() => this.initTestimonialSliders(), 50));
    };
    host.addEventListener('shown.bs.tab', handler);
    this.testimonialTabListener = () => host.removeEventListener('shown.bs.tab', handler);
  }

  private removeTestimonialTabListener(): void {
    this.testimonialTabListener?.();
    this.testimonialTabListener = null;
  }

  private destroyTestimonialSliders(): void {
    this.testimonialSliders.forEach(s => s?.destroy?.());
    this.testimonialSliders = [];
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.routerSub = null;
    this.clearSwiperRetry();
    this.bannerSwiper?.destroy?.();
    this.bannerSwiper = null;
    this.destroyTabSliders();
    this.removeTestimonialTabListener();
    this.destroyTestimonialSliders();
  }

  formatPrice(value: number): string {
    if (value == null || Number.isNaN(value)) return '$0';
    return '$' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  getStars(count: number): number[] {
    const n = Math.min(5, Math.max(0, Math.round(count)));
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  tourImageUrl(tour: HomeTourItem): string {
    return tour?.mainImageUrl ?? 'assets/img/home1/package-card-img1.png';
  }

  hotelImageUrls(hotel: HomeHotelItem): string[] {
    const urls: string[] = [];
    if (hotel?.mainImageUrl) urls.push(hotel.mainImageUrl);
    if (hotel?.imageUrls?.length) urls.push(...hotel.imageUrls);
    if (urls.length === 0) urls.push('assets/img/innerpage/room-img-01.jpg');
    return urls;
  }

  destinationImageUrl(dest: HomeDestinationItem): string {
    return dest?.mainImageUrl ?? 'assets/img/india.jpg';
  }
}
