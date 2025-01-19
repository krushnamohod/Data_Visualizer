document.addEventListener('DOMContentLoaded', () => {
    const logoContainer = document.querySelector('.logo-container');
    const logo = document.querySelector('.logo');
    const mainContent = document.querySelector('.main-content');

    // Initial animation sequence
    setTimeout(() => {
        logoContainer.classList.add('moved');
        logo.classList.add('moved');
        
        setTimeout(() => {
            mainContent.classList.add('visible');
            initializeCharts();
        }, 1000);
    }, 2000);

    function initializeCharts() {
        const signupsData = {
            labels: ['1/2023', '2/2023', '3/2023', '4/2023'],
            datasets: [
                {
                    label: 'Premium users',
                    data: [200, 300, 350, 400],
                    borderColor: '#e65d20',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Non-premium users',
                    data: [100, 150, 200, 250],
                    borderColor: '#3b82f6',
                    tension: 0.4,
                    fill: false
                }
            ]
        };

        const revenueData = {
            labels: ['Toronto', 'Vancouver', 'Montreal'],
            datasets: [{
                data: [35, 30, 35],
                backgroundColor: ['#e65d20', '#3b82f6', '#8b5cf6'],
                borderWidth: 0
            }]
        };

        const ordersData = {
            labels: ['6/2023', '12/2023', '6/2021', '12/2021', '6/2022', '12/2022', '6/2023'],
            datasets: [
                {
                    label: 'Toronto',
                    data: [10, 15, 20, 25, 30, 35, 40],
                    backgroundColor: '#e65d20'
                },
                {
                    label: 'Vancouver',
                    data: [8, 12, 16, 20, 25, 30, 35],
                    backgroundColor: '#3b82f6'
                },
                {
                    label: 'Montreal',
                    data: [6, 10, 14, 18, 22, 26, 30],
                    backgroundColor: '#8b5cf6'
                }
            ]
        };

        new Chart(document.getElementById('signupsChart'), {
            type: 'line',
            data: signupsData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        new Chart(document.getElementById('revenueChart'), {
            type: 'doughnut',
            data: revenueData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        new Chart(document.getElementById('ordersChart'), {
            type: 'bar',
            data: ordersData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('hidden');
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.team-card').forEach(card => {
            observer.observe(card);
        });
    }
});
