import React, { useState, useEffect, useRef  } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGamepad,
  faUsers,
  faUserPlus,
  faTrophy,
  faComments,
  faSearch,
  faMapMarkerAlt,
  faFutbol,
  faHandshake,
  faRobot,
  faGlobe,
  faCalendarAlt,
  faLanguage,
  faTimes,
  faBasketballBall,
  faVolleyballBall,
  faMedal,
  faUser,
  faUpload,
  faStar,
  faStarHalfAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons'; 
import { faFacebookF, faTwitter, faInstagram, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { renderToString } from 'react-dom/server';
import './css/Landpage.css';


library.add(
  faGamepad,
  faUsers,
  faUserPlus,
  faTrophy,
  faComments,
  faSearch,
  faMapMarkerAlt,
  faFutbol,
  faHandshake,
  faRobot,
  faGlobe,
  faCalendarAlt,
  faLanguage,
  faTimes,
  faBasketballBall,
  faVolleyballBall,
  faMedal,
  faUser,
  faUpload,
  faStar,
  faStarHalfAlt,
  farStar,
  faFacebookF,
  faTwitter,
  faInstagram,
  faDiscord
);

gsap.registerPlugin(ScrollTrigger);

const PlayPlexus = ({ user, team }) => {
  const navigate = useNavigate();
  const [isNavActive, setIsNavActive] = useState(false);

  
  const [modalState, setModalState] = useState({
    overlay: false,
    authSelect: false,
    registerPlayer: false,
    registerTeam: false,
    loginPlayer: false,
    loginTeam: false,
    action: null, 
  });

  
  const [currentSlide, setCurrentSlide] = useState(0);

 
  const navbarRef = useRef(null);
  const reviewsSliderRef = useRef(null);
  const particlesContainerRef = useRef(null);
  const playerProfileImageInputRef = useRef(null);
  const playerProfileImagePreviewRef = useRef(null);
  const teamLogoInputRef = useRef(null);
  const teamLogoPreviewRef = useRef(null);

  
  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  
  const closeNav = () => {
    setIsNavActive(false);
  };

  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        navbarRef.current.classList.add('scrolled');
      } else {
        navbarRef.current.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  const openAuthSelect = (type) => {
    setModalState({
      overlay: true,
      authSelect: true,
      registerPlayer: false,
      registerTeam: false,
      loginPlayer: false,
      loginTeam: false,
      action: type,
    });
  };

  const closeAllModals = () => {
    setModalState({
      overlay: false,
      authSelect: false,
      registerPlayer: false,
      registerTeam: false,
      loginPlayer: false,
      loginTeam: false,
      action: null,
    });
  };

  const handleAuthOptionClick = (type) => {
    setModalState((prev) => ({
      ...prev,
      authSelect: false,
      registerPlayer: prev.action === 'register' && type === 'player',
      registerTeam: prev.action === 'register' && type === 'team',
      loginPlayer: prev.action === 'login' && type === 'player',
      loginTeam: prev.action === 'login' && type === 'team',
    }));
  };

  const switchToLogin = (fromPlayer) => {
    setModalState((prev) => ({
      ...prev,
      registerPlayer: false,
      registerTeam: false,
      loginPlayer: fromPlayer,
      loginTeam: !fromPlayer,
    }));
  };

  const switchToRegister = (fromPlayer) => {
    setModalState((prev) => ({
      ...prev,
      loginPlayer: false,
      loginTeam: false,
      registerPlayer: fromPlayer,
      registerTeam: !fromPlayer,
    }));
  };

 
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeAllModals();
    }
  };

  
  const handleSliderDotClick = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  
  useEffect(() => {
    const totalSlides = 3; 
    const sliderInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(sliderInterval);
  }, []);

  
  useEffect(() => {
    if (reviewsSliderRef.current) {
      reviewsSliderRef.current.style.transform = `translateX(-${currentSlide * 33.333}%)`;
    }
  }, [currentSlide]);

  
  useEffect(() => {
    const createParticles = () => {
      if (!particlesContainerRef.current) return;

      const icons = [
        'gamepad',
        'futbol',
        'basketball-ball',
        'volleyball-ball',
        'chess',
        'trophy',
        'medal',
      ];

      for (let i = 0; i < 15; i++) {
        const icon = document.createElement('i');
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        icon.className = `fas fa-${randomIcon} floating-icon`;
        icon.style.fontSize = `${Math.random() * 20 + 10}px`;
        icon.style.left = `${Math.random() * 100}%`;
        icon.style.top = `${Math.random() * 100}%`;
        icon.style.animationDuration = `${Math.random() * 10 + 5}s`;
        icon.style.animationDelay = `${Math.random() * 5}s`;
        particlesContainerRef.current.appendChild(icon);
      }
    };

    createParticles();
  }, []);

  
  useEffect(() => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.error('GSAP or ScrollTrigger is not loaded properly');
      document.querySelectorAll('.feature-card, .step, .review-card').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      return;
    }

    gsap.set('.feature-card', { y: 50, opacity: 0 });
    gsap.set('.step', { y: 50, opacity: 0 });
    gsap.set('.review-card', { y: 50, opacity: 0 });

    gsap.utils.toArray('.feature-card').forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(card, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out',
          });
        },
        once: true,
      });
    });

    gsap.utils.toArray('.step').forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(step, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.2,
            ease: 'back.out(1.5)',
          });
        },
        once: true,
      });
    });

    gsap.utils.toArray('.review-card').forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(card, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power2.out',
          });
        },
        once: true,
      });
    });
  }, []);

  
  useEffect(() => {
    const input = playerProfileImageInputRef.current;
    const preview = playerProfileImagePreviewRef.current;

    if (input && preview) {
      const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = event.target.result;
            img.alt = 'Profile Preview';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            preview.appendChild(img);
          };
          reader.readAsDataURL(file);
        } else {
          preview.innerHTML = renderToString(
            <FontAwesomeIcon icon={faUser} style={{ width: '100%', height: '100%', color: '#ccc' }} />
          );
        }
      };

      input.addEventListener('change', handleImageChange);
      return () => input.removeEventListener('change', handleImageChange);
    }
  }, []);

  
  useEffect(() => {
    const input = teamLogoInputRef.current;
    const preview = teamLogoPreviewRef.current;

    if (input && preview) {
      const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = event.target.result;
            img.alt = 'Logo Preview';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            preview.appendChild(img);
          };
          reader.readAsDataURL(file);
        } else {
          preview.innerHTML = renderToString(
            <FontAwesomeIcon icon={faUsers} style={{ width: '100%', height: '100%', color: '#ccc' }} />
          );
        }
      };

      input.addEventListener('change', handleImageChange);
      return () => input.removeEventListener('change', handleImageChange);
    }
  }, []);

  
  const handlePlayerRegisterSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch('https://playplexusbackend.onrender.com/api/users/register', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        closeAllModals();
        const r = await response.json();
        localStorage.setItem('token', r.token);
        navigate(`/MainPage/${r.user._id}`);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleTeamRegisterSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch('https://playplexusbackend.onrender.com/api/teams/register', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        closeAllModals();
        const r = await response.json();
        localStorage.setItem('token', r.token);
        navigate(`/MainPage/${r.team._id}`);
      } else {
        alert('Team registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handlePlayerLoginSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      const response = await fetch('https://playplexusbackend.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        closeAllModals();
        const r = await response.json();
        console.log(r);
        localStorage.setItem('token', r.token);
        navigate(`/MainPage/${r.user._id}`);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleTeamLoginSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      const response = await fetch('https://playplexusbackend.onrender.com/api/teams/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        closeAllModals();
        const r = await response.json();
        
        localStorage.setItem('token', r.token);
        navigate(`/MainPage/${r.team._id}`);
      } else {
        alert('Team login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className={document.documentElement.className.replace('no-js', 'js')}>
      
      <nav className="navbar" ref={navbarRef}>
        <a href="#" className="logo">
          <FontAwesomeIcon icon={faGamepad} />Play<span>PLexus</span>
        </a>
        <ul className={`nav-links ${isNavActive ? 'active' : ''}`}>
          <li><a href="#features" onClick={closeNav}>Features</a></li>
          <li><a href="#how-it-works" onClick={closeNav}>Working</a></li>
          {user || team ? (
            <li><a href="/logout" className="register-btn team-logout" onClick={closeNav}>Logout</a></li>
          ) : (
            <>
              <li><a href="#" className="register-btn" onClick={() => { openAuthSelect('register'); closeNav(); }}>Register</a></li>
              <li><a href="#" className="login-btn" onClick={() => { openAuthSelect('login'); closeNav(); }}>Login</a></li>
            </>
          )}
          <li><a href="#reviews" onClick={closeNav}>About</a></li>
          {user ? (
            <li><a href={`/MainPage/${user._id}`} className="app-btn" onClick={closeNav}>Go to App</a></li>
          ) : team ? (
            <li><a href={`/MainPage/${team._id}`} className="app-btn" onClick={closeNav}>Go to App</a></li>
          ) : (
            <li><a href="#" className="app-btn register-btn" onClick={() => { openAuthSelect('register'); closeNav(); }}>Go to App</a></li>
          )}
        </ul>
        <div className={`hamburger ${isNavActive ? 'active' : ''}`} onClick={toggleNav}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="particles" ref={particlesContainerRef}></div>
        <div className="hero-content">
          <div className="hero-animation">
            <div className="animation-container">
              <div className="cube">
                <div className="cube-face"><FontAwesomeIcon size="4x" icon={faGamepad} /></div>
                <div className="cube-face"><FontAwesomeIcon size="4x" icon={faFutbol} /></div>
                <div className="cube-face"><FontAwesomeIcon size="4x" icon={faUsers} /></div>
                <div className="cube-face"><FontAwesomeIcon size="4x" icon={faTrophy} /></div>
                <div className="cube-face"><FontAwesomeIcon size="4x" icon={faComments} /></div>
                <div className="cube-face"><FontAwesomeIcon size="4x" icon={faMapMarkerAlt} /></div>
              </div>
            </div>
          </div>
          <h1 className="animate__animated animate__fadeInUp">Your Playground. Your Team. Anytime.</h1>
          <p className="animate__animated animate__fadeInUp animate__delay-1s">
            Find players, form teams, and compete in both online and offline games. Connect with gamers and sports enthusiasts in your area.
          </p>
          <div className="hero-btns animate__animated animate__fadeInUp animate__delay-2s">
            {user ? (
              <a href={`/MainPage/${user._id}`} className="hero-btn primary-btn register-btn">Get Started</a>
            ) : team ? (
              <a href={`/MainPage/${team}`} className="hero-btn primary-btn register-btn">Get Started</a>
            ) : (
              <a href="#" className="hero-btn primary-btn login-btn" onClick={() => openAuthSelect('register')}>Get Started</a>
            )}
            <a href="https://github.com/AkshatGarg952?tab=repositories" target="_blank" className="hero-btn secondary-btn">Star It on Github</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="section-title">
          <h2>Amazing Features</h2>
          <p>Discover what makes PlayPLexus the ultimate platform for finding players and teams</p>
        </div>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon"><FontAwesomeIcon icon={faSearch} /></div>
            <h3>Find Players Nearby</h3>
            <p>Discover gaming buddies and sports teammates in your vicinity with our advanced location-based matching system.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FontAwesomeIcon icon={faRobot} /></div>
            <h3>AI-Powered Chatbot Help</h3>
            <p>Get instant assistance, game recommendations, and team formations with our intelligent AI assistant.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FontAwesomeIcon icon={faGlobe} /></div>
            <h3>Online & Offline Games</h3>
            <p>Whether you're looking for digital gaming partners or real-world sports teams, we've got you covered.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FontAwesomeIcon icon={faTrophy} /></div>
            <h3>Challenge Teams Nearby</h3>
            <p>Find and challenge other teams in your area for friendly matches or competitive tournaments.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FontAwesomeIcon icon={faCalendarAlt} /></div>
            <h3>Schedule Friendly Matches</h3>
            <p>Organize games with ease using our intuitive scheduling system and keep track of all your upcoming events.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FontAwesomeIcon icon={faLanguage} /></div>
            <h3>Multi-language & Voice Support</h3>
            <p>Break language barriers with our built-in translation and voice recognition features.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-title">
          <h2>How It Works</h2>
          <p>Getting started with PlayPLexus is quick and simple. Follow these easy steps</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon"><FontAwesomeIcon icon={faUserPlus} /></div>
            <h3>Register/Login</h3>
            <p>Create your account in seconds and set up your gaming profile</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon"><FontAwesomeIcon icon={faGamepad} /></div>
            <h3>Choose Sport/Game</h3>
            <p>Select from hundreds of games and sports available on the platform</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon"><FontAwesomeIcon icon={faSearch} /></div>
            <h3>Find Players/Teams</h3>
            <p>Discover players and teams that match your preferences and skill level</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-icon"><FontAwesomeIcon icon={faRobot} /></div>
            <h3>Use AI Chatbot</h3>
            <p>Get assistance from our intelligent AI to optimize your gaming experience</p>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <div className="step-icon"><FontAwesomeIcon icon={faHandshake} /></div>
            <h3>Schedule & Play</h3>
            <p>Set up matches, meet new friends, and enjoy your favorite activities</p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews" id="reviews">
        <div className="section-title">
          <h2>What Our Users Say</h2>
          <p>Join thousands of satisfied players who have found their perfect team</p>
        </div>
        <div className="reviews-container">
          <div className="reviews-slider" ref={reviewsSliderRef}>
            <div className="review-slide">
              <div className="review-cards">
                <div className="review-card">
                  <div className="reviewer">
                    <div className="reviewer-img">
                      <img src="https://play-plexus-frontend.vercel.app/profileImages/pic1.jpg" alt="User Avatar" />
                    </div>
                    <div className="reviewer-info">
                      <h4>Alex Johnson</h4>
                      <p>Football Enthusiast</p>
                    </div>
                  </div>
                  <p className="review-text">"Found a weekend cricket squad within 10 mins! The app made it super easy to connect with players of my skill level."</p>
                  <div className="review-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                </div>
                <div className="review-card">
                  <div className="reviewer">
                    <div className="reviewer-img">
                      <img src="https://play-plexus-frontend.vercel.app/profileImages/pic2.jpg" alt="User Avatar" />
                    </div>
                    <div className="reviewer-info">
                      <h4>Sarah Kim</h4>
                      <p>E-Sports Player</p>
                    </div>
                  </div>
                  <p className="review-text">"The AI chatbot helped me form the perfect Valorant team. We've been playing together for months now and even entered tournaments!"</p>
                  <div className="review-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStarHalfAlt} />
                  </div>
                </div>
              </div>
            </div>
            <div className="review-slide">
              <div className="review-cards">
                <div className="review-card">
                  <div className="reviewer">
                    <div className="reviewer-img">
                      <img src="https://play-plexus-frontend.vercel.app/profileImages/pic3.jpg" alt="User Avatar" />
                    </div>
                    <div className="reviewer-info">
                      <h4>Michael Torres</h4>
                      <p>Basketball Player</p>
                    </div>
                  </div>
                  <p className="review-text">"I moved to a new city and was looking for a basketball team. Within a week, I had regular games scheduled with an awesome group!"</p>
                  <div className="review-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                </div>
                <div className="review-card">
                  <div className="reviewer">
                    <div className="reviewer-img">
                      <img src="https://play-plexus-frontend.vercel.app/profileImages/pic5.jpg" alt="User Avatar" />
                    </div>
                    <div className="reviewer-info">
                      <h4>Emma Wilson</h4>
                      <p>Team Manager</p>
                    </div>
                  </div>
                  <p className="review-text">"As a team manager, this app has been invaluable for finding players and scheduling matches. The interface is intuitive and feature-rich."</p>
                  <div className="review-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={farStar} />
                  </div>
                </div>
              </div>
            </div>
            <div className="review-slide">
              <div className="review-cards">
                <div className="review-card">
                  <div className="reviewer">
                    <div className="reviewer-img">
                      <img src="https://play-plexus-frontend.vercel.app/profileImages/pic4.jpg" alt="User Avatar" />
                    </div>
                    <div className="reviewer-info">
                      <h4>David Chen</h4>
                      <p>Chess Player</p>
                    </div>
                  </div>
                  <p className="review-text">"The multi-language support is fantastic! I've played chess with people from around the world without any communication barriers."</p>
                  <div className="review-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStarHalfAlt} />
                  </div>
                </div>
                <div className="review-card">
                  <div className="reviewer">
                    <div className="reviewer-img">
                      <img src="https://play-plexus-frontend.vercel.app/profileImages/pic6.jpg" alt="User Avatar" />
                    </div>
                    <div className="reviewer-info">
                      <h4>Olivia Martinez</h4>
                      <p>Tennis Enthusiast</p>
                    </div>
                  </div>
                  <p className="review-text">"Finding tennis partners used to be such a hassle. Now I just open the app and within minutes I've got a match scheduled for the weekend!"</p>
                  <div className="review-rating">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="slider-controls">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
                data-slide={index}
                onClick={() => handleSliderDotClick(index)}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <a href="#"><FontAwesomeIcon icon={faGamepad} />Play<span>PLexus</span></a>
            <p>Connect, play, and compete with players and teams around the world.</p>
            <div className="social-icons">
              <a href="#"><FontAwesomeIcon icon={faFacebookF} /></a>
              <a href="#"><FontAwesomeIcon icon={faTwitter} /></a>
              <a href="#"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="#"><FontAwesomeIcon icon={faDiscord} /></a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#reviews">Reviews</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Feedback</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Community Guidelines</a></li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>Built for gamers & players. <span>PlayPLexus 🏆</span> © 2025. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modals */}
      <div className={`modal-overlay ${modalState.overlay ? 'active' : ''}`} onClick={handleOverlayClick} id="authModal">
       
        <div className={`auth-select-modal ${modalState.authSelect ? 'active' : ''}`} id="authSelectModal">
          <button className="modal-close" onClick={closeAllModals}><FontAwesomeIcon className="iconn" icon={faTimes} /></button>
          <h2 className="auth-modal-title">Choose Account Type</h2>
          <div className="auth-options">
            <div className="auth-option" data-type="player" onClick={() => handleAuthOptionClick('player')}>
              <FontAwesomeIcon className="iconn" icon={faUser} />
              <h4>Player</h4>
            </div>
            <div className="auth-option" data-type="team" onClick={() => handleAuthOptionClick('team')}>
              <FontAwesomeIcon className="iconn" icon={faUsers} />
              <h4>Team</h4>
            </div>
          </div>
        </div>

        {/* Registration Player Form Modal */}
        <div className={`auth-form-modal ${modalState.registerPlayer ? 'active' : ''}`} id="registerPlayerModal">
          <button className="modal-close" onClick={closeAllModals}><FontAwesomeIcon className="ccc" icon={faTimes} /></button>
          <h2 className="auth-modal-title">Register as Player</h2>
          <form className="auth-form" id="playerRegisterForm" onSubmit={handlePlayerRegisterSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="profileImage">Profile Image</label>
              <div className="image-preview" id="playerProfileImagePreview" ref={playerProfileImagePreviewRef}>
                <FontAwesomeIcon icon={faUser} style={{ width: '100%', height: '100%', color: '#ccc' }} />
              </div>
              <input type="file" id="profileImage" name="profileImage" className="form-input file-input" accept="image/*" ref={playerProfileImageInputRef} />
              <label htmlFor="profileImage"><FontAwesomeIcon icon={faUpload} /> Choose image</label>
            </div>
            <div className="form-group">
              <label htmlFor="name">Full Name <span className="required">*</span></label>
              <input type="text" id="name" name="name" className="form-input" required minLength="3" maxLength="50" />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username <span className="required">*</span></label>
              <input type="text" id="username" name="username" className="form-input" required minLength="3" maxLength="50" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input type="email" id="email" name="email" className="form-input" required pattern="^\S+@\S+\.\S+$" />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location <span className="required">*</span></label>
              <input type="text" id="location" name="location" className="form-input" required minLength="3" maxLength="50" />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone <span className="required">*</span></label>
              <input type="tel" id="phone" name="phone" className="form-input" required />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" name="bio" className="form-input" placeholder="Tell us about yourself"></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="sports">Sports</label>
              <input type="text" id="sports" name="sports" className="form-input" placeholder="e.g., football, basketball" />
              <small className="form-hint">Separate with commas</small>
            </div>
            <div className="form-group">
              <label htmlFor="onlineGames">Online Games</label>
              <input type="text" id="onlineGames" name="onlineGames" className="form-input" placeholder="e.g., BGMI, Valorant" />
              <small className="form-hint">Separate with commas</small>
            </div>
            <input type="hidden" name="onlineGamesJSON" id="onlineGamesJSON" />
            <div className="form-group">
              <label htmlFor="password">Password <span className="required">*</span></label>
              <input type="password" id="password" name="password" className="form-input" required minLength="6" />
            </div>
            <button type="submit" className="form-submit">Register</button>
          </form>
          <div className="auth-footer">
            Already have an account? <a href="#" className="switch-to-login" onClick={() => switchToLogin(true)}>Login here</a>
          </div>
        </div>

        {/* Registration Team Form Modal */}
        <div className={`auth-form-modal ${modalState.registerTeam ? 'active' : ''}`} id="registerTeamModal">
          <button className="modal-close" onClick={closeAllModals}><FontAwesomeIcon className="ccc" icon={faTimes} /></button>
          <h2 className="auth-modal-title">Register as Team</h2>
          <form className="auth-form" id="teamRegisterForm" onSubmit={handleTeamRegisterSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="teamLogo">Team Logo</label>
              <div className="image-preview" id="teamLogoPreview" ref={teamLogoPreviewRef}>
                <FontAwesomeIcon icon={faUsers} style={{ width: '100%', height: '100%', color: '#ccc' }} />
              </div>
              <input type="file" id="teamLogo" name="logo" className="form-input file-input" accept="image/*" ref={teamLogoInputRef} />
              <label htmlFor="teamLogo"><FontAwesomeIcon icon={faUpload} /> Choose logo</label>
            </div>
            <div className="form-group">
              <label htmlFor="teamName">Team Name <span className="required">*</span></label>
              <input type="text" id="teamName" name="name" className="form-input" placeholder="Enter team name" required minLength="3" maxLength="50" />
            </div>
            <div className="form-group">
              <label htmlFor="teamLeader">Leader Name <span className="required">*</span></label>
              <input type="text" id="teamLeader" name="leader" className="form-input" placeholder="Enter leader name" required minLength="3" maxLength="50" />
            </div>
            <div className="form-group">
              <label htmlFor="teamEmail">Email Address <span className="required">*</span></label>
              <input type="email" id="teamEmail" name="email" className="form-input" placeholder="Enter team email" required pattern="^\S+@\S+\.\S+$" />
            </div>
            <div className="form-group">
              <label htmlFor="teamLocation">Location <span className="required">*</span></label>
              <input type="text" id="teamLocation" name="location" className="form-input" placeholder="Enter team location" required minLength="3" maxLength="50" />
            </div>
            <div className="form-group">
              <label htmlFor="teamPhone">Phone Number <span className="required">*</span></label>
              <input type="tel" id="teamPhone" name="phone" className="form-input" placeholder="Enter team phone number" required />
            </div>
            <div className="form-group">
              <label htmlFor="teamBio">Bio</label>
              <textarea id="teamBio" name="bio" className="form-input" placeholder="Tell us about your team"></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="teamSports">Sports</label>
              <input type="text" id="teamSports" name="sports" className="form-input" placeholder="Enter sports (e.g., football, basketball)" />
              <small className="form-hint">Separate sports with commas</small>
            </div>
            <div className="form-group">
              <label htmlFor="onlineGames">Online Games</label>
              <input type="text" id="onlineGames" name="onlineGames" className="form-input" placeholder="e.g., BGMI, Valorant" />
              <small className="form-hint">Separate with commas</small>
            </div>
            <div className="form-group">
              <label htmlFor="teamPassword">Password <span className="required">*</span></label>
              <input type="password" id="teamPassword" name="password" className="form-input" placeholder="Create a password" required minLength="6" />
            </div>
            <button type="submit" className="form-submit">Register Team</button>
          </form>
          <div className="auth-footer">
            Already have a team account? <a href="#" className="switch-to-login" onClick={() => switchToLogin(false)}>Login here</a>
          </div>
        </div>

        {/* Login Player Form Modal */}
        <div className={`auth-form-modal ${modalState.loginPlayer ? 'active' : ''}`} id="loginPlayerModal">
          <button className="modal-close" onClick={closeAllModals}><FontAwesomeIcon className="ccc" icon={faTimes} /></button>
          <h2 className="auth-modal-title">Login as Player</h2>
          <form className="auth-form" onSubmit={handlePlayerLoginSubmit}>
            <div className="form-group">
              <label htmlFor="loginPlayerEmail">Email Address</label>
              <input type="email" id="loginPlayerEmail" name="email" className="form-input" placeholder="Enter your email" />
            </div>
            <div className="form-group">
              <label htmlFor="loginPlayerPassword">Password</label>
              <input type="password" id="loginPlayerPassword" name="password" className="form-input" placeholder="Enter your password" />
            </div>
            <button type="submit" className="form-submit">Login</button>
          </form>
          <div className="auth-footer">
            Don't have an account? <a href="#" className="switch-to-register" onClick={() => switchToRegister(true)}>Register here</a>
          </div>
        </div>

        {/* Login Team Form Modal */}
        <div className={`auth-form-modal ${modalState.loginTeam ? 'active' : ''}`} id="loginTeamModal">
          <button className="modal-close" onClick={closeAllModals}><FontAwesomeIcon className="ccc" icon={faTimes} /></button>
          <h2 className="auth-modal-title">Login as Team</h2>
          <form className="auth-form" onSubmit={handleTeamLoginSubmit}>
            <div className="form-group">
              <label htmlFor="loginTeamEmail">Email Address</label>
              <input type="email" id="loginTeamEmail" name="email" className="form-input" placeholder="Enter team email" />
            </div>
            <div className="form-group">
              <label htmlFor="loginTeamPassword">Password</label>
              <input type="password" id="loginTeamPassword" name="password" className="form-input" placeholder="Enter team password" />
            </div>
            <button type="submit" className="form-submit">Login</button>
          </form>
          <div className="auth-footer">
            Don't have a team account? <a href="#" className="switch-to-register" onClick={() => switchToRegister(false)}>Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayPlexus;
