"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroSlide = {
  alt: string;
  eyebrow?: string;
  href?: string;
  image: string;
  subtitle?: string;
  title?: string;
};

type HeroSliderProps = {
  autoplayMs?: number;
  navGap?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showText?: boolean;
  slides: HeroSlide[];
};

export function HeroSlider({
  slides,
  autoplayMs = 3500,
  navGap = 34,
  showArrows = true,
  showDots = false,
  showText = true,
}: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportKey, setViewportKey] = useState("desktop");

  useEffect(() => {
    const resolveViewportKey = () => {
      if (window.innerWidth <= 768) {
        return "mobile";
      }

      if (window.innerWidth <= 991) {
        return "tablet";
      }

      return "desktop";
    };

    const syncViewport = () => {
      setViewportKey((current) => {
        const next = resolveViewportKey();
        return current === next ? current : next;
      });
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [autoplayMs, slides.length]);

  useEffect(() => {
    if (activeIndex > slides.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [viewportKey]);

  return (
    <div className="hero-slider" data-viewport={viewportKey}>
      <div className="hero-slider-stage" key={viewportKey}>
        {slides.map((slide, index) => (
          <div
            key={`${slide.image}-${index}`}
            className={`hero-slide ${index === activeIndex ? "active" : ""}`}
            aria-hidden={index === activeIndex ? "false" : "true"}
          >
            {slide.href ? (
              <Link href={slide.href} className="hero-slide-link" aria-label={slide.title || slide.alt}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 900px) 100vw, 70vw"
                />
              </Link>
            ) : (
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 900px) 100vw, 70vw"
              />
            )}
          </div>
        ))}
      </div>

      <div className="hero-slider-controls" style={{ gap: `${navGap}px` }}>
        {showArrows ? (
          <button
            type="button"
            className="hero-slider-arrow"
            onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
          >
            ‹
          </button>
        ) : null}

        {showText && slides[activeIndex]?.title ? (
          <div className="hero-slide-copy">
            <strong className="hero-slide-title">{slides[activeIndex].title}</strong>
          </div>
        ) : null}

        {showArrows ? (
          <button
            type="button"
            className="hero-slider-arrow"
            onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
            aria-label="Next slide"
          >
            ›
          </button>
        ) : null}
      </div>

      {showDots && slides.length > 1 ? (
        <div className="hero-slider-dots" aria-label="Hero slider pagination">
          {slides.map((slide, index) => (
            <button
              key={`${slide.image}-dot-${index}`}
              type="button"
              className={`hero-slider-dot ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
