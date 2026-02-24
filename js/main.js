// ===========================
// ECO RETREAT LANDING PAGE
// Main JavaScript
// ===========================

document.addEventListener('DOMContentLoaded', function() {

    // ===========================
    // SMOOTH SCROLL
    // ===========================

    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Skip if href is just "#"
            if (targetId === '#') return;

            e.preventDefault();

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 20;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ===========================
    // COUNTDOWN TIMER
    // ===========================

    function initCountdown() {
        // Set deadline to March 31, 2026 23:59:59
        const deadline = new Date('2026-03-31T23:59:59').getTime();

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = deadline - now;

            if (distance < 0) {
                // Countdown finished
                daysEl.textContent = '0';
                hoursEl.textContent = '0';
                minutesEl.textContent = '0';
                secondsEl.textContent = '0';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysEl.textContent = days;
            hoursEl.textContent = hours;
            minutesEl.textContent = minutes;
            secondsEl.textContent = seconds;
        }

        // Update immediately
        updateCountdown();

        // Update every second
        setInterval(updateCountdown, 1000);
    }

    initCountdown();


    // ===========================
    // FAQ ACCORDION
    // ===========================

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            // Close all other FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current FAQ
            item.classList.toggle('active');
        });
    });


    // ===========================
    // FORM VALIDATION & SUBMISSION
    // ===========================

    // ===========================
    // CRM WEBHOOK CONFIG
    // ===========================
    // Admin: Tạo Data Source trên CRM với field mapping:
    //   "fullname" → "name", "phone" → "phone", "need" → "notes"
    const CRM_WEBHOOK_URL = 'https://legacy-homes-crm.vercel.app/api/webhooks/landing/08f67416-6404-4c0a-b533-e86d384a288b';

    const leadForm = document.getElementById('leadForm');

    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const fullname = document.getElementById('fullname').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const needEl = document.querySelector('input[name="need"]:checked');
            const need = needEl ? needEl.value : '';

            // Basic validation
            if (!fullname || fullname.length < 3) {
                showFormMessage('Vui lòng nhập họ tên đầy đủ (ít nhất 3 ký tự)', 'error');
                return;
            }

            // Phone validation (Vietnamese phone format)
            const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
            if (!phoneRegex.test(phone)) {
                showFormMessage('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0912345678)', 'error');
                return;
            }

            // Prepare CRM payload (field names match CRM mapping)
            const payload = {
                fullname: fullname,
                phone: phone,
                need: need
            };

            // Append UTM params from localStorage if available
            const storedUtm = localStorage.getItem('utm_data');
            if (storedUtm) {
                try {
                    const utm = JSON.parse(storedUtm);
                    if (utm.source) payload.utm_source = utm.source;
                    if (utm.medium) payload.utm_medium = utm.medium;
                    if (utm.campaign) payload.utm_campaign = utm.campaign;
                } catch (err) { /* ignore parse errors */ }
            }

            // Show loading state
            const submitBtn = leadForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'ĐANG GỬI...';
            submitBtn.disabled = true;

            // Submit to CRM webhook
            fetch(CRM_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(function(response) {
                return response.json().then(function(data) {
                    return { ok: response.ok, status: response.status, data: data };
                });
            })
            .then(function(result) {
                if (result.ok) {
                    showFormMessage('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.', 'success');
                    leadForm.reset();

                    // Track event (Google Analytics)
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'lead_submission', {
                            'event_category': 'form',
                            'event_label': 'register_form',
                            'value': 1
                        });
                    }

                    // Track event (Facebook Pixel)
                    if (typeof fbq !== 'undefined') {
                        fbq('track', 'Lead');
                    }
                } else {
                    console.error('CRM Error:', result.status, result.data);
                    showFormMessage('Có lỗi xảy ra. Vui lòng thử lại sau hoặc gọi hotline 0988.97.8886.', 'error');
                }
            })
            .catch(function(error) {
                console.error('Network Error:', error);
                showFormMessage('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.', 'error');
            })
            .finally(function() {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

    function showFormMessage(message, type) {
        // Remove existing message if any
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = message;

        // Insert before form
        leadForm.parentNode.insertBefore(messageEl, leadForm);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => messageEl.remove(), 300);
        }, 5000);
    }


    // ===========================
    // DOWNLOAD BROCHURE
    // ===========================

    const downloadBrochureBtn = document.getElementById('downloadBrochure');

    if (downloadBrochureBtn) {
        downloadBrochureBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Track download event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'brochure_download', {
                    'event_category': 'engagement',
                    'event_label': 'download_brochure'
                });
            }

            // TODO: Replace with actual brochure PDF path
            alert('Tính năng tải brochure đang được cập nhật. Vui lòng đăng ký để nhận tài liệu qua email.');

            // Uncomment when you have actual PDF
            // window.open('/assets/eco-retreat-brochure.pdf', '_blank');
        });
    }


    // ===========================
    // SCROLL ANIMATIONS
    // ===========================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const elementsToAnimate = document.querySelectorAll('.pain-point, .building-card, .benefit-item, .testimonial-card, .urgency-card, .scenario');

    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });


    // ===========================
    // STICKY CTA MOBILE - SHOW/HIDE
    // ===========================

    const stickyCTA = document.querySelector('.sticky-cta-mobile');
    const registerSection = document.getElementById('register-form');

    if (stickyCTA && registerSection) {
        window.addEventListener('scroll', function() {
            const registerSectionTop = registerSection.offsetTop;
            const scrollPosition = window.scrollY + window.innerHeight;

            // Hide sticky CTA when user reaches register section
            if (scrollPosition >= registerSectionTop) {
                stickyCTA.style.transform = 'translateY(100%)';
            } else {
                stickyCTA.style.transform = 'translateY(0)';
            }
        });
    }


    // ===========================
    // PHONE NUMBER FORMATTING
    // ===========================

    const phoneInput = document.getElementById('phone');

    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove all non-digit characters
            let value = e.target.value.replace(/\D/g, '');

            // Limit to 11 characters (for +84 format) or 10 (for 0 format)
            if (value.length > 11) {
                value = value.substring(0, 11);
            }

            e.target.value = value;
        });
    }


    // ===========================
    // FULLNAME INPUT - CAPITALIZE
    // ===========================

    const fullnameInput = document.getElementById('fullname');

    if (fullnameInput) {
        fullnameInput.addEventListener('blur', function(e) {
            // Capitalize first letter of each word
            const words = e.target.value.toLowerCase().split(' ');
            const capitalizedWords = words.map(word => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            });
            e.target.value = capitalizedWords.join(' ');
        });
    }


    // ===========================
    // SOCIAL PROOF - LIVE ACTIVITY (Optional)
    // ===========================

    function showLiveActivity() {
        const activities = [
            'Chị Lan (Quận Cầu Giấy) vừa đặt lịch tham quan',
            'Anh Minh (Quận Đống Đa) vừa đăng ký nhận tư vấn',
            'Chị Hương (Quận Hai Bà Trưng) vừa tải bảng giá',
            'Anh Tuấn (Quận Hoàng Mai) vừa đặt chỗ căn 2PN'
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'live-activity-notification';
        notification.innerHTML = `
            <div class="live-activity-content">
                <span class="live-activity-icon">🔥</span>
                <span class="live-activity-text">${randomActivity}</span>
            </div>
        `;

        // Add styles dynamically
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 20px;
            background: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 998;
            opacity: 0;
            transform: translateX(-100%);
            transition: all 0.5s ease;
            max-width: 320px;
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-100%)';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    // Show live activity every 20-40 seconds
    // Uncomment to enable
    // setInterval(() => {
    //     const randomDelay = Math.random() * 20000 + 20000; // 20-40 seconds
    //     setTimeout(showLiveActivity, randomDelay);
    // }, 40000);


    // ===========================
    // TRACK PAGE ENGAGEMENT
    // ===========================

    // Track scroll depth
    let maxScrollDepth = 0;

    window.addEventListener('scroll', function() {
        const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;

        if (scrollPercentage > maxScrollDepth) {
            maxScrollDepth = scrollPercentage;

            // Track milestones
            if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
                trackEvent('scroll_depth', '25%');
            } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
                trackEvent('scroll_depth', '50%');
            } else if (maxScrollDepth >= 75 && maxScrollDepth < 100) {
                trackEvent('scroll_depth', '75%');
            } else if (maxScrollDepth >= 100) {
                trackEvent('scroll_depth', '100%');
            }
        }
    });

    // Track time on page
    const pageLoadTime = Date.now();

    window.addEventListener('beforeunload', function() {
        const timeOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
        trackEvent('time_on_page', timeOnPage + 's');
    });

    function trackEvent(eventName, eventLabel) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'event_category': 'engagement',
                'event_label': eventLabel
            });
        }
        console.log('Event tracked:', eventName, eventLabel);
    }


    // ===========================
    // CONSOLE MESSAGE
    // ===========================

    console.log('%c🌳 Eco Retreat Mùa Lễ Hội', 'font-size: 24px; color: #7CB342; font-weight: bold;');
    console.log('%cThức dậy giữa rừng mai 3000m² - Chỉ từ 1.8 tỷ', 'font-size: 14px; color: #666;');
    console.log('%cĐăng ký tham quan ngay: https://ecoretreat.vn', 'font-size: 12px; color: #FFB300;');

});

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
}

// Validate Vietnamese phone number
function isValidVietnamesePhone(phone) {
    const regex = /^(0|\+84)[0-9]{9,10}$/;
    return regex.test(phone);
}

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Track UTM parameters (for marketing attribution)
const utmSource = getUrlParameter('utm_source');
const utmMedium = getUrlParameter('utm_medium');
const utmCampaign = getUrlParameter('utm_campaign');

if (utmSource || utmMedium || utmCampaign) {
    console.log('UTM Parameters:', {
        source: utmSource,
        medium: utmMedium,
        campaign: utmCampaign
    });

    // Store in localStorage for later use
    localStorage.setItem('utm_data', JSON.stringify({
        source: utmSource,
        medium: utmMedium,
        campaign: utmCampaign,
        timestamp: Date.now()
    }));
}
    // GALLERY FILTER
    const galleryTabs = document.querySelectorAll('.gallery-tab');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryTabs.length > 0) {
        galleryTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const category = this.getAttribute('data-category');

                // Update active tab
                galleryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Filter items
                galleryItems.forEach(item => {
                    if (category === 'all' || item.getAttribute('data-category') === category) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }
