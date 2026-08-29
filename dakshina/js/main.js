/* ==========================================================================
   Dakshina Tours & Travels — Shared Interactions
   ========================================================================== */
(function () {
  'use strict';

  /* ---- 1. Preloader ---- */
  var preloader = document.getElementById('preloader');
  if (preloader) {
    var minTime = 700;
    var start = Date.now();
    window.addEventListener('load', function () {
      var elapsed = Date.now() - start;
      var delay = Math.max(0, minTime - elapsed);
      setTimeout(function () {
        preloader.classList.add('hidden');
        document.body.classList.remove('is-preloading');
        setTimeout(function () { preloader.remove(); }, 800);
      }, delay);
    });
    setTimeout(function () {
      if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
        document.body.classList.remove('is-preloading');
        setTimeout(function () { preloader.remove(); }, 800);
      }
    }, 4000);
  }

  /* ---- 2. Navbar scroll state + parallax ---- */
  var nav = document.getElementById('navbar');
  var heroSlider = document.querySelector('.hero .hero-slider');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    var toTop = document.getElementById('toTop');
    if (toTop) toTop.classList.toggle('show', y > 600);
    if (heroSlider && y < window.innerHeight * 1.2) {
      heroSlider.style.transform = 'translateY(' + y * 0.16 + 'px)';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- 2b. Hero background slider ---- */
  var heroRoot = document.querySelector('.hero, .page-hero');
  if (heroRoot) {
    var hSlides = Array.prototype.slice.call(heroRoot.querySelectorAll('.hero-slide'));
    var hDotsWrap = heroRoot.querySelector('.hero-slider-nav');
    var hDots = [];
    var hIndex = 0;
    var hTimer = null;
    var heroContentStart = heroRoot.querySelector('.hero-content:not(.hero-content-end)');
    var heroContentEnd = heroRoot.querySelector('.hero-content-end');
    var isPageHero = heroRoot.classList.contains('page-hero');
    function heroGo(i) {
      hIndex = (i + hSlides.length) % hSlides.length;
      hSlides.forEach(function (s, k) {
        s.classList.toggle('is-active', k === hIndex);
        if (hDots[k]) hDots[k].classList.toggle('is-active', k === hIndex);
      });
      if (heroContentStart) {
        var isFirst = hIndex === 0;
        if (isPageHero) {
          heroContentStart.style.display = isFirst ? '' : 'none';
        } else if (heroContentEnd) {
          var isLast = hIndex === hSlides.length - 1;
          heroContentStart.style.display = isFirst ? '' : 'none';
          heroContentEnd.style.display = isLast ? '' : 'none';
        }
      }
    }
    function heroRestart() {
      if (hSlides.length < 2) return;
      clearInterval(hTimer);
      hTimer = setInterval(function () { heroGo(hIndex + 1); }, 4000);
    }
    if (hSlides.length > 1) {
      hSlides.forEach(function (_, k) {
        var d = document.createElement('button');
        d.className = 'hero-dot';
        d.setAttribute('aria-label', 'Go to slide ' + (k + 1));
        d.addEventListener('click', function () { heroGo(k); heroRestart(); });
        if (hDotsWrap) hDotsWrap.appendChild(d);
        hDots.push(d);
      });
      var hPrev = heroRoot.querySelector('.hero-arrow.prev');
      var hNext = heroRoot.querySelector('.hero-arrow.next');
      if (hPrev) hPrev.addEventListener('click', function () { heroGo(hIndex - 1); heroRestart(); });
      if (hNext) hNext.addEventListener('click', function () { heroGo(hIndex + 1); heroRestart(); });
      heroRoot.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { heroGo(hIndex - 1); heroRestart(); }
        if (e.key === 'ArrowRight') { heroGo(hIndex + 1); heroRestart(); }
      });
      heroRoot.setAttribute('tabindex', '0');
    }
    heroGo(0);
    heroRestart();
  }

  /* ---- 3. Mobile menu ---- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  function toggleMenu(force) {
    var open = typeof force === 'boolean' ? force : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () { toggleMenu(); });
    navMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggleMenu(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { toggleMenu(false); closeLightbox(); }
  });

  /* ---- 4. Reveal on scroll ---- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- 5. Counters ---- */
  var counters = document.querySelectorAll('[data-counter]');
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (el.getAttribute('data-decimals') || '0');
    var dur = 1800;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      el.textContent = val.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-counter') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---- 6. Testimonial slider ---- */
  var testiSlider = document.getElementById('testiSlider');
  if (testiSlider) {
    var slides = Array.prototype.slice.call(testiSlider.querySelectorAll('.testi-slide'));
    var dotsWrap = testiSlider.querySelector('.testi-dots');
    var dots = [];
    var index = 0;
    var timer = null;
    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.style.display = k === index ? '' : 'none';
        if (dots[k]) dots[k].classList.toggle('active', k === index);
      });
      testiSlider.setAttribute('aria-label', 'Testimonial ' + (index + 1) + ' of ' + slides.length);
    }
    slides.forEach(function (_, k) {
      var d = document.createElement('button');
      d.className = 'testi-dot';
      d.setAttribute('aria-label', 'Go to testimonial ' + (k + 1));
      d.addEventListener('click', function () { go(k); restart(); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });
    var prev = document.getElementById('testiPrev');
    var next = document.getElementById('testiNext');
    if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(index + 1); restart(); });
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 7000);
    }
    testiSlider.addEventListener('mouseenter', function () { clearInterval(timer); });
    testiSlider.addEventListener('mouseleave', restart);
    go(0);
    restart();
  }

  /* ---- 7. FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!open) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- 8. Package filter (packages page) ---- */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var pkgCards = document.querySelectorAll('.package-grid .package-card');
  var pkgSearch = document.getElementById('pkgSearch');
  var pkgSearchBtn = document.getElementById('pkgSearchBtn');
  var noResults = document.getElementById('noResults');
  function applyFilter() {
    var active = document.querySelector('.chip.active');
    var f = active ? active.getAttribute('data-filter') : 'all';
    var q = pkgSearch ? pkgSearch.value.trim().toLowerCase() : '';
    var visible = 0;
    pkgCards.forEach(function (card) {
      var cats = (card.getAttribute('data-category') || '').split(' ');
      var matchCat = f === 'all' || cats.indexOf(f) !== -1;
      var text = card.textContent.toLowerCase();
      var matchQ = !q || text.indexOf(q) !== -1;
      var show = matchCat && matchQ;
      card.style.display = show ? '' : 'none';
      if (show) { visible++; card.classList.add('is-visible'); }
    });
    if (noResults) noResults.hidden = visible > 0;
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      applyFilter();
    });
  });
  if (pkgSearch) pkgSearch.addEventListener('input', applyFilter);
  if (pkgSearchBtn) pkgSearchBtn.addEventListener('click', applyFilter);

  /* ---- 9. Gallery lightbox ---- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = lightbox ? lightbox.querySelector('.lightbox-media') : null;
  var lbCap = lightbox ? lightbox.querySelector('.lightbox-cap') : null;
  function openLightbox(src, cap) {
    if (!lightbox) return;
    lbImg.innerHTML = '<img src="' + src + '" alt="' + (cap || '') + '" loading="lazy">';
    lbCap.textContent = cap || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var img = item.querySelector('img, svg');
      var cap = item.querySelector('.gallery-cap');
      openLightbox(img.getAttribute('src'), cap ? cap.querySelector('b').textContent : '');
    });
  });
  if (lightbox) {
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  }
  window.closeLightbox = closeLightbox;

  /* ---- 10. Forms (demo submission) ---- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('[type="submit"]');
      var orig = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(function () {
        var msg = form.querySelector('.form-success');
        btn.textContent = orig;
        btn.disabled = false;
        form.reset();
        if (msg) { msg.style.display = 'flex'; setTimeout(function () { msg.style.display = 'none'; }, 6000); }
      }, 1200);
    });
  });

  /* ---- 11. Active nav link highlight ---- */
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-nav]').forEach(function (a) {
    if (a.getAttribute('data-nav') === path) a.classList.add('active');
  });

  /* ---- 12. Toast (welcome / promo) ---- */
  var toast = document.getElementById('promoToast');
  if (toast && !localStorage.getItem('mt-toast-seen')) {
    setTimeout(function () { toast.classList.add('show'); }, 3800);
    var close = toast.querySelector('.t-close');
    if (close) close.addEventListener('click', function () {
      toast.classList.remove('show');
      localStorage.setItem('mt-toast-seen', '1');
    });
  }

  /* ---- 13. Contact page: prefill destination from query ---- */
  var params = new URLSearchParams(window.location.search);
  var dest = params.get('tour');
  if (dest && document.getElementById('fDestination')) {
    var sel = document.getElementById('fDestination');
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === dest) { sel.value = dest; break; }
    }
  }

  /* ---- 14. Tour package details modal ---- */
  var pkgData = {
    'india-pur': {
      title: 'India Pur — India Tour',
      sub: '3–15 Days · Pilgrimage · Fully Customizable',
      items: [
        'Tirupati Balaji & sacred temple darshan',
        'Northern India Tour — Varanasi · Ayodhya · Prayagraj',
        'Char Dham Yatra — Gangotri · Yamunotri · Kedarnath · Badrinath',
        'Haridwar & Rishikesh spiritual circuits',
        'Hotels, transport & guided sightseeing included'
      ]
    },
    'nepal-pur': {
      title: 'Nepal Pur — Nepal Tour',
      sub: '3–15 Days · Pilgrimage · Fully Customizable',
      items: [
        'Kathmandu · Pokhara · Manakamana — 4N/5D',
        'Kathmandu · Pokhara · Manakamana · Muktinath — 5N/6D',
        'Kathmandu · Pokhara · Manakamana · Muktinath · Lumbini · Chitwan · Janakpur — 8N/9D',
        'Manang Tour — 3N/4D',
        'Pokhara · Ghandruk · Muktinath · Kathmandu — 6N/7D',
        'Annapurna Base Camp · Everest Base Camp · Mardi Himal · Langtang treks',
        'Kailash Mansarovar Yatra — helicopter & overland options'
      ]
    },
    'nepal-kathmandu-pokhara': {
      title: 'Kathmandu-Pokhara Circuit',
      sub: '4N/5D · Cultural Tour',
      items: [
        'Day 1: Arrival in Kathmandu — airport transfer & hotel check-in',
        'Day 2: Kathmandu sightseeing — Pashupatinath, Boudhanath, Swayambhunath',
        'Day 3: Drive to Pokhara — Manakamana Cable Car en route',
        'Day 4: Pokhara sightseeing — Phewa Lake, World Peace Pagoda, Davis Falls',
        'Day 5: Return to Kathmandu — departure transfer'
      ]
    },
    'nepal-muktinath-yatra': {
      title: 'Muktinath Yatra',
      sub: '5N/6D · Pilgrimage',
      items: [
        'Day 1: Arrival in Kathmandu — Pashupatinath darshan',
        'Day 2: Fly to Pokhara — Pokhara Valley sightseeing',
        'Day 3: Drive to Jomsom via Kali Gandaki Valley',
        'Day 4: Muktinath Temple darshan — sacred 108 water spouts',
        'Day 5: Return to Pokhara — Tatopani hot springs en route',
        'Day 6: Fly back to Kathmandu — departure'
      ]
    },
    'nepal-chitwan': {
      title: 'Chitwan National Park',
      sub: '3N/4D · Wildlife & Nature',
      items: [
        'Day 1: Arrival in Chitwan — check-in at jungle lodge',
        'Day 2: Full-day jungle safari — rhinoceros, elephants, deer',
        'Day 3: Canoe ride on Rapti River — bird watching & Tharu cultural program',
        'Day 4: Elephant breeding center visit — departure'
      ]
    },
    'nepal-lumbini': {
      title: 'Lumbini Tour',
      sub: '2N/3D · Pilgrimage',
      items: [
        'Day 1: Drive from Kathmandu to Lumbini — evening meditation at Sacred Garden',
        'Day 2: Maya Devi Temple, Ashoka Pillar, Monastic Zone — world monastery tour',
        'Day 3: World Peace Flame & departure'
      ]
    },
    'nepal-langtang': {
      title: 'Langtang Valley Trek',
      sub: '7N/8D · Adventure Trek',
      items: [
        'Day 1: Drive to Syabrubesi from Kathmandu',
        'Day 2: Trek to Lama Hotel through Langtang Forest',
        'Day 3: Trek to Langtang Village',
        'Day 4: Trek to Kyanjin Gompa — monastery & cheese factory',
        'Day 5: Explore Kyanjin Ri viewpoint — Langtang Lirung panorama',
        'Day 6: Return trek to Lama Hotel',
        'Day 7: Trek back to Syabrubesi',
        'Day 8: Drive back to Kathmandu'
      ]
    },
    'nepal-annapurna': {
      title: 'Annapurna Base Camp Trek',
      sub: '10N/11D · Adventure Trek',
      items: [
        'Day 1: Fly to Pokhara — drive to Nayapul, trek to Tikhedhunga',
        'Day 2: Trek to Ghorepani — Poon Hill sunrise views',
        'Day 3: Trek to Tadapani — Annapurna South views',
        'Day 4: Trek to Chhomrong — Gurung village',
        'Day 5: Trek to Bamboo through bamboo forests',
        'Day 6: Trek to Deurali — Annapurna Base Camp approach',
        'Day 7: Trek to Annapurna Base Camp (4,130m) — 360° Himalayan panorama',
        'Day 8: Return trek to Bamboo',
        'Day 9: Trek to Jhinu — natural hot springs',
        'Day 10: Drive to Pokhara — Pokhara sightseeing',
        'Day 11: Fly back to Kathmandu'
      ]
    },
    'nepal-ebc': {
      title: 'Everest Base Camp Trek',
      sub: '13N/14D · Adventure Trek',
      items: [
        'Day 1: Fly to Lukla — trek to Phakding',
        'Day 2: Trek to Namche Bazaar — Everest first views',
        'Day 3: Acclimatization day in Namche — Everest View Hotel hike',
        'Day 4: Trek to Tengboche — Tengboche Monastery',
        'Day 5: Trek to Dingboche — Ama Dablam views',
        'Day 6: Acclimatization day — Nagarjun Hill hike',
        'Day 7: Trek to Lobuche — Khumbu Glacier views',
        'Day 8: Trek to Gorak Shep — Everest Base Camp (5,364m)',
        'Day 9: Kala Patthar sunrise — Everest, Lhotse, Nuptse panorama',
        'Day 10: Return trek to Tengboche',
        'Day 11: Trek to Monjo',
        'Day 12: Trek back to Lukla',
        'Day 13: Fly back to Kathmandu',
        'Day 14: Departure day'
      ]
    },
    'nepal-upper-mustang': {
      title: 'Upper Mustang Jeep Tour',
      sub: '8N/9D · Adventure & Culture',
      items: [
        'Day 1: Fly to Pokhara — drive to Jomsom',
        'Day 2: Drive to Kagbeni — gateway to Upper Mustang',
        'Day 3: Drive to Chele — windy canyons & red cliffs',
        'Day 4: Drive to Ghami — ancient monasteries',
        'Day 5: Drive to Tsarang — Tsarang Monastery & fort',
        'Day 6: Drive to Lo Manthang — Forbidden Kingdom',
        'Day 7: Explore Lo Manthang — royal palace, caves & Buddhist sites',
        'Day 8: Return drive to Jomsom',
        'Day 9: Fly back to Pokhara — departure'
      ]
    },
    'nepal-kailash': {
      title: 'Kailash Mansarovar Yatra',
      sub: '10N/11D · Spiritual Journey',
      items: [
        'Day 1: Arrive in Kathmandu — temple visits & briefing',
        'Day 2: Fly to Nepalgunj',
        'Day 3: Fly to Simikot / Drive to Tatopani',
        'Day 4: Cross border — proceed to Mansarovar Lake',
        'Day 5: Mansarovar Lake parikrama & holy dip',
        'Day 6: Drive to Darchen — base of Mount Kailash',
        'Day 7: Kailash Parikrama — Diraphuk (5,108m)',
        'Day 8: Cross Dolma La Pass (5,636m) — Zuthulphuk',
        'Day 9: Return to Darchen — complete parikrama',
        'Day 10: Drive back to Kathmandu via border',
        'Day 11: Departure from Kathmandu'
      ]
    },
    'nepal-janakpur': {
      title: 'Janakpur Tour',
      sub: '1N/2D · Pilgrimage',
      items: [
        'Day 1: Drive from Kathmandu to Janakpur — Janaki Mandir & Ram-Sita Vivah Mandap',
        'Day 2: Dhanush Sagar & Ganga Sagar ponds — sacred bathing ghats — departure'
      ]
    },
    'nepal-manang': {
      title: 'Manang Tour',
      sub: '3N/4D · Cultural & Nature',
      items: [
        'Day 1: Drive from Kathmandu to Chame — Marsyangdi River valley',
        'Day 2: Drive to Manang — Braga Monastery (500-year-old gompa)',
        'Day 3: Ice Lake & Gangapurna Lake trek — mountain views',
        'Day 4: Return drive to Kathmandu'
      ]
    },
    'nepal-annapurna-circuit': {
      title: 'Annapurna Circuit Trek',
      sub: '12N/13D · Adventure Trek',
      items: [
        'Day 1: Drive to Besisahar — start of circuit',
        'Day 2: Trek to Bahundanda — subtropical forests',
        'Day 3: Trek to Chamje — waterfalls & suspension bridges',
        'Day 4: Trek to Dharapani — Manang district',
        'Day 5: Trek to Chame — apple orchards & pine forests',
        'Day 6: Trek to Upper Pisang — Annapurna II views',
        'Day 7: Trek to Manang — Braga Monastery',
        'Day 8: Acclimatization in Manang — Ice Lake trek',
        'Day 9: Trek to Thorong Phedi — base of Thorong La',
        'Day 10: Cross Thorong La Pass (5,416m) — world\'s highest trekking pass',
        'Day 11: Trek to Muktinath — sacred temple',
        'Day 12: Drive to Jomsom — Kali Gandaki Valley',
        'Day 13: Fly back to Pokhara — departure'
      ]
    },
    'india-golden-triangle': {
      title: 'Golden Triangle Tour',
      sub: '5N/6D · Cultural Heritage',
      items: [
        'Day 1: Arrival in Delhi — Red Fort, Jama Masjid, Chandni Chowk',
        'Day 2: Delhi sightseeing — Qutub Minar, Humayun Tomb, India Gate',
        'Day 3: Drive to Agra — Agra Fort & Mehtab Bagh sunset',
        'Day 4: Taj Mahal sunrise — drive to Jaipur via Fatehpur Sikri',
        'Day 5: Jaipur — Amber Fort, City Palace, Hawa Mahal, Jantar Mantar',
        'Day 6: Departure from Jaipur'
      ]
    },
    'india-char-dham': {
      title: 'Char Dham Yatra',
      sub: '10N/11D · Pilgrimage',
      items: [
        'Day 1: Arrival in Dehradun — drive to Barkot',
        'Day 2: Yamunotri trek — Yamuna River origin',
        'Day 3: Drive to Uttarkashi — Kashi Vishwanath Temple',
        'Day 4: Gangotri — sacred Ganges River source',
        'Day 5: Drive to Guptkashi',
        'Day 6: Kedarnath trek — one of 12 Jyotirlingas',
        'Day 7: Return to Guptkashi',
        'Day 8: Drive to Badrinath — holy abode of Lord Vishnu',
        'Day 9: Badrinath darshan — Mana Village & Vyas Gufa',
        'Day 10: Drive to Rudraprayag',
        'Day 11: Return to Dehradun — departure'
      ]
    },
    'india-varanasi-ayodhya': {
      title: 'Varanasi & Ayodhya Tour',
      sub: '4N/5D · Spiritual Journey',
      items: [
        'Day 1: Arrival in Varanasi — evening Ganga Aarti at Dashashwamedh Ghat',
        'Day 2: Kashi Vishwanath Temple — Sarnath visit — evening boat ride',
        'Day 3: Drive to Ayodhya — Ram Mandir, Hanuman Garhi',
        'Day 4: Ayodhya sightseeing — Kanak Bhawan, Nageshwarnath Temple',
        'Day 5: Return to Varanasi — departure'
      ]
    },
    'india-rajasthan': {
      title: 'Rajasthan Heritage Tour',
      sub: '7N/8D · Cultural Heritage',
      items: [
        'Day 1: Arrive in Jaipur — Pink City evening',
        'Day 2: Jaipur — Amber Fort, City Palace, Hawa Mahal',
        'Day 3: Drive to Udaipur — City Palace visit',
        'Day 4: Udaipur — Lake Pichola boat ride, Jag Mandir, Saheliyon ki Bari',
        'Day 5: Drive to Jodhpur — Mehrangarh Fort',
        'Day 6: Jodhpur — Jaswant Thada, blue city walk',
        'Day 7: Drive to Jaisalmer — Jaisalmer Fort',
        'Day 8: Sam Sand Dunes desert safari — departure'
      ]
    },
    'india-kerala': {
      title: 'Kerala Backwaters Tour',
      sub: '5N/6D · Nature & Relaxation',
      items: [
        'Day 1: Arrival in Trivandrum — drive to Kovalam Beach',
        'Day 2: Kovalam — Padmanabhaswamy Temple, Lighthouse Beach',
        'Day 3: Drive to Alleppey — houseboat check-in',
        'Day 4: Alleppey backwater cruise — paddy fields & villages',
        'Day 5: Drive to Munnar — tea plantations',
        'Day 6: Munnar — Eravikulam National Park, tea factory — departure'
      ]
    },
    'india-ladakh': {
      title: 'Ladakh Adventure Tour',
      sub: '7N/8D · Adventure & Nature',
      items: [
        'Day 1: Fly to Leh — acclimatization',
        'Day 2: Leh Palace, Shanti Stupa, local market',
        'Day 3: Drive to Nubra Valley via Khardung La (5,359m)',
        'Day 4: Nubra Valley — double-humped camel safari at Hunder',
        'Day 5: Drive to Pangong Tso Lake',
        'Day 6: Pangong Lake morning — drive back to Leh',
        'Day 7: Magnetic Hill, Gurudwara Pathar Sahib, Hall of Fame',
        'Day 8: Departure from Leh'
      ]
    },
    'india-kashmir': {
      title: 'Kashmir Paradise Tour',
      sub: '5N/6D · Nature & Culture',
      items: [
        'Day 1: Fly to Srinagar — Dal Lake shikara ride',
        'Day 2: Mughal Gardens — Nishat, Shalimar, Chashme Shahi',
        'Day 3: Drive to Gulmarg — Gondola ride & meadows',
        'Day 4: Drive to Pahalgam — Valley of Shepherds',
        'Day 5: Pahalgam — Aru Valley & Betaab Valley',
        'Day 6: Return to Srinagar — departure'
      ]
    },
    'india-tirupati': {
      title: 'Tirupati Balaji Darshan',
      sub: '2N/3D · Pilgrimage',
      items: [
        'Day 1: Drive from Trivandrum to Tirupati — Sri Padmavathi Temple',
        'Day 2: Tirumala Venkateswara Temple — special darshan',
        'Day 3: Govindaraja Swamy Temple — return to Trivandrum'
      ]
    },
    'india-goa': {
      title: 'Goa Beach Tour',
      sub: '4N/5D · Beach & Leisure',
      items: [
        'Day 1: Arrival in Goa — North Goa beaches (Baga, Calangute)',
        'Day 2: North Goa — Anjuna Flea Market, Chapora Fort, Vagator Beach',
        'Day 3: South Goa — Palolem Beach, Colva, Benaulim',
        'Day 4: Basilica of Bom Jesus, Se Cathedral — spice plantation tour',
        'Day 5: Departure from Goa'
      ]
    },
    'intl-bali': {
      title: 'Bali, Indonesia',
      sub: '5N/6D · Beach & Culture',
      items: [
        'Day 1: Arrival in Bali — transfer to hotel — Kuta Beach evening',
        'Day 2: Kintamani — Mount Batur volcano & lake views — Ubud Monkey Forest',
        'Day 3: Ubud — Tegallalang rice terraces, Tirta Empul water temple',
        'Day 4: Tanah Lot & Uluwatu temples — Kecak fire dance',
        'Day 5: Seminyak Beach — water sports — spa treatment',
        'Day 6: Departure from Bali'
      ]
    },
    'intl-srilanka': {
      title: 'Sri Lanka',
      sub: '5N/6D · Culture & Nature',
      items: [
        'Day 1: Arrive in Colombo — Gangaramaya Temple, Independence Square',
        'Day 2: Drive to Kandy — Temple of the Tooth Relic',
        'Day 3: Kandy — Royal Botanical Gardens, cultural show',
        'Day 4: Drive to Nuwara Eliya — tea plantations & waterfalls',
        'Day 5: Drive to Bentota — beach & river safari',
        'Day 6: Return to Colombo — departure'
      ]
    },
    'intl-dubai': {
      title: 'Dubai, UAE',
      sub: '4N/5D · Luxury & Adventure',
      items: [
        'Day 1: Arrive in Dubai — hotel check-in — Dubai Mall & Burj Khalifa',
        'Day 2: Half-day Dubai city tour — Dubai Museum, Gold Souk, Spice Souk',
        'Day 3: Desert safari — dune bashing, camel ride, BBQ dinner & cultural show',
        'Day 4: Free day — Palm Jumeirah, Atlantis, or shopping',
        'Day 5: Dhow cruise dinner at Dubai Marina — departure'
      ]
    },
    'intl-thailand': {
      title: 'Thailand',
      sub: '5N/6D · Beach & Culture',
      items: [
        'Day 1: Arrive in Bangkok — transfer to Pattaya',
        'Day 2: Coral Island tour — snorkeling, water sports & lunch',
        'Day 3: Drive to Bangkok — half-day city tour — Wat Pho & Wat Arun',
        'Day 4: Fly to Phuket — Phi Phi Island tour with lunch',
        'Day 5: Phuket — Patong Beach, Big Buddha, Old Town',
        'Day 6: Departure from Bangkok'
      ]
    },
    'intl-singapore': {
      title: 'Singapore',
      sub: '3N/4D · City & Adventure',
      items: [
        'Day 1: Arrive in Singapore — Marina Bay Sands, Gardens by the Bay',
        'Day 2: Sentosa Island — Universal Studios & S.E.A. Aquarium',
        'Day 3: Singapore Zoo — night safari — Chinatown & Little India',
        'Day 4: Orchard Road shopping — Merlion Park — departure'
      ]
    },
    'intl-maldives': {
      title: 'Maldives',
      sub: '4N/5D · Beach & Luxury',
      items: [
        'Day 1: Arrive in Maldives — overwater bungalow check-in',
        'Day 2: Snorkeling & scuba diving — coral reef exploration',
        'Day 3: Sunset dolphin cruise — island hopping',
        'Day 4: Spa treatments — private beach dinner',
        'Day 5: Departure from Maldives'
      ]
    },
    'intl-mauritius': {
      title: 'Mauritius',
      sub: '4N/5D · Beach & Nature',
      items: [
        'Day 1: Arrive in Mauritius — beach resort check-in',
        'Day 2: Île aux Cerfs — pristine beach & water sports',
        'Day 3: Chamarel — Seven Coloured Earth & Chamarel Waterfall',
        'Day 4: Port Louis — Central Market — Pamplemousses Botanical Garden',
        'Day 5: Casela Nature Park — departure'
      ]
    },
    'intl-malaysia': {
      title: 'Malaysia',
      sub: '5N/6D · City & Nature',
      items: [
        'Day 1: Arrive in Kuala Lumpur — Petronas Towers & KL Tower',
        'Day 2: Batu Caves — Central Market — Jalan Alor food street',
        'Day 3: Drive to Genting Highlands — theme parks & cable car',
        'Day 4: Fly to Langkawi — duty-free island',
        'Day 5: Langkawi Sky Bridge — Langkawi Cable Car — beach',
        'Day 6: Fly to Malacca — UNESCO heritage city — departure'
      ]
    }
  };
  var pkgModal = document.getElementById('pkgModal');
  if (pkgModal) {
    var pkgTitle = document.getElementById('pkgModalTitle');
    var pkgSub = document.getElementById('pkgModalSub');
    var pkgBody = document.getElementById('pkgModalBody');

    function pkgOpen(tour) {
      var d = pkgData[tour];
      if (!d) return;
      pkgTitle.textContent = d.title;
      pkgSub.textContent = d.sub;
      pkgBody.innerHTML = '';
      var ul = document.createElement('ul');
      ul.className = 'pkg-modal-list';
      d.items.forEach(function (it) {
        var li = document.createElement('li');
        li.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
        li.appendChild(document.createTextNode(it));
        ul.appendChild(li);
      });
      pkgBody.appendChild(ul);
      pkgModal.hidden = false;
      document.body.style.overflow = 'hidden';
      var closeBtn = pkgModal.querySelector('.pkg-modal-close');
      if (closeBtn) closeBtn.focus();
    }

    function pkgClose() {
      pkgModal.hidden = true;
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.js-pkg-details') : null;
      if (btn) {
        var card = btn.closest('[data-tour]');
        if (card) pkgOpen(card.getAttribute('data-tour'));
        return;
      }
      if (e.target.closest && e.target.closest('[data-pkg-close]')) pkgClose();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !pkgModal.hidden) pkgClose();
    });
  }

  /* ---- 15. Package search & filter ---- */
  var pkgSearch = document.getElementById('pkgSearch');
  var pkgSearchClear = document.getElementById('pkgSearchClear');
  var pkgFilterRow = document.getElementById('pkgFilterRow');
  var pkgSearchCount = document.getElementById('pkgSearchCount');
  if (pkgSearch) {
    var allCards = document.querySelectorAll('.package-card[data-tour]');
    var allSections = document.querySelectorAll('.section[id$="-tours"], #international-tours');
    var activeFilter = 'all';

    function filterPackages() {
      var q = pkgSearch.value.toLowerCase().trim();
      var visible = 0;
      allCards.forEach(function (card) {
        var tour = card.getAttribute('data-tour') || '';
        var category = card.getAttribute('data-category') || '';
        var searchText = (card.getAttribute('data-search') || '') + ' ' + tour;
        var title = (card.querySelector('h3') || {}).textContent || '';
        searchText += ' ' + title;
        var matchFilter = activeFilter === 'all' || category === activeFilter;
        var matchSearch = !q || searchText.toLowerCase().indexOf(q) !== -1;
        var show = matchFilter && matchSearch;
        card.setAttribute('data-hidden', show ? 'false' : 'true');
        if (show) visible++;
      });
      allSections.forEach(function (sec) {
        var cards = sec.querySelectorAll('.package-card[data-tour]');
        var anyVisible = false;
        cards.forEach(function (c) { if (c.getAttribute('data-hidden') !== 'true') anyVisible = true; });
        sec.classList.toggle('pkg-section-hidden', !anyVisible);
      });
      if (pkgSearchCount) {
        pkgSearchCount.textContent = q || activeFilter !== 'all'
          ? visible + ' tour' + (visible !== 1 ? 's' : '') + ' found'
          : '';
      }
      if (pkgSearchClear) pkgSearchClear.hidden = !q;
    }

    pkgSearch.addEventListener('input', filterPackages);
    if (pkgSearchClear) pkgSearchClear.addEventListener('click', function () {
      pkgSearch.value = '';
      filterPackages();
      pkgSearch.focus();
    });

    if (pkgFilterRow) {
      pkgFilterRow.addEventListener('click', function (e) {
        var btn = e.target.closest('.pkg-filter-btn');
        if (!btn) return;
        pkgFilterRow.querySelectorAll('.pkg-filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter') || 'all';
        filterPackages();
      });
    }
  }
})();
