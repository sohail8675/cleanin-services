const servicesData = [
    // YEH HAMARI NAYI WATER TANK CLEANING SERVICE HAI
    { 
        title: "Water Tank Cleaning Service", 
        img: "img1.png", 
        detailImg: "img2.png", 
        rating: "Best Service", 
        price: "₹349", 
        oldPrice: "₹649" 
    },
    // Baaki purani services 
    { title: "Insta Help", img: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600", rating: "4.69", price: "₹99", oldPrice: "₹245" },
    { title: "Intense cleaning (3 bathrooms)", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600", rating: "4.80", price: "₹1,429", oldPrice: "₹1,587" },
    { title: "Foam-jet service (2 ACs)", img: "https://images.unsplash.com/photo-1621905251189-08b95d63329f?w=600", rating: "4.76", price: "₹1,098", oldPrice: "₹1,190" },
    { title: "Plumber consultation", img: "https://images.unsplash.com/photo-1621905251189-08b95d63329f?w=600", rating: "4.73", price: "₹49", oldPrice: "" }
];

/* --- System State Management --- */
let bookings = JSON.parse(localStorage.getItem('DUST_Out_bookings')) || [];

/* --- Smart Booking ID Generator --- */
function generateBookingId() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const datePrefix = 'BK-' + day + month + year;
    
    const todayBookings = bookings.filter(b => b.id.startsWith(datePrefix));
    
    let maxNumber = 0;
    todayBookings.forEach(booking => {
        const lastTwoDigits = parseInt(booking.id.slice(-2));
        if (lastTwoDigits > maxNumber) {
            maxNumber = lastTwoDigits;
        }
    });
    
    const nextNumber = String(maxNumber + 1).padStart(2, '0');
    return datePrefix + nextNumber;
}

/* --- Router Logic --- */
function router(pageId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    
    const activeSection = document.getElementById(pageId);
    if(activeSection) {
        activeSection.classList.add('active');
        window.scrollTo(0,0);
    }
    
    const navList = document.querySelector('.nav-list');
    if(navList) navList.classList.remove('active');

    if(pageId === 'admin-panel') renderAdminPanel();
    if(pageId === 'partner-panel') renderPartnerPanel();
}

/* --- Initialization --- */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Render Services on Services Page
    const serviceGrid = document.getElementById('services-grid');
    if(serviceGrid) {
        servicesData.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.style.cursor = 'pointer'; 
            
            card.addEventListener('click', () => {
                openServiceDetail(service);
            });

            // Yahan check kar rahe hain ki agar "Best Service" likha hai to Star ki jagah Award icon aaye
            let ratingIcon = service.rating === "Best Service" ? "fa-award" : "fa-star";
            let ratingColor = service.rating === "Best Service" ? "#f59e0b" : "#f59e0b";

            card.innerHTML = `
                <img src="${service.img}" class="service-img" alt="${service.title}">
                <div class="service-content">
                    <h3>${service.title}</h3>
                    <div class="rating" style="color: ${ratingColor}; font-weight: bold;">
                        <i class="fa-solid ${ratingIcon}"></i> ${service.rating}
                    </div>
                    <div class="price-box">
                        <span class="price">${service.price}</span>
                        <span class="old-price">${service.oldPrice}</span>
                    </div>
                </div>
            `;
            serviceGrid.appendChild(card);
        });
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navList = document.getElementById('nav-list');
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }

    // 3. Populate Custom Image Dropdown
    const dropdown = document.getElementById('custom-dropdown');
    const selectedOption = document.getElementById('selected-option');
    const optionsList = document.getElementById('options-list');
    const hiddenInput = document.getElementById('service-select');

    if (dropdown && optionsList) {
        servicesData.forEach(service => {
            const item = document.createElement('div');
            item.className = 'option-item';
            
            item.innerHTML = `
                <img src="${service.img}" class="option-thumb" alt="${service.title}">
                <div class="option-info">
                    <h4>${service.title}</h4>
                    <span>${service.price}</span>
                </div>
            `;

            item.addEventListener('click', () => {
                selectedOption.innerHTML = `
                    <div class="selected-display">
                        <img src="${service.img}" alt="icon">
                        <span>${service.title} - ${service.price}</span>
                    </div>
                    <i class="fa-solid fa-check" style="color:green"></i>
                `;
                hiddenInput.value = `${service.title} (${service.price})`;
                optionsList.classList.remove('active');

                // JADOO: Tank Capacity hide/show karne ka logic
                const capGroup = document.getElementById('capacity-group');
                const capInput = document.getElementById('tank-cap');
                
                if(service.title.toLowerCase().includes('water tank')) {
                    capGroup.style.display = 'flex'; // Agar tank cleaning hai toh dikhao
                } else {
                    capGroup.style.display = 'none'; // Dusri service me chhupa do
                    capInput.value = 'Not Required'; // Admin panel me ye dikhega
                }
            });

            optionsList.appendChild(item);
        });

        selectedOption.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsList.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                optionsList.classList.remove('active');
            }
        });
    }

    // 4. Handle Booking Submission
    const bookingForm = document.getElementById('booking-form');
    let pendingBooking = null; 

    if(bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const selectedService = document.getElementById('service-select').value;

            if(!selectedService) {
                alert("Please select a service from the list!");
                return;
            }

            pendingBooking = {
                id: generateBookingId(),
                name: document.getElementById('cust-name').value,
                phone: document.getElementById('cust-phone').value,
                address: document.getElementById('cust-address').value,
                type: selectedService,
                capacity: document.getElementById('tank-cap').value,
                date: document.getElementById('service-date').value,
                time: document.getElementById('service-time').value,
                status: 'Upcoming',
                partnerAssigned: false
            };

            document.getElementById('preview-name').textContent = pendingBooking.name;
            document.getElementById('preview-phone').textContent = pendingBooking.phone;
            document.getElementById('preview-address').textContent = pendingBooking.address;
            document.getElementById('preview-service').textContent = pendingBooking.type;
            document.getElementById('preview-capacity').textContent = pendingBooking.capacity;
            document.getElementById('preview-date').textContent = pendingBooking.date;
            document.getElementById('preview-time').textContent = pendingBooking.time;

            router('booking-preview');
        });
    }

    // 5. Final Confirm Button
    const finalConfirmBtn = document.getElementById('final-confirm-btn');
    if(finalConfirmBtn) {
        finalConfirmBtn.addEventListener('click', () => {
            if(pendingBooking) {
                bookings.push(pendingBooking);
                localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));

                document.getElementById('display-booking-id').textContent = pendingBooking.id;
                document.getElementById('congrats-popup').classList.add('active');
                
                document.getElementById('booking-form').reset();
                
                const selectedOption = document.getElementById('selected-option');
                if(selectedOption) {
                    selectedOption.innerHTML = `
                        <span>-- Click to Choose Service --</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    `;
                }
                document.getElementById('service-select').value = '';
                
                pendingBooking = null;
            }
        });
    }

    // 6. GPS Location Logic
    const locationBtn = document.querySelector('.btn-location');
    const addressField = document.getElementById('cust-address');

    if(locationBtn) {
        locationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            const originalText = locationBtn.innerHTML;
            locationBtn.innerHTML = '<i class="fa-solid fa-spinner"></i> Locating...';

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    try {
                        // Naya Fast aur Reliable Location API
                        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                        const data = await response.json();
                        
                        // Ekdum clean aur chota address banayega
                        let cleanAddress = "";
                        if(data.locality) cleanAddress += data.locality + ", ";
                        if(data.city) cleanAddress += data.city + ", ";
                        if(data.principalSubdivision) cleanAddress += data.principalSubdivision + " ";
                        if(data.postcode) cleanAddress += "- " + data.postcode;
                        
                        addressField.value = cleanAddress !== "" ? cleanAddress : data.display_name;
                        locationBtn.innerHTML = originalText;
                    } catch (error) {
                        // Agar fail hua to direct Google maps ka link form me bhar dega
                        addressField.value = `https://www.google.com/maps?q=${lat},${lon}`;
                        alert("Added Google Maps Coordinates instead.");
                        locationBtn.innerHTML = originalText;
                    }
                },
                (error) => {
                    alert("Unable to retrieve your location. Please type manually or enable location permission.");
                    locationBtn.innerHTML = originalText;
                }
            );
        });
    }
});

