export class TeamSlider {
  private slider: HTMLElement;
  private prevBtn: HTMLButtonElement;
  private nextBtn: HTMLButtonElement;
  private slides: NodeListOf<HTMLElement>;
  private currentIndex: number = 0;
  private slidesToShow: number = 1;
  private maxIndex: number = 0;

  constructor(containerSelector: string) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      throw new Error(`Container with selector "${containerSelector}" not found`);
    }

    this.slider = container.querySelector('.team-slider') as HTMLElement;
    this.prevBtn = container.querySelector('.slider-nav-btn.prev') as HTMLButtonElement;
    this.nextBtn = container.querySelector('.slider-nav-btn.next') as HTMLButtonElement;
    this.slides = container.querySelectorAll('.team-slide');

    if (!this.slider || !this.prevBtn || !this.nextBtn || this.slides.length === 0) {
      throw new Error('Required slider elements not found');
    }

    this.init();
  }

  private init(): void {
    this.calculateSlidesToShow();
    this.bindEvents();
    this.updateSlider();
  }

  private calculateSlidesToShow(): void {
    this.slidesToShow = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    this.maxIndex = Math.max(0, this.slides.length - this.slidesToShow);
  }

  private updateSlider(): void {
    const slideWidth = this.slides[0].offsetWidth;
    this.slider.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;

    // Update button states
    this.prevBtn.disabled = this.currentIndex === 0;
    this.prevBtn.classList.toggle('opacity-50', this.currentIndex === 0);
    this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
    this.nextBtn.classList.toggle('opacity-50', this.currentIndex >= this.maxIndex);
  }

  private handleResize = (): void => {
    this.calculateSlidesToShow();

    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }

    this.updateSlider();
  }

  private bindEvents(): void {
    this.prevBtn.addEventListener('click', () => this.goToPrevious());
    this.nextBtn.addEventListener('click', () => this.goToNext());
    window.addEventListener('resize', this.handleResize);
  }

  private goToPrevious(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlider();
    }
  }

  private goToNext(): void {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
      this.updateSlider();
    }
  }

  public destroy(): void {
    window.removeEventListener('resize', this.handleResize);
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    new TeamSlider('#team');
  } catch (error) {
    console.error('Failed to initialize team slider:', error);
  }
});