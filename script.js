/* --- Data Configuration --- */
/* --- Data Configuration --- */
const servicesData = [
    { title: "Intense cleaning (2 bathrooms)", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600", rating: "4.80", price: "₹979", oldPrice: "₹1,058" },
    { title: "Insta Help", img: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600", rating: "4.69", price: "₹99", oldPrice: "₹245" },
    { title: "Intense cleaning (3 bathrooms)", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600", rating: "4.80", price: "₹1,429", oldPrice: "₹1,587" },
    { title: "Foam-jet service (2 ACs)", img: "https://images.unsplash.com/photo-1621905251189-08b95d63329f?w=600", rating: "4.76", price: "₹1,098", oldPrice: "₹1,190" },
    { title: "Plumber consultation", img: "https://images.unsplash.com/photo-1621905251189-08b95d63329f?w=600", rating: "4.73", price: "₹49", oldPrice: "" }
];
/* --- System State Management --- */
let bookings = JSON.parse(localStorage.getItem('Cleanin_bookings')) || [];
/* --- Smart Booking ID Generator --- */
function generateBookingId() {
    // Step 1: Aaj ki date lo
    const today = new Date();
    
    // Step 2: Date ko format karo (DD, MM, YY)
    const day = String(today.getDate()).padStart(2, '0');      // 28
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 03
    const year = String(today.getFullYear()).slice(-2);         // 26
    
    // Step 3: Date prefix banao (280326)
    const datePrefix = 'BK-' + day + month + year;
    
    // Step 4: Aaj ki saari bookings dhundho
    const todayBookings = bookings.filter(b => b.id.startsWith(datePrefix));
    
    // Step 5: Sabse bada number dhundho
    let maxNumber = 0;
    todayBookings.forEach(booking => {
        // Last 2 digits nikalo (01, 02, 03...)
        const lastTwoDigits = parseInt(booking.id.slice(-2));
        if (lastTwoDigits > maxNumber) {
            maxNumber = lastTwoDigits;
        }
    });
    
    // Step 6: Agla number banao (01, 02, 03...)
    const nextNumber = String(maxNumber + 1).padStart(2, '0');
    
    // Step 7: Final Booking ID return karo
    // Example: BK-28032601
    return datePrefix + nextNumber;
}
/* --- Router Logic --- */
function router(pageId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    
    // Show selected section
    const activeSection = document.getElementById(pageId);
    if(activeSection) {
        activeSection.classList.add('active');
        window.scrollTo(0,0);
    }
    
    // Close mobile menu if open
    const navList = document.querySelector('.nav-list');
    if(navList) navList.classList.remove('active');

    // If opening Admin or Partner, refresh data
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
            card.style.cursor = 'pointer'; // Hath wala icon aayega
            
            // JAB CARD PE CLICK HO
            card.addEventListener('click', () => {
                openServiceDetail(service);
            });

            card.innerHTML = `
                <img src="${service.img}" class="service-img" alt="${service.title}">
                <div class="service-content">
                    <h3>${service.title}</h3>
                    <div class="rating"><i class="fa-solid fa-star"></i> ${service.rating}</div>
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

       // 3. Populate Custom Image Dropdown (NEW CODE)
    const dropdown = document.getElementById('custom-dropdown');
    const selectedOption = document.getElementById('selected-option');
    const optionsList = document.getElementById('options-list');
    const hiddenInput = document.getElementById('service-select');

    if (dropdown && optionsList) {
        
        // Step A: Data se list banao
        servicesData.forEach(service => {
            const item = document.createElement('div');
            item.className = 'option-item';
            
            // Photo, Naam aur Price set karna
            item.innerHTML = `
                <img src="${service.img}" class="option-thumb" alt="${service.title}">
                <div class="option-info">
                    <h4>${service.title}</h4>
                    <span>${service.price}</span>
                </div>
            `;

            // Step B: Jab koi option click kare
            item.addEventListener('click', () => {
                // 1. Box ke upar dikhao ki kya select hua
                selectedOption.innerHTML = `
                    <div class="selected-display">
                        <img src="${service.img}" alt="icon">
                        <span>${service.title} - ${service.price}</span>
                    </div>
                    <i class="fa-solid fa-check" style="color:green"></i>
                `;
                
                // 2. Hidden input mein value daalo (Form submit ke liye)
                hiddenInput.value = `${service.title} (${service.price})`;
                
                // 3. List band kar do
                optionsList.classList.remove('active');
            });

            optionsList.appendChild(item);
        });

        // Step C: Dropdown kholne/band karne ka logic
        selectedOption.addEventListener('click', (e) => {
            e.stopPropagation(); // Click bahar na jaye
            optionsList.classList.toggle('active');
        });

        // Step D: Agar bahar click kiya to list band ho jaye
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                optionsList.classList.remove('active');
            }
        });
    }

  // 4. Handle Booking Submission - NOW SHOWS PREVIEW PAGE
const bookingForm = document.getElementById('booking-form');
let pendingBooking = null; // Temporary storage for booking data

if(bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get selected service from dropdown
        const selectedService = document.getElementById('service-select').value;

        if(!selectedService) {
            alert("Please select a service from the list!");
            return;
        }

        // Create booking object (but don't save yet)
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

        // Fill the preview page with data
        document.getElementById('preview-name').textContent = pendingBooking.name;
        document.getElementById('preview-phone').textContent = pendingBooking.phone;
        document.getElementById('preview-address').textContent = pendingBooking.address;
        document.getElementById('preview-service').textContent = pendingBooking.type;
        document.getElementById('preview-capacity').textContent = pendingBooking.capacity;
        document.getElementById('preview-date').textContent = pendingBooking.date;
        document.getElementById('preview-time').textContent = pendingBooking.time;

        // Go to preview page
        router('booking-preview');
    });
}

// 5. Final Confirm Button - Shows Congratulations Popup
const finalConfirmBtn = document.getElementById('final-confirm-btn');
if(finalConfirmBtn) {
    finalConfirmBtn.addEventListener('click', () => {
        if(pendingBooking) {
            // Save booking to localStorage
            bookings.push(pendingBooking);
            localStorage.setItem('Cleanin_bookings', JSON.stringify(bookings));
            
            // Show booking ID in popup
            document.getElementById('display-booking-id').textContent = pendingBooking.id;
            
            // Show congratulations popup with confetti
            document.getElementById('congrats-popup').classList.add('active');
            
            // Reset form
            document.getElementById('booking-form').reset();
            
            // Reset selected option display
            const selectedOption = document.getElementById('selected-option');
            if(selectedOption) {
                selectedOption.innerHTML = `
                    <span>-- Click to Choose Service --</span>
                    <i class="fa-solid fa-chevron-down"></i>
                `;
            }
            document.getElementById('service-select').value = '';
            
            // Clear pending booking
            pendingBooking = null;
        }
    });
}
    // 5. GPS Location Logic (Live Location Fix)
    const locationBtn = document.querySelector('.btn-location');
    const addressField = document.getElementById('cust-address');

    if(locationBtn) {
        locationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            // Button ko loading dikhana
            const originalText = locationBtn.innerHTML;
            locationBtn.innerHTML = '<i class="fa-solid fa-spinner"></i> Locating...';

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    // OpenStreetMap API se address nikalna (Free)
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const data = await response.json();
                        addressField.value = data.display_name; // Address box mein bhar dena
                        locationBtn.innerHTML = originalText;
                    } catch (error) {
                        addressField.value = `Latitude: ${lat}, Longitude: ${lon}`;
                        alert("Could not fetch address text, but coordinates saved.");
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

/* --- Admin Panel Logic --- */
function renderAdminPanel() {
    const list = document.getElementById('admin-booking-list');
    const uSpan = document.getElementById('stat-upcoming');
    const oSpan = document.getElementById('stat-ongoing');
    const cSpan = document.getElementById('stat-completed');
    
    if(!list) return; // Safety check

    list.innerHTML = '';
    let stats = { upcoming: 0, ongoing: 0, completed: 0 };

    bookings.forEach(booking => {
        // Count stats
        if(booking.status === 'Upcoming') stats.upcoming++;
        if(booking.status === 'Ongoing') stats.ongoing++;
        if(booking.status === 'Completed') stats.completed++;

        const row = document.createElement('tr');
        // Action Button Logic
        let actionBtn = '';
        if(booking.status === 'Upcoming' && !booking.partnerAssigned) {
            actionBtn = `<button class="btn-action" onclick="assignPartner('${booking.id}')">Assign Partner</button>`;
        } else {
            actionBtn = '<span style="color:#aaa">Assigned</span>';
        }

        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.name}<br><small>${booking.phone}</small></td>
            <td>${booking.date}</td>
            <td>${booking.type}</td>
            <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
            <td>${actionBtn}</td>
        `;
        list.appendChild(row);
    });

    if(uSpan) uSpan.innerText = stats.upcoming;
    if(oSpan) oSpan.innerText = stats.ongoing;
    if(cSpan) cSpan.innerText = stats.completed;
}

function assignPartner(bookingId) {
    const index = bookings.findIndex(b => b.id === bookingId);
    if(index !== -1) {
        bookings[index].partnerAssigned = true; // Simulating assignment to logged in partner
        localStorage.setItem('Cleanin_bookings', JSON.stringify(bookings));
        renderAdminPanel();
        alert('Partner assigned successfully!');
    }
}

/* --- Partner Panel Logic --- */
function renderPartnerPanel() {
    const list = document.getElementById('partner-job-list');
    if(!list) return;

    list.innerHTML = '';

    // Filter jobs that are assigned or already started
    const myJobs = bookings.filter(b => b.partnerAssigned || b.status === 'Ongoing' || b.status === 'Completed');

    if(myJobs.length === 0) {
        list.innerHTML = '<p>No jobs assigned yet.</p>';
        return;
    }

    myJobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'equip-card'; // Reuse style for layout
        card.style.marginBottom = '20px';
        card.style.padding = '20px';
        
        // Buttons based on status
        let buttons = '';
        if(job.status === 'Upcoming') {
            buttons = `<button class="btn-primary" style="padding:10px 20px" onclick="updateStatus('${job.id}', 'Ongoing')">Start Job</button>`;
        } else if (job.status === 'Ongoing') {
            buttons = `<button class="btn-primary" style="padding:10px 20px; background: #2e7d32;" onclick="updateStatus('${job.id}', 'Completed')">Complete Job</button>`;
        } else {
            buttons = `<span>Job Completed <i class="fa-solid fa-check"></i></span>`;
        }

        card.innerHTML = `
            <div style="width:100%">
                <div style="display:flex; justify-content:space-between;">
                    <h3>${job.type} - ${job.date}</h3>
                    <span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span>
                </div>
                <p><strong>Customer:</strong> ${job.name} (${job.phone})</p>
                <p><strong>Address:</strong> ${job.address}</p>
                <div style="margin-top:15px">${buttons}</div>
            </div>
        `;
        list.appendChild(card);
    });
}

