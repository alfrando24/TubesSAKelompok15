const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Middleware untuk melayani file statis dari direktori 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Data kota dan matriks jarak
const namaKota = ['Universitas Telkom', 'Permata Buah Batu', 'Transmart Buah Batu', 'Podomoro Park Buah Batu', 'Mie Ayam Bakso Jabrig'];
const matriksJarak = [
    [0, 750, 1100, 850, 270],
    [750, 0, 1100, 950, 1000],
    [1100, 1100, 0, 1300, 1400],
    [850, 950, 1300, 0, 600],
    [270, 1000, 1400, 600, 0]
];

//BruteForce
// Fungsi untuk menghitung jarak total dari sebuah rute
function hitungJarakRute(rute, matriksJarak) {
    let totalJarak = 0;
    const jumlahKota = rute.length;

    for (let i = 0; i < jumlahKota - 1; i++) {
        totalJarak += matriksJarak[rute[i]][rute[i + 1]];
    }

    totalJarak += matriksJarak[rute[jumlahKota - 1]][rute[0]];
    return totalJarak;
}

// Fungsi untuk mencari rute dengan jarak terjauh menggunakan brute force
function cariRuteTerjauh(matriksJarak, titikAwal) {
    const jumlahKota = matriksJarak.length;
    const kota = Array.from(Array(jumlahKota).keys()).filter(k => k !== titikAwal);

    let ruteTerjauh = null;
    let jarakTerjauh = -1;

    function permutasi(arr, m = [titikAwal]) {
        if (arr.length === 0) {
            const jarakSaatIni = hitungJarakRute(m, matriksJarak);
            if (jarakSaatIni > jarakTerjauh) {
                jarakTerjauh = jarakSaatIni;
                ruteTerjauh = m.slice();
            }
        } else {
            for (let i = 0; i < arr.length; i++) {
                const curr = arr.slice();
                const next = curr.splice(i, 1);
                permutasi(curr.slice(), m.concat(next));
            }
        }
    }

    permutasi(kota);
    return { ruteTerjauh, jarakTerjauh };
}

// GREEDY METHOD
function findMaxRoute(tsp, start) {
    const n = tsp.length;
    let sum = 0;
    let counter = 0;
    let j = 0, i = start;
    let max = -Infinity;
    const visitedRouteList = [start];
    const route = new Array(n).fill(null);

    while (counter < n - 1) {
        for (j = 0; j < n; j++) {
            if (j !== i && !visitedRouteList.includes(j) && tsp[i][j] > max) {
                max = tsp[i][j];
                route[counter] = j;
            }
        }
        sum += max;
        max = -Infinity;
        visitedRouteList.push(route[counter]);
        i = route[counter];
        counter++;
    }

    sum += tsp[i][start];
    route[counter] = start;

    const routeList = [start].concat(route.slice(0, counter));
    return { routeList, sum };
}

// Endpoint untuk memilih metode strategi
app.post('/rute_terjauh', (req, res) => {
    try {
        const { titikAwal, strategi } = req.body;

        if (typeof titikAwal !== 'number' || titikAwal < 0 || titikAwal >= matriksJarak.length) {
            return res.status(400).json({ error: 'Titik awal tidak valid' });
        }

        if (strategi === 'brute_force') {
            const startTime = performance.now();
            const { ruteTerjauh, jarakTerjauh } = cariRuteTerjauh(matriksJarak, titikAwal);
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            const namaRuteTerjauh = ruteTerjauh.map(i => namaKota[i]);

            res.json({
                metode: 'Brute Force',
                rute: namaRuteTerjauh.join(' -> '),
                jarak: jarakTerjauh,
                waktu_eksekusi: executionTime
            });
        } else if (strategi === 'greedy') {
            const startTime = performance.now();
            const { routeList, sum } = findMaxRoute(matriksJarak, titikAwal);
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            const namaRoute = routeList.map(i => namaKota[i]);
            

            res.json({
                metode: 'Greedy',
                rute: namaRoute.join(' -> '),
                jarak: sum,
                waktu_eksekusi: executionTime
            });
        } else {
            res.status(400).json({ error: 'Strategi tidak valid' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