/* ==========================================
   👑 VIP ADMIN DASHBOARD LOGIC (UPDATED WITH LOCATION & MAPS)
   ========================================== */
function renderAdminPanel() {
    const list = document.getElementById('admin-booking-list');
    const uSpan = document.getElementById('stat-upcoming');
    const oSpan = document.getElementById('stat-ongoing');
    const cSpan = document.getElementById('stat-completed');
    const rSpan = document.getElementById('stat-revenue'); 
    
    if(!list) return; 

    list.innerHTML = '';
    let stats = { upcoming: 0, ongoing: 0, completed: 0, revenue: 0 };

    const searchBox = document.getElementById('admin-search');
    const filterBox = document.getElementById('admin-filter');
    const searchText = searchBox ? searchBox.value.toLowerCase() : '';
    const filterStatus = filterBox ? filterBox.value : 'All';

    bookings.forEach(booking => {
        if(booking.status === 'Upcoming') stats.upcoming++;
        if(booking.status === 'Ongoing') stats.ongoing++;
        if(booking.status === 'Completed') {
            stats.completed++;
            let priceMatch = booking.type.match(/₹([\d,]+)/);
            if(priceMatch) {
                let priceVal = parseInt(priceMatch[1].replace(/,/g, ''));
                stats.revenue += priceVal;
            }
        }

        let matchSearch = booking.name.toLowerCase().includes(searchText) || booking.phone.includes(searchText) || booking.id.toLowerCase().includes(searchText) || booking.address.toLowerCase().includes(searchText);
        let matchFilter = (filterStatus === 'All') || (booking.status === filterStatus);

        if(matchSearch && matchFilter) {
            const row = document.createElement('tr');
            
            let actionBtns = `<div class="action-buttons">
                <button class="btn-view" onclick="viewBookingDetails('${booking.id}')" title="View Full Details"><i class="fa-solid fa-eye"></i> View</button>
            `;

            if(booking.status === 'Upcoming' && !booking.partnerAssigned) {
                actionBtns += `<button class="btn-assign" onclick="openAssignModal('${booking.id}')" title="Assign Partner"><i class="fa-solid fa-user-plus"></i></button>`;
                actionBtns += `<button class="btn-cancel" onclick="cancelBooking('${booking.id}')" title="Cancel Booking"><i class="fa-solid fa-xmark"></i></button>`;
            } else if (booking.status === 'Upcoming' && booking.partnerAssigned) {
                actionBtns += `<span style="color:#d97706; font-size:0.85rem; font-weight:bold; margin-left:5px;">👷 ${booking.partnerName}</span>`;
                actionBtns += `<button class="btn-cancel" onclick="cancelBooking('${booking.id}')" title="Cancel Booking" style="margin-left:5px;"><i class="fa-solid fa-xmark"></i></button>`;
            } else if (booking.status === 'Cancelled') {
                actionBtns += `<span style="color:#dc3545; font-size:0.85rem; font-weight:bold; margin-left:5px;">❌ Cancelled</span>`;
            } else {
                actionBtns += `<span style="color:#2e7d32; font-size:0.85rem; font-weight:bold; margin-left:5px;">✔️ Done</span>`;
            }
            actionBtns += `</div>`;

            let shortService = booking.type.split('(')[0];
            // Location ko chhota karke table mein dikhana taaki table kharab na ho
            let shortAddress = booking.address.length > 25 ? booking.address.substring(0, 25) + "..." : booking.address;

            row.innerHTML = `
                <td><strong>${booking.id}</strong></td>
                <td>
                    ${booking.name}<br>
                    <small style="color:#666"><i class="fa-solid fa-phone"></i> ${booking.phone}</small><br>
                    <small style="color:#17a2b8" title="${booking.address}"><i class="fa-solid fa-location-dot"></i> ${shortAddress}</small>
                </td>
                <td>${booking.date}<br><small style="color:#666"><i class="fa-regular fa-clock"></i> ${booking.time}</small></td>
                <td>${shortService}</td>
                <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
                <td>${actionBtns}</td>
            `;
            list.appendChild(row);
        }
    });

    if(uSpan) uSpan.innerText = stats.upcoming;
    if(oSpan) oSpan.innerText = stats.ongoing;
    if(cSpan) cSpan.innerText = stats.completed;
    if(rSpan) rSpan.innerText = '₹' + stats.revenue.toLocaleString('en-IN'); 
}

/* --- Partner Panel Logic --- */
// Ek memory jisme save hoga ki abhi kaunsa ladka login hai
let currentLoggedInPartner = '';

// Naya function: Login karne ke liye
function loginAsPartner() {
    currentLoggedInPartner = document.getElementById('login-partner-name').value;
    closeAdminModal('partner-login-modal');
    router('partner-panel'); // Ab dashboard khulega
}