function updateStatus(id, newStatus) {
    const index = bookings.findIndex(b => b.id === id);
    if(index !== -1) {
        bookings[index].status = newStatus;
        localStorage.setItem('Cleanin_bookings', JSON.stringify(bookings));
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
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
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

// Run counter animation when stats section is visible
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
}// ==========================================
// NEW: SERVICE DETAIL & AUTO-SELECT LOGIC
// ==========================================

// 1. Service Detail Page Kholne ka logic
function openServiceDetail(service) {
    const detailContainer = document.getElementById('detail-card-content');
    if(!detailContainer) return;
    
    // Dummy Content jo aap baad mein edit kar sakte ho
    const dummyDesc = "This is a premium service designed to give you the best experience. Our highly trained professionals use state-of-the-art equipment and eco-friendly chemicals to ensure 100% hygiene and safety. We understand the importance of a clean environment, which is why we leave no stone unturned in delivering top-notch quality. Sit back and relax while we do the hard work for you!";
    
    // Page ke andar HTML banana
    detailContainer.innerHTML = `
        <img src="${service.img}" class="detail-img" alt="${service.title}">
        <div class="detail-info">
            <div class="detail-header">
                <div>
                    <h2>${service.title}</h2>
                    <div class="rating" style="font-size:1.1rem;"><i class="fa-solid fa-star" style="color:#f59e0b;"></i> ${service.rating} (500+ Verified Reviews)</div>
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
    
    // Naya page open karna
    router('service-detail');
}

// 2. Form mein auto-select karne ka logic
function bookPreselectedService(title, price, img) {
    // A. Pehle Booking page pe le jao
    router('booking');
    
    // B. Dropdown mein photo aur naam change karo
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
        
        // Form submit hone ke liye hidden input mein value daalo
        hiddenInput.value = `${title} (${price})`;
    }
    
    // C. Halka sa neche scroll karo taaki form samne dikhe
    setTimeout(() => {
        const bookingForm = document.getElementById('booking-form');
        if(bookingForm) {
            bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
}