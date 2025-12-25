document.addEventListener('DOMContentLoaded', function () {
    // تحديث سنة حقوق النشر
    const yearElem = document.getElementById('currentYear');
    if (yearElem) yearElem.textContent = new Date().getFullYear();

    // إضافة تأثير التمرير للرأس
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // إدارة التنقل للجوال
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
            this.innerHTML = mainNav.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
    }

    // إغلاق القوائم عند النقر خارجها
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.main-nav') && !event.target.closest('.mobile-menu-toggle')) {
            if (mainNav) mainNav.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });

    // إرسال نموذج الاتصال (Formspree Integration)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            submitBtn.disabled = true;

            const formData = new FormData(this);

            try {
                // استبدل YOUR_FORM_ID بالمعرف الحقيقي إذا كان لديك واحد مختلف، أو استخدم الموجود
                // ملاحظة: المستخدم طلب سابقاً استخدام 'mqkrvjwb' كمعرف أو تركه له
                // سنستخدم معرف افتراضي أو نترك المجال للمستخدم لتحديثه
                const formId = "mqkrvjwb"; // Default placeholder from previous context or generic
                const response = await fetch(`https://formspree.io/f/${formId}`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    showNotification('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
                    contactForm.reset();
                } else {
                    showNotification('حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.', 'error');
                }
            } catch (error) {
                showNotification('حدث خطأ في الاتصال. تأكد من الإنترنت.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // تحميل المنتجات المميزة (Dynamic Loading)
    loadFeaturedProducts();

    // تحميل التقييمات
    loadTestimonials();

    // إضافة أحداث لأدوات الحساب
    document.querySelectorAll('.tool-action').forEach(button => {
        button.addEventListener('click', function () {
            const tool = this.getAttribute('data-tool');
            openToolModal(tool);
        });
    });

    // تهيئة سلة التسوق
    initCart();

    //Coming Soon Alerts
    const comingSoonServices = document.querySelectorAll('.coming-soon-service');
    comingSoonServices.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            showNotification('هذه الخدمة ستتوفر قريباً! نعمل على تجهيزها.', 'info');
        });
    });
});

// دالة تحميل التقييمات
function loadTestimonials() {
    const testimonials = [
        {
            name: 'محمد أحمد',
            role: 'مزارع نخيل',
            text: 'خدمات ممتازة ومنتجات عالية الجودة. زادت إنتاجيتي بشكل ملحوظ.',
            rating: 5
        },
        {
            name: 'سالم القحطاني',
            role: 'مهندس زراعي',
            text: 'الأدوات الرقمية في الموقع مفيدة جداً وتوفر وقتاً طويلاً في الحسابات.',
            rating: 5
        },
        {
            name: 'مؤسسة الوادي',
            role: 'عميل شركات',
            text: 'تعامل راقي ودعم فني متواجد دائماً. شكراً مواسم تك.',
            rating: 4
        }
    ];

    const slider = document.getElementById('testimonialsSlider');
    if (slider) {
        slider.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>"${testimonial.text}"</p>
                </div>
                <div class="testimonial-author">
                    <div class="author-info">
                        <h4>${testimonial.name}</h4>
                        <span>${testimonial.role}</span>
                    </div>
                    <div class="testimonial-rating">
                        ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// دالة تحميل المنتجات المميزة
function loadFeaturedProducts() {
    const products = [
        {
            id: 1,
            name: 'بذور محسنة عالية الجودة',
            category: 'البذور',
            price: 85,
            image: 'https://images.unsplash.com/photo-1663025293688-322e16b6cb66?auto=format&fit=crop&q=80&w=500',
            rating: 4.8,
            reviews: 24
        },
        {
            id: 2,
            name: 'أسمدة عضوية طبيعية',
            category: 'الأسمدة',
            price: 120,
            image: 'https://images.unsplash.com/photo-1624806992928-9c7a04a8383d?auto=format&fit=crop&q=80&w=500',
            rating: 5.0,
            reviews: 18
        },
        {
            id: 3,
            name: 'معدات زراعية حديثة',
            category: 'المعدات',
            price: 2500,
            image: 'https://images.unsplash.com/photo-1684566982052-94d4c47d259e?fm=jpg&q=60&w=500&ixlib=rb-4.1.0',
            rating: 4.7,
            reviews: 32
        },
        {
            id: 4,
            name: 'أنظمة مراقبة ذكية (Drone)',
            category: 'التقنية',
            price: 4500,
            image: 'https://images.unsplash.com/photo-1713952160156-bb59cac789a9?fm=jpg&q=60&w=500&ixlib=rb-4.1.0',
            rating: 4.9,
            reviews: 15
        }
    ];

    const container = document.getElementById('featuredProducts');
    if (container) {
        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-badge">جديد</div>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        <div class="stars">
                            ${'★'.repeat(Math.floor(product.rating))}
                        </div>
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">${product.price} ر.س</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-block add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> إضافة للسلة
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // إضافة أحداث لأزرار إضافة إلى السلة
        container.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function () {
                const productId = this.getAttribute('data-id');
                const product = products.find(p => p.id == productId);
                if (product) {
                    addToCart(product);
                    showNotification(`تم إضافة "${product.name}" إلى السلة`, 'success');
                }
            });
        });
    }
}