function renderPartnerPanel() {
    const list = document.getElementById('partner-job-list');
    if(!list) return;

    list.innerHTML = '';

    // Dashboard ke upar us ladke ka naam dikhega jo login hai
    const headerObj = document.querySelector('.partner-header h1');
    if(headerObj && currentLoggedInPartner !== '') {
        headerObj.innerHTML = `👷 ${currentLoggedInPartner}'s Dashboard`;
    }

    // Ab sirf wahi job dikhegi jo is logged-in ladke ke naam pe assign hui hai
    // UPDATED: "Pending Payment" status bhi include karo
    const myJobs = bookings.filter(b => b.partnerAssigned && b.partnerName === currentLoggedInPartner);

    if(myJobs.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding: 50px 20px; background:#fff; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                            <i class="fa-solid fa-mug-hot" style="font-size:3rem; color:#ccc; margin-bottom:15px;"></i>
                            <h3 style="color:#666;">Relax, ${currentLoggedInPartner}!</h3>
                            <p style="color:#999;">You have no active jobs assigned right now.</p>
                          </div>`;
        return;
    }

    myJobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'equip-card'; 
        card.style.marginBottom = '20px';
        card.style.padding = '20px';
        
        // Status ke hisab se border color
        if(job.status === 'Pending Payment') {
            card.style.borderLeft = '5px solid #f57c00'; // Orange for pending payment
        } else if(job.status === 'Completed') {
            card.style.borderLeft = '5px solid #2e7d32'; // Green for completed
        } else {
            card.style.borderLeft = '5px solid var(--accent-blue)';
        }
        
        let buttons = '';
        
        if(job.status === 'Upcoming') {
            // Job start karne ka button
            buttons = `<button class="btn-primary" style="padding:10px 20px; font-weight:bold; background:#0a192f;" onclick="updateStatus('${job.id}', 'Ongoing')">
                        <i class="fa-solid fa-play"></i> Start Job
                       </button>`;
        } 
        else if(job.status === 'Ongoing') {
            // Generate Bill button - ye sirf "Pending Payment" mein le jayega
            buttons = `<button class="btn-primary" style="padding:10px 20px; font-weight:bold; background: #f57c00;" onclick="sendBillAndMarkPending('${job.id}')">
                        <i class="fa-solid fa-file-invoice-dollar"></i> Generate & Send Bill
                       </button>`;
        } 
        else if(job.status === 'Pending Payment') {
            // PENDING PAYMENT - Re-send bill ya Confirm Payment
            buttons = `
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="btn-primary" style="padding:10px 15px; font-weight:bold; background: #f57c00;" onclick="openBillingModal('${job.id}')">
                        <i class="fa-solid fa-paper-plane"></i> Re-Send Bill
                    </button>
                    <button class="btn-primary" style="padding:10px 15px; font-weight:bold; background: #2e7d32;" onclick="confirmPaymentReceived('${job.id}')">
                        <i class="fa-solid fa-check-double"></i> Payment Received ✅
                    </button>
                </div>
                <p style="color:#f57c00; font-size:0.85rem; margin-top:10px;">
                    <i class="fa-solid fa-clock"></i> Waiting for customer payment...
                </p>
            `;
        } 
        else if(job.status === 'Completed') {
            // Job completed
            buttons = `<span style="color:#2e7d32; font-weight:bold; font-size:1.1rem;">
                        <i class="fa-solid fa-circle-check"></i> Job Completed & Paid ✅
                       </span>`;
        }

        // Google Maps ka link
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`;

        // Status badge text
        let statusText = job.status;
        let statusClass = job.status.toLowerCase().replace(' ', '-');

        card.innerHTML = `
            <div style="width:100%">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                    <h3 style="color:var(--primary-blue); margin:0;">${job.type}</h3>
                    <span class="status-badge status-${statusClass}" style="font-size:1rem;">${statusText}</span>
                </div>
                
                <div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:15px;">
                    <p style="margin-bottom:8px;"><strong><i class="fa-solid fa-user"></i> Customer:</strong> ${job.name} 
                        <a href="tel:${job.phone}" style="color:#17a2b8; text-decoration:none; margin-left:10px; font-weight:bold;">
                            <i class="fa-solid fa-phone"></i> Call Now
                        </a>
                    </p>
                    <p style="margin-bottom:8px;"><strong><i class="fa-solid fa-location-dot"></i> Address:</strong> ${job.address}</p>
                    <a href="${mapLink}" target="_blank" style="display:inline-block; margin-top:5px; color:#2e7d32; font-weight:bold; text-decoration:none;">
                        <i class="fa-solid fa-map-location-dot"></i> Navigate with Google Maps
                    </a>
                </div>
                
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:15px; align-items:center;">
                    <div>
                        <p style="color:#666; font-size:0.9rem; margin-bottom:3px;"><i class="fa-regular fa-calendar"></i> Date: <strong>${job.date}</strong></p>
                        <p style="color:#666; font-size:0.9rem;"><i class="fa-regular fa-clock"></i> Time: <strong>${job.time}</strong></p>
                    </div>
                    <div style="text-align:right;">
                        ${buttons}
                    </div>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function updateStatus(id, newStatus) {
    const index = bookings.findIndex(b => b.id === id);
    if(index !== -1) {
        bookings[index].status = newStatus;
        localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));
        renderPartnerPanel();
    }
}

// Close Congratulations Popup and Go to Home
function closeCongratsPopup() {
    document.getElementById('congrats-popup').classList.remove('active');
    router('home');
}

// ===== FAQ TOGGLE FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });
});

// ===== STATS COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(statsSection);
}

// ==========================================
// NEW: SERVICE DETAIL & AUTO-SELECT LOGIC
// ==========================================

function openServiceDetail(service) {
    const detailContainer = document.getElementById('detail-card-content');
    if(!detailContainer) return;
    
    const dummyDesc = "Ensure your family's health with our professional Water Tank Cleaning Service. We use high-pressure water jets, advanced vacuum sludge removal, and safe anti-bacterial solutions. Our process guarantees 100% safe, crystal-clear, and germ-free water for your home.";
    
    const displayImg = service.detailImg ? service.detailImg : service.img;
    
    detailContainer.innerHTML = `
        <img src="${displayImg}" class="detail-img" alt="${service.title}">
        <div class="detail-info">
            <div class="detail-header">
                <div>
                    <h2>${service.title}</h2>
                    <div class="rating" style="font-size:1.1rem; color:#f59e0b; font-weight:bold;">
                        <i class="fa-solid fa-award"></i> ${service.rating}
                    </div>
                </div>
                <div class="detail-price">
                    ${service.price} 
                    <small style="color:#888; text-decoration:line-through; font-size:1.1rem; font-weight:normal;">${service.oldPrice}</small>
                </div>
            </div>
            
            <p class="detail-desc">${dummyDesc}</p>
            
            <h3 style="color:var(--primary-blue);">What's Included in this Service:</h3>
            <ul class="detail-features">
                <li><i class="fa-solid fa-check"></i> High-quality cleaning by trained professionals</li>
                <li><i class="fa-solid fa-check"></i> 100% Eco-friendly & safe chemicals used</li>
                <li><i class="fa-solid fa-check"></i> Complete sanitization and hygiene check</li>
                <li><i class="fa-solid fa-check"></i> Fast, reliable, and on-time service delivery</li>
            </ul>
            
            <button class="btn-book-large" onclick="bookPreselectedService('${service.title}', '${service.price}', '${service.img}')">
                <i class="fa-solid fa-calendar-check"></i> Book This Service Now
            </button>
        </div>
    `;
    
    router('service-detail');
}

function bookPreselectedService(title, price, img) {
    router('booking');
    
    const selectedOption = document.getElementById('selected-option');
    const hiddenInput = document.getElementById('service-select');
    
    if(selectedOption && hiddenInput) {
        selectedOption.innerHTML = `
            <div class="selected-display">
                <img src="${img}" alt="icon">
                <span>${title} - ${price}</span>
            </div>
            <i class="fa-solid fa-check" style="color:green"></i>
        `;
        
        hiddenInput.value = `${title} (${price})`;
    }
    
    setTimeout(() => {
        const bookingForm = document.getElementById('booking-form');
        if(bookingForm) {
            bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
}
// --- 👁️ View A to Z Details (With Google Maps) ---
function viewBookingDetails(id) {
    const booking = bookings.find(b => b.id === id);
    if(!booking) return;

    // Google Maps ka link banana
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`;

    const body = document.getElementById('full-details-body');
    body.innerHTML = `
        <div class="detail-item"><span class="detail-label">Booking ID</span><span class="detail-value">${booking.id}</span></div>
        <div class="detail-item"><span class="detail-label">Current Status</span><span class="detail-value status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></div>
        
        <div class="detail-item"><span class="detail-label">Customer Name</span><span class="detail-value">${booking.name}</span></div>
        <div class="detail-item"><span class="detail-label">Phone Number</span><span class="detail-value"><a href="tel:${booking.phone}" style="color:#17a2b8; text-decoration:none;"><i class="fa-solid fa-phone"></i> ${booking.phone}</a></span></div>
        
        <div class="detail-item" style="grid-column: 1 / -1;">
            <span class="detail-label">Full Address / Location</span>
            <span class="detail-value">${booking.address}</span><br>
            <a href="${mapLink}" target="_blank" style="display:inline-block; margin-top:8px; background:#e8f5e9; color:#2e7d32; padding:5px 10px; border-radius:4px; text-decoration:none; font-size:0.85rem; font-weight:bold;">
                <i class="fa-solid fa-map-location-dot"></i> Open in Google Maps
            </a>
        </div>
        
        <div class="detail-item" style="grid-column: 1 / -1;"><span class="detail-label">Service Selected & Price</span><span class="detail-value" style="color:#1C3F78;">${booking.type}</span></div>
        
        <div class="detail-item"><span class="detail-label">Tank Capacity</span><span class="detail-value">${booking.capacity}</span></div>
        <div class="detail-item"><span class="detail-label">Assigned Partner</span><span class="detail-value">${booking.partnerAssigned ? booking.partnerName : 'Not Assigned Yet'}</span></div>
        
        <div class="detail-item"><span class="detail-label">Service Date</span><span class="detail-value"><i class="fa-regular fa-calendar"></i> ${booking.date}</span></div>
        <div class="detail-item"><span class="detail-label">Preferred Time</span><span class="detail-value"><i class="fa-regular fa-clock"></i> ${booking.time}</span></div>
    `;
    openAdminModal('view-details-modal');
}
// --- Modals (Popups) Control ---
function openAdminModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}
function closeAdminModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// --- 👷 Assign Partner (Name Dropdown) ---
function openAssignModal(id) {
    document.getElementById('assign-booking-id').value = id;
    openAdminModal('assign-partner-modal');
}
function confirmAssignPartner() {
    const id = document.getElementById('assign-booking-id').value;
    const partnerName = document.getElementById('partner-select-dropdown').value;
    
    const index = bookings.findIndex(b => b.id === id);
    if(index !== -1) {
        bookings[index].partnerAssigned = true;
        bookings[index].partnerName = partnerName;
        localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));
        renderAdminPanel();
        closeAdminModal('assign-partner-modal');
        alert('Job successfully assigned to ' + partnerName + '!');
    }
}

// --- ❌ Cancel Booking ---
function cancelBooking(id) {
    if(confirm('Are you sure you want to CANCEL this booking? This action cannot be undone.')) {
        const index = bookings.findIndex(b => b.id === id);
        if(index !== -1) {
            bookings[index].status = 'Cancelled';
            localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));
            renderAdminPanel();
        }
    }
}

// --- 📥 Export to EXCEL (Magic Button) ---
function exportToExcel() {
    if(bookings.length === 0) {
        alert('No bookings available to download!');
        return;
    }

    // Excel ka format banana
    let csvContent = "Booking ID,Customer Name,Phone,Address,Service Type,Capacity,Date,Time,Status,Assigned Partner\n";

    bookings.forEach(b => {
        let cleanAddress = '"' + b.address.replace(/"/g, '""') + '"';
        let cleanType = '"' + b.type.replace(/"/g, '""') + '"';
        let partner = b.partnerName ? b.partnerName : 'Unassigned';
        
        let row = `${b.id},${b.name},${b.phone},${cleanAddress},${cleanType},${b.capacity},${b.date},${b.time},${b.status},${partner}`;
        csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "DUST_Out_Bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
/* ==========================================
   💰 BILLING & PAYMENT SYSTEM (PARTNER)
   ========================================== */
let currentBillingJob = null;

function openBillingModal(jobId) {
    const job = bookings.find(b => b.id === jobId);
    if(!job) {
        alert('❌ Job not found!');
        return;
    }
    
    // Job ko global variable mein save karo
    currentBillingJob = job;
    
    // Console mein debug
    console.log('📋 Opening billing for:', job);
    console.log('📱 Customer Phone:', job.phone);

    // Paise nikalna format me se
    let priceMatch = job.type.match(/₹([\d,]+)/);
    let price = priceMatch ? priceMatch[0] : '₹0';
    let amountOnly = priceMatch ? priceMatch[1].replace(/,/g, '') : '0';

    // Live UPI QR Code Generator
    let upiString = `upi://pay?pa=9652229160-2@ibl&pn=DUST%20Out&am=${amountOnly}&cu=INR`;
    let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    // Modal mein details bharna - PHONE NUMBER AUTO-FILL WITH CHECK
    const qrCodeImg = document.getElementById('upi-qr-code');
    const phoneInput = document.getElementById('bill-cust-phone');
    const jobIdInput = document.getElementById('billing-job-id');
    const billSummary = document.getElementById('bill-summary');
    
    if(qrCodeImg) qrCodeImg.src = qrUrl;
    
    // Customer ka phone number auto-fill karo
    if(phoneInput) {
        // Phone number clean karke set karo
        let cleanPhone = job.phone ? job.phone.replace(/\D/g, '') : '';
        // Agar 91 se start ho raha hai aur 12 digit hai to 91 hatao
        if(cleanPhone.startsWith('91') && cleanPhone.length === 12) {
            cleanPhone = cleanPhone.substring(2);
        }
        phoneInput.value = cleanPhone;
        console.log('✅ Phone auto-filled:', cleanPhone);
    }
    
    if(jobIdInput) jobIdInput.value = job.id;
    
    if(billSummary) {
        billSummary.innerHTML = `
            <p style="color:#666; font-size:0.9rem; margin-bottom:5px;">Booking ID: <strong>${job.id}</strong></p>
            <p style="color:#333; font-weight:bold; margin-bottom:5px;">Customer: ${job.name}</p>
            <p style="color:#666; font-size:0.9rem; margin-bottom:5px;">📱 Phone: <strong>${job.phone}</strong></p>
            <p style="color:#1C3F78; margin-bottom:10px;">${job.type}</p>
            <h2 style="color: #d97706; font-size: 2rem; margin:0;">Total Due: ${price}</h2>
        `;
    }

    // Modal kholo
    openAdminModal('billing-modal');
}
// WhatsApp par Bill + UPI PAYMENT LINK Bhejna
function sendWhatsAppBill() {
    // Check ki billing job hai ya nahi
    if(!currentBillingJob) {
        alert('❌ Error: No billing job found! Please try again.');
        return;
    }
    
    // Phone number input se lo
    let phone = document.getElementById('bill-cust-phone').value;
    
    // Phone number empty check
    if(!phone || phone.trim() === '') {
        alert('❌ Please enter customer phone number!');
        return;
    }
    
    // Phone number clean karo (sirf numbers rakho)
    phone = phone.replace(/\D/g, '');
    
    // Agar +91 ya 91 pehle se hai to hatao
    if(phone.startsWith('91') && phone.length > 10) {
        phone = phone.substring(2);
    }
    if(phone.startsWith('0')) {
        phone = phone.substring(1);
    }
    
    // Check ki 10 digit hai ya nahi
    if(phone.length !== 10) {
        alert('❌ Invalid phone number! Please enter 10 digit mobile number.');
        return;
    }
    
    // India country code add karo
    phone = '91' + phone;
    
    // Price nikalo service se
    let priceMatch = currentBillingJob.type.match(/₹([\d,]+)/);
    let price = priceMatch ? priceMatch[0] : '₹0';
    let amountOnly = priceMatch ? priceMatch[1].replace(/,/g, '') : '0';
    
    // =============================================
    // 🔥 UPI PAYMENT LINK BANANA (JADOO YAHAN HAI!)
    // =============================================
    // IMPORTANT: Neeche apna UPI ID daal do
    let upiId = '9652229160-2@ibl';  // <-- APNA UPI ID YAHAN DAALO
    let merchantName = 'DUST Out';
    let transactionNote = `Payment for ${currentBillingJob.id}`;
    
    // UPI Deep Link - Ye link click karne se GPay/PhonePe khulega
    let upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amountOnly}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Short Payment Message with Link
    let paymentSection = `\n💳 *PAY NOW - EASY & QUICK:*\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━\n` +
                         `👇 *Click below link to pay instantly:*\n\n` +
                         `${upiLink}\n\n` +
                         `☝️ Link click karo → UPI App khulega → PIN dalo → Done! ✅\n\n` +
                         `*OR* Manual Payment:\n` +
                         `📱 UPI ID: *${upiId}*\n` +
                         `💰 Amount: *${price}*\n`;

    // WhatsApp Digital Receipt Message with Payment Link
    let msg = `*🧾 DUST Out - Bill & Payment*\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
              `Hello *${currentBillingJob.name}* ji,\n\n` +
              `Aapki service complete ho gayi hai! ✅\n\n` +
              `📋 *Booking Details:*\n` +
              `• Booking ID: *${currentBillingJob.id}*\n` +
              `• Service: *${currentBillingJob.type}*\n` +
              `• Date: *${currentBillingJob.date}*\n` +
              `• Time: *${currentBillingJob.time}*\n` +
              `• Technician: *${currentBillingJob.partnerName}*\n\n` +
              `💰 *TOTAL AMOUNT: ${price}*\n` +
              `${paymentSection}\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n` +
              `🙏 Thank you for choosing *DUST Out*!\n` +
              `We ensure 100% Safe & Clean Water. 💧\n\n` +
              `📞 Helpline: +91 98765 43210\n` +
              `🌐 www.dustout.in\n\n` +
              `_Ye aapka digital bill + receipt hai._`;

    // WhatsApp URL banao
    let waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    
    // Console mein debug info
    console.log('📱 Sending WhatsApp to:', phone);
    console.log('💰 Amount:', amountOnly);
    console.log('🔗 UPI Link:', upiLink);
    
    // WhatsApp kholo
    window.open(waUrl, '_blank');
}


/* ==========================================
   💰 NEW PAYMENT VERIFICATION SYSTEM
   ========================================== */

// Step 1: Bill generate karo aur status "Pending Payment" karo
function sendBillAndMarkPending(jobId) {
    const job = bookings.find(b => b.id === jobId);
    if(!job) {
        alert('❌ Job not found!');
        return;
    }
    
    // Status update karo to "Pending Payment"
    const index = bookings.findIndex(b => b.id === jobId);
    if(index !== -1) {
        bookings[index].status = 'Pending Payment';
        localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));
    }
    
    // Billing modal kholo
    openBillingModal(jobId);
    
    // Partner panel refresh karo
    renderPartnerPanel();
}

// Step 2: Payment confirm hone par "Completed" karo
function confirmPaymentReceived(jobId) {
    // Confirmation popup
    let confirmed = confirm(
        '💰 PAYMENT CONFIRMATION\n\n' +
        'Kya aapne customer se payment receive kar li hai?\n\n' +
        '✅ OK = Haan, payment aa gayi\n' +
        '❌ Cancel = Nahi, abhi nahi aayi'
    );
    
    if(confirmed) {
        // Double confirmation for safety
        let doubleConfirm = confirm(
            '⚠️ FINAL CONFIRMATION\n\n' +
            'Ek baar payment confirm hone ke baad\n' +
            'ye job COMPLETED ho jayegi.\n\n' +
            'Kya aap sure hain?'
        );
        
        if(doubleConfirm) {
            const index = bookings.findIndex(b => b.id === jobId);
            if(index !== -1) {
                bookings[index].status = 'Completed';
                localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));
                
                alert('🎉 Payment Confirmed!\n\nJob successfully completed.');
                
                renderPartnerPanel();
            }
        }
    }
}

// Updated: finalizeJobAndPayment - Ab ye sirf bill close karega, complete nahi
function finalizeJobAndPaymentOLD() {
    // Ye function ab use nahi hoga
}
/* ==========================================
   🔥 NEW COMPLETE PARTNER & BILLING SYSTEM
   ========================================== */

// Current active tab
let currentPartnerTab = 'upcoming';

// Switch between tabs
function switchPartnerTab(tabName) {
    currentPartnerTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.partner-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.closest('.partner-tab').classList.add('active');
    
    // Re-render the panel
    renderPartnerPanel();
}

// Main render function for Partner Panel
function renderPartnerPanel() {
    const list = document.getElementById('partner-job-list');
    if(!list) return;

    list.innerHTML = '';

    // Update header with partner name
    const headerObj = document.querySelector('.partner-header h1');
    if(headerObj && currentLoggedInPartner !== '') {
        headerObj.innerHTML = `👷 ${currentLoggedInPartner}'s Dashboard`;
    }

    // Filter jobs for this partner
    const myJobs = bookings.filter(b => b.partnerAssigned && b.partnerName === currentLoggedInPartner);

    // Count jobs by status
    const upcomingJobs = myJobs.filter(j => j.status === 'Upcoming');
    const ongoingJobs = myJobs.filter(j => j.status === 'Ongoing');
    const pendingJobs = myJobs.filter(j => j.status === 'Pending Payment');
    const completedJobs = myJobs.filter(j => j.status === 'Completed');

    // Update tab counts
    const tabUpcoming = document.getElementById('tab-count-upcoming');
    const tabOngoing = document.getElementById('tab-count-ongoing');
    const tabPending = document.getElementById('tab-count-pending');
    const tabCompleted = document.getElementById('tab-count-completed');
    
    if(tabUpcoming) tabUpcoming.textContent = upcomingJobs.length;
    if(tabOngoing) tabOngoing.textContent = ongoingJobs.length;
    if(tabPending) tabPending.textContent = pendingJobs.length;
    if(tabCompleted) tabCompleted.textContent = completedJobs.length;

    // Calculate stats
    let totalCash = 0;
    let totalEarnings = 0;
    let todaysJobs = 0;
    const today = new Date().toISOString().split('T')[0];

    completedJobs.forEach(job => {
        let priceMatch = job.type.match(/₹([\d,]+)/);
        if(priceMatch) {
            let amount = parseInt(priceMatch[1].replace(/,/g, ''));
            totalEarnings += amount;
            if(job.paymentMethod === 'Cash') {
                totalCash += amount;
            }
        }
    });

    myJobs.forEach(job => {
        if(job.date === today) todaysJobs++;
    });

    // Update stats
    const statToday = document.getElementById('partner-stat-today');
    const statCompleted = document.getElementById('partner-stat-completed');
    const statCash = document.getElementById('partner-stat-cash');
    const statEarnings = document.getElementById('partner-stat-earnings');
    
    if(statToday) statToday.textContent = todaysJobs;
    if(statCompleted) statCompleted.textContent = completedJobs.length;
    if(statCash) statCash.textContent = '₹' + totalCash.toLocaleString('en-IN');
    if(statEarnings) statEarnings.textContent = '₹' + totalEarnings.toLocaleString('en-IN');

    // Get jobs based on current tab
    let displayJobs = [];
    switch(currentPartnerTab) {
        case 'upcoming':
            displayJobs = upcomingJobs;
            break;
        case 'ongoing':
            displayJobs = ongoingJobs;
            break;
        case 'pending':
            displayJobs = pendingJobs;
            break;
        case 'completed':
            displayJobs = completedJobs;
            break;
    }

    // Empty state
    if(displayJobs.length === 0) {
        let emptyMessage = '';
        let emptyIcon = '';
        
        switch(currentPartnerTab) {
            case 'upcoming':
                emptyIcon = 'fa-calendar-xmark';
                emptyMessage = 'No upcoming jobs assigned.';
                break;
            case 'ongoing':
                emptyIcon = 'fa-mug-hot';
                emptyMessage = 'No jobs in progress right now. Relax!';
                break;
            case 'pending':
                emptyIcon = 'fa-check-circle';
                emptyMessage = 'Great! No pending payments.';
                break;
            case 'completed':
                emptyIcon = 'fa-history';
                emptyMessage = 'No completed jobs yet. Start working!';
                break;
        }
        
        list.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid ${emptyIcon}"></i>
                <h3>${emptyMessage}</h3>
                <p>Check other tabs for more jobs.</p>
            </div>
        `;
        return;
    }

    // Render job cards based on tab
    displayJobs.forEach(job => {
        if(currentPartnerTab === 'completed') {
            // History card for completed jobs
            renderHistoryCard(list, job);
        } else {
            // Active job card
            renderJobCard(list, job);
        }
    });
}

// Render active job card
function renderJobCard(container, job) {
    const card = document.createElement('div');
    card.className = 'equip-card';
    card.style.marginBottom = '20px';
    card.style.padding = '20px';
    
    // Border color based on status
    if(job.status === 'Pending Payment') {
        card.style.borderLeft = '5px solid #f57c00';
    } else if(job.status === 'Ongoing') {
        card.style.borderLeft = '5px solid #1976d2';
    } else {
        card.style.borderLeft = '5px solid var(--accent-blue)';
    }
    
    // Action buttons based on status
    let buttons = '';
    
    if(job.status === 'Upcoming') {
        buttons = `
            <button class="btn-primary" style="padding:12px 25px; font-weight:bold; background:#0a192f;" onclick="updateStatus('${job.id}', 'Ongoing')">
                <i class="fa-solid fa-play"></i> Start Job
            </button>
        `;
    } 
    else if(job.status === 'Ongoing') {
        buttons = `
            <button class="btn-primary" style="padding:12px 25px; font-weight:bold; background: linear-gradient(135deg, #f57c00, #ff9800);" onclick="openBillingModal('${job.id}')">
                <i class="fa-solid fa-file-invoice-dollar"></i> Generate Bill
            </button>
        `;
    } 
    else if(job.status === 'Pending Payment') {
        buttons = `
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn-primary" style="padding:10px 20px; font-weight:bold; background: #f57c00;" onclick="openBillingModal('${job.id}')">
                    <i class="fa-solid fa-redo"></i> Re-open Bill
                </button>
            </div>
            <p style="color:#f57c00; font-size:0.85rem; margin-top:10px;">
                <i class="fa-solid fa-clock"></i> Waiting for payment confirmation...
            </p>
        `;
    }

    // Google Maps link
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`;

    card.innerHTML = `
        <div style="width:100%">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                <h3 style="color:var(--primary-blue); margin:0;">${job.type}</h3>
                <span class="status-badge status-${job.status.toLowerCase().replace(' ', '-')}" style="font-size:0.9rem;">${job.status}</span>
            </div>
            
            <div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:15px;">
                <p style="margin-bottom:8px;">
                    <strong><i class="fa-solid fa-user"></i> Customer:</strong> ${job.name} 
                    <a href="tel:${job.phone}" style="color:#17a2b8; text-decoration:none; margin-left:10px; font-weight:bold;">
                        <i class="fa-solid fa-phone"></i> Call
                    </a>
                </p>
                <p style="margin-bottom:8px;">
                    <strong><i class="fa-solid fa-location-dot"></i> Address:</strong> ${job.address}
                </p>
                <a href="${mapLink}" target="_blank" style="display:inline-block; margin-top:5px; color:#2e7d32; font-weight:bold; text-decoration:none;">
                    <i class="fa-solid fa-map-location-dot"></i> Open in Maps
                </a>
            </div>
            
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:15px; align-items:center;">
                <div>
                    <p style="color:#666; font-size:0.9rem; margin-bottom:3px;">
                        <i class="fa-regular fa-calendar"></i> Date: <strong>${job.date}</strong>
                    </p>
                    <p style="color:#666; font-size:0.9rem;">
                        <i class="fa-regular fa-clock"></i> Time: <strong>${job.time}</strong>
                    </p>
                </div>
                <div style="text-align:right;">
                    ${buttons}
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(card);
}

// Render history card for completed jobs
function renderHistoryCard(container, job) {
    const card = document.createElement('div');
    card.className = 'history-card ' + (job.paymentMethod === 'Cash' ? 'cash-paid' : 'online-paid');
    
    // Extract price
    let priceMatch = job.type.match(/₹([\d,]+)/);
    let price = priceMatch ? priceMatch[0] : '₹0';
    
    // Payment badge
    let paymentBadge = '';
    if(job.paymentMethod === 'Cash') {
        paymentBadge = `<span class="payment-badge payment-cash"><i class="fa-solid fa-money-bill"></i> Cash</span>`;
    } else if(job.paymentMethod === 'Online') {
        paymentBadge = `<span class="payment-badge payment-online"><i class="fa-solid fa-mobile-screen"></i> Online</span>`;
    }
    
    card.innerHTML = `
        <div class="history-info">
            <h4>${job.type.split('(')[0]}</h4>
            <p><i class="fa-solid fa-user"></i> ${job.name}</p>
            <p><i class="fa-regular fa-calendar"></i> ${job.date} | <i class="fa-regular fa-clock"></i> ${job.time}</p>
            <p><i class="fa-solid fa-location-dot"></i> ${job.address.substring(0, 40)}...</p>
        </div>
        <div class="history-amount">
            ${paymentBadge}
            <div class="amount">${price}</div>
            <span class="status-badge status-completed" style="margin-top:5px;">Completed ✓</span>
        </div>
    `;
    
    container.appendChild(card);
}

// Open Billing Modal - Updated
function openBillingModal(jobId) {
    const job = bookings.find(b => b.id === jobId);
    if(!job) {
        alert('❌ Job not found!');
        return;
    }
    
    currentBillingJob = job;
    console.log('📋 Opening billing for:', job);

    // Extract price
    let priceMatch = job.type.match(/₹([\d,]+)/);
    let price = priceMatch ? priceMatch[0] : '₹0';
    let amountOnly = priceMatch ? priceMatch[1].replace(/,/g, '') : '0';

    // UPI QR Code
    let upiId = '9652229160-2@ibl';
    let upiString = `upi://pay?pa=${upiId}&pn=DUST%20Out&am=${amountOnly}&cu=INR`;
    let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    // Set QR code
    const qrImg = document.getElementById('upi-qr-code');
    if(qrImg) qrImg.src = qrUrl;
    
    // Set phone number
    const phoneInput = document.getElementById('bill-cust-phone');
    if(phoneInput) {
        let cleanPhone = job.phone ? job.phone.replace(/\D/g, '') : '';
        if(cleanPhone.startsWith('91') && cleanPhone.length === 12) {
            cleanPhone = cleanPhone.substring(2);
        }
        phoneInput.value = cleanPhone;
    }
    
    // Set job ID
    const jobIdInput = document.getElementById('billing-job-id');
    if(jobIdInput) jobIdInput.value = job.id;
    
    // Bill summary
    const billSummary = document.getElementById('bill-summary');
    if(billSummary) {
        billSummary.innerHTML = `
            <p style="color:#666; font-size:0.85rem; margin-bottom:8px;">Booking ID: <strong>${job.id}</strong></p>
            <p style="color:#333; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">${job.name}</p>
            <p style="color:#1C3F78; margin-bottom:15px; font-size:0.95rem;">${job.type}</p>
            <div style="background: linear-gradient(135deg, #1C3F78, #46BCC6); color:#fff; padding:15px; border-radius:8px;">
                <p style="font-size:0.9rem; margin-bottom:5px;">Total Amount</p>
                <h2 style="font-size: 2.2rem; margin:0;">${price}</h2>
            </div>
        `;
    }

    openAdminModal('billing-modal');
}

// Cash Payment Collection
function collectCashPayment() {
    if(!currentBillingJob) {
        alert('❌ Error: No job found!');
        return;
    }
    
    // Extract price for display
    let priceMatch = currentBillingJob.type.match(/₹([\d,]+)/);
    let price = priceMatch ? priceMatch[0] : '₹0';
    
    // Confirmation
    let confirmed = confirm(
        `💵 CASH COLLECTION CONFIRMATION\n\n` +
        `Customer: ${currentBillingJob.name}\n` +
        `Amount: ${price}\n\n` +
        `Kya aapne ${price} CASH mein collect kar liye?\n\n` +
        `✅ OK = Haan, cash le liya\n` +
        `❌ Cancel = Nahi, abhi nahi`
    );
    
    if(confirmed) {
        // Update booking
        const index = bookings.findIndex(b => b.id === currentBillingJob.id);
        if(index !== -1) {
            bookings[index].status = 'Completed';
            bookings[index].paymentMethod = 'Cash';
            bookings[index].paymentDate = new Date().toISOString();
            
            localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));
            
            alert(
                `✅ CASH COLLECTED!\n\n` +
                `Amount: ${price}\n` +
                `Job marked as COMPLETED.\n\n` +
                `Thank you! 🎉`
            );
            
            closeAdminModal('billing-modal');
            renderPartnerPanel();
            renderAdminPanel();
        }
    }
}

// Online Payment Confirmation
function confirmOnlinePayment() {
    if(!currentBillingJob) {
        alert('❌ Error: No job found!');
        return;
    }
    
    // Extract price
    let priceMatch = currentBillingJob.type.match(/₹([\d,]+)/);
    let price = priceMatch ? priceMatch[0] : '₹0';
    
    // First confirmation
    let confirmed = confirm(
        `📱 ONLINE PAYMENT CONFIRMATION\n\n` +
        `Customer: ${currentBillingJob.name}\n` +
        `Amount: ${price}\n\n` +
        `Kya customer ne ONLINE payment kar di?\n` +
        `(UPI / GPay / PhonePe / Paytm)\n\n` +
        `✅ OK = Haan, payment aa gayi\n` +
        `❌ Cancel = Nahi, wait karo`
    );
    
    if(confirmed) {
        // Double confirmation
        let doubleConfirm = confirm(
            `⚠️ FINAL CHECK\n\n` +
            `Kya aapne apne UPI app mein check kiya?\n` +
            `${price} payment receive hui?\n\n` +
            `Confirm karne ke baad job COMPLETED ho jayegi.`
        );
        
        if(doubleConfirm) {
            // Update booking
            const index = bookings.findIndex(b => b.id === currentBillingJob.id);
            if(index !== -1) {
                bookings[index].status = 'Completed';
                bookings[index].paymentMethod = 'Online';
                bookings[index].paymentDate = new Date().toISOString();
                
                localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));
                
                alert(
                    `✅ ONLINE PAYMENT CONFIRMED!\n\n` +
                    `Amount: ${price}\n` +
                    `Job marked as COMPLETED.\n\n` +
                    `Thank you! 🎉`
                );
                
                closeAdminModal('billing-modal');
                renderPartnerPanel();
                renderAdminPanel();
            }
        }
    } else {
        // Mark as pending payment
        const index = bookings.findIndex(b => b.id === currentBillingJob.id);
        if(index !== -1 && bookings[index].status === 'Ongoing') {
            bookings[index].status = 'Pending Payment';
            localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));
            
            alert(
                `📋 PAYMENT PENDING\n\n` +
                `Job ko "Pending Payment" mein move kar diya.\n` +
                `Jab payment aaye, wapas bill khol kar confirm karo.`
            );
            
            closeAdminModal('billing-modal');
            renderPartnerPanel();
        }
    }
}

// WhatsApp Bill with Payment Link - Updated
function sendWhatsAppBill() {
    if(!currentBillingJob) {
        alert('❌ Error: No billing job found!');
        return;
    }
    
    let phone = document.getElementById('bill-cust-phone').value;
    
    if(!phone || phone.trim() === '') {
        alert('❌ Please enter customer phone number!');
        return;
    }
    
    // Clean phone number
    phone = phone.replace(/\D/g, '');
    if(phone.startsWith('91') && phone.length > 10) {
        phone = phone.substring(2);
    }
    if(phone.startsWith('0')) {
        phone = phone.substring(1);
    }
    
    if(phone.length !== 10) {
        alert('❌ Invalid phone number! Enter 10 digit mobile number.');
        return;
    }
    
    phone = '91' + phone;
    
    // Extract price
    let priceMatch = currentBillingJob.type.match(/₹([\d,]+)/);
    let price = priceMatch ? priceMatch[0] : '₹0';
    let amountOnly = priceMatch ? priceMatch[1].replace(/,/g, '') : '0';
    
    // UPI Payment Link
    let upiId = '9652229160-2@ibl';
    let upiLink = `upi://pay?pa=${upiId}&pn=DUST%20Out&am=${amountOnly}&cu=INR&tn=Payment%20for%20${currentBillingJob.id}`;
    
    // WhatsApp Message
    let msg = `*🧾 DUST Out - Bill*\n` +
              `━━━━━━━━━━━━━━━━━━\n\n` +
              `Hello *${currentBillingJob.name}* ji,\n\n` +
              `Aapki service complete! ✅\n\n` +
              `📋 *Details:*\n` +
              `• ID: *${currentBillingJob.id}*\n` +
              `• Service: *${currentBillingJob.type}*\n` +
              `• Date: *${currentBillingJob.date}*\n` +
              `• Technician: *${currentBillingJob.partnerName}*\n\n` +
              `💰 *TOTAL: ${price}*\n\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `*📱 PAY ONLINE:*\n` +
              `👇 Click to pay instantly:\n\n` +
              `${upiLink}\n\n` +
              `_Link click karo → UPI app khulega → PIN dalo → Done!_\n\n` +
              `*OR* UPI ID: *${upiId}*\n\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `🙏 Thank you for choosing *DUST Out*! 💧`;

    let waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    
    // Mark as pending if still ongoing
    const index = bookings.findIndex(b => b.id === currentBillingJob.id);
    if(index !== -1 && bookings[index].status === 'Ongoing') {
        bookings[index].status = 'Pending Payment';
        localStorage.setItem('DUST_Out_bookings', JSON.stringify(bookings));
        renderPartnerPanel();
    }
    
    window.open(waUrl, '_blank');
}