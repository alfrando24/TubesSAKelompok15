document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tsp-form');

    if (form) { // Pastikan form ditemukan sebelum menambahkan event listener
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const titikAwal = document.getElementById('titikAwal').value;
            const strategi = document.getElementById('strategi').value;

            try {
                const response = await fetch('/rute_terjauh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ titikAwal: parseInt(titikAwal), strategi })
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = `
                    <p>Metode: ${data.metode}</p>
                    <p>Rute Terjauh: ${data.rute}</p>
                    <p>Jarak Terjauh: ${data.jarak} meter</p>
                    <p>Waktu Eksekusi: ${data.waktu_eksekusi}</p>
                `;
            } catch (error) {
                console.error('Error:', error);
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
            }
        });
    } else {
        console.error('Form not found.');
    }
});