// === أدوات الحساب (Calculators) ===
function openToolModal(tool) {
    const modalsContainer = document.getElementById('toolsModals');
    const modalContent = {
        seeds: {
            title: 'حاسبة البذور',
            description: 'احسب الكمية التقريبية للبذور',
            fields: [
                { label: 'المساحة (م²)', name: 'area', type: 'number' },
                { label: 'المسافة بين الشتلات (سم)', name: 'distance', type: 'number' }
            ],
            calculate: (data) => {
                const area = parseFloat(data.area) || 0;
                const dist = parseFloat(data.distance) || 30;
                if (area === 0) return 0;
                // Simple calculation logic
                return Math.ceil((area * 10000) / (dist * dist));
            },
            resultText: (r) => `تحتاج تقريباً ${r} شتلة/بذرة (تقديري)`
        },
    };

    const data = modalContent[tool];
    if (!data) return;

    // Create Modal HTML dynamically
    const modalId = `tool-modal-${tool}`;
    // Remove existing if any
    const old = document.getElementById(modalId);
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'tool-modal';
    modal.style.display = 'block'; // Show immediately

    // Generate Fields HTML
    const fieldsHtml = data.fields.map(f => `
        <div class="form-group">
            <label>${f.label}</label>
            <input type="${f.type}" name="${f.name}" required class="form-control" style="width:100%; padding:10px; margin-bottom:10px;">
        </div>
    `).join('');

    modal.innerHTML = `
        <div class="modal-overlay" onclick="document.getElementById('${modalId}').remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${data.title}</h3>
                <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p>${data.description}</p>
                <form onsubmit="handleToolSubmit(event, '${tool}')">
                    ${fieldsHtml}
                    <button type="submit" class="btn btn-primary btn-block">احسب</button>
                </form>
                <div id="result-${tool}" class="tool-result" style="display:none; margin-top:15px; padding:10px; background:#e8f5e9; border-radius:5px;"></div>
            </div>
        </div>
    `;
    modalsContainer.appendChild(modal);

    // Attach handler function to window so onsubmit can find it
    window.handleToolSubmit = function (e, t) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const inputData = Object.fromEntries(formData.entries());
        const result = data.calculate(inputData);
        const resDiv = document.getElementById(`result-${t}`);
        resDiv.style.display = 'block';
        resDiv.innerHTML = `<strong>النتيجة:</strong> ${data.resultText(result)}`;
    };
}

// === سلة التسوق (Cart System) ===
function initCart() {
    const cartToggle = document.getElementById('cartToggle');
    const cartPreview = document.getElementById('cartPreview');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            cartPreview.classList.add('active');
            renderCart();
        });
    }
    if (cartClose) {
        cartClose.addEventListener('click', () => cartPreview.classList.remove('active'));
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => cartPreview.classList.remove('active'));
    }
    updateCartCount();
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (document.getElementById('cartPreview').classList.contains('active')) {
        renderCart();
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = count;
}

function renderCart() {
    const cartBody = document.getElementById('cartBody');
    const totalElem = document.getElementById('cartTotalAmount');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (cart.length === 0) {
        cartBody.innerHTML = '<div class="empty-cart"><p>السلة فارغة</p></div>';
        totalElem.textContent = '0 ر.س';
        return;
    }

    let total = 0;
    cartBody.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                <div style="display:flex; gap:10px;">
                    <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
                    <div>
                        <h4>${item.name}</h4>
                        <div style="font-size:0.9em; color:#666;">${item.price} ر.س × ${item.quantity}</div>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id})" style="color:red; background:none; border:none; cursor:pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    totalElem.textContent = total + ' ر.س';

    window.removeFromCart = function (id) {
        let c = JSON.parse(localStorage.getItem('cart') || '[]');
        c = c.filter(i => i.id !== id);
        localStorage.setItem('cart', JSON.stringify(c));
        renderCart();
        updateCartCount();
    };
}

// === نظام الإشعارات (Toast Notifications) ===
function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.style.cssText = `
        position: fixed; bottom: 20px; left: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white; padding: 15px 25px; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000;
        animation: fadeIn 0.3s forwards;
    `;
    notif.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${message}`;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}
