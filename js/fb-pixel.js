// Facebook Pixel Advanced Tracking Events
// Replace YOUR_PIXEL_ID with actual Facebook Pixel ID

// Track ViewContent when user scrolls to product section
document.addEventListener('DOMContentLoaded', function() {

    // ViewContent - Product sections
    const productSection = document.getElementById('products');
    if (productSection) {
        const observer = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) {
                fbq('track', 'ViewContent', {
                    content_name: 'Eco Retreat Products',
                    content_category: 'Real Estate',
                    content_type: 'product',
                    value: 1800000000,
                    currency: 'VND'
                });
                observer.disconnect();
            }
        });
        observer.observe(productSection);
    }

    // Lead - Form submission tracking
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = {
                fullname: document.getElementById('fullname').value,
                phone: document.getElementById('phone').value,
                need: document.querySelector('input[name="need"]:checked').value
            };

            // Track Lead event
            fbq('track', 'Lead', {
                content_name: 'Registration Form',
                content_category: 'Real Estate Lead',
                value: 0,
                currency: 'VND'
            });

            // Track CompleteRegistration event
            fbq('track', 'CompleteRegistration', {
                content_name: 'Eco Retreat Registration',
                status: 'completed'
            });

            // Show success message
            alert('Cảm ơn bạn đã đăng ký! Chúng tôi sẽ liên hệ trong thời gian sớm nhất.');

            // Reset form
            leadForm.reset();
        });
    }

    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-giant');
    ctaButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            fbq('trackCustom', 'CTAClick', {
                button_text: this.textContent.trim(),
                button_location: this.closest('section')?.id || 'unknown'
            });
        });
    });

    // Track phone number clicks
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            fbq('track', 'Contact', {
                contact_method: 'phone'
            });
        });
    });

    // Track download brochure
    const downloadBtn = document.getElementById('downloadBrochure');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fbq('trackCustom', 'DownloadBrochure', {
                content_name: 'Eco Retreat Brochure',
                content_type: 'pdf'
            });
            alert('Bảng giá và mặt bằng sẽ được gửi qua email trong vài phút.');
        });
    }

    // Track scroll depth
    let scrollTracked = {
        '25': false,
        '50': false,
        '75': false,
        '100': false
    };

    window.addEventListener('scroll', function() {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

        Object.keys(scrollTracked).forEach(function(depth) {
            if (scrollPercentage >= parseInt(depth) && !scrollTracked[depth]) {
                fbq('trackCustom', 'ScrollDepth', {
                    depth: depth + '%'
                });
                scrollTracked[depth] = true;
            }
        });
    });

});
