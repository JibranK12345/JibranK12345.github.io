// === include 'setup' then 'config' above ===
var firebaseConfig = {
    apiKey: "AIzaSyCFTPnJJ-5PFtarlCk9tYnV954zUz0eB2E",
    authDomain: "my-workout-group-analytics.firebaseapp.com",
    databaseURL: "https://my-workout-group-analytics-default-rtdb.firebaseio.com",
    projectId: "my-workout-group-analytics",
    storageBucket: "my-workout-group-analytics.appspot.com",
    messagingSenderId: "829726898031",
    appId: "1:829726898031:web:37a995c70d66592d451a9a",
    measurementId: "G-MENDMHF09H"
};

  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var database = firebase.database().ref('analytics')
database.get().then((snapshot) => {
    if (snapshot.exists()) {
        createCharts(snapshot.val())
    }
})

function createCharts(data) {
    var dates = []

    var ageAmounts = {}
    var genderAmounts = {}
    var ageAndGenderAmounts = {}
    var averageAgeCheckins = {}
    var averageGenderCheckins = {}
    var totalCheckIns = {}
    var totalGroups = {}
    var totalUsers = {}
    var totalCheckInsToday = {}

    totalCheckIns["Total Check Ins"] = []
    totalGroups["Total Groups"] = []
    totalUsers["Total Users"] = []
    totalCheckInsToday["Total CheckIns Today"] = []


    for (var key in data) {
        dates.push(key)
        var dataPoint = data[key]

        for (var ageKey in dataPoint.age) {
            if (ageAmounts[ageKey] == null) {
                ageAmounts[ageKey] = []
            }
            var age = dataPoint.age[ageKey]
            ageAmounts[ageKey].push(age.amount)
        }

        for (var genderKey in dataPoint.gender) {
            if (genderAmounts[genderKey] == null) {
                genderAmounts[genderKey] = []
            }
            var gender = dataPoint.gender[genderKey]
            genderAmounts[genderKey].push(gender.amount)
        }

        for (var genderKey in dataPoint.gender) {
            if (genderAmounts[genderKey] == null) {
                genderAmounts[genderKey] = []
            }
            var gender = dataPoint.gender[genderKey]
            genderAmounts[genderKey].push(gender.amount)
        }

        for (var ageKey in dataPoint.ageAndGender) {
            for (var genderKey in dataPoint.ageAndGender[ageKey]) {
                ageAndGenderKey = String(ageKey) + String(genderKey)
                if (ageAndGenderAmounts[ageAndGenderKey] == null) {
                    ageAndGenderAmounts[ageAndGenderKey] = []
                }
                var ageAndGender = dataPoint.ageAndGender[ageKey][genderKey]
                
                ageAndGenderAmounts[ageAndGenderKey].push(ageAndGender.amount)    
            }
        }

        for (var ageCheckInKey in dataPoint.averageAgeCheckIns) {
            if (averageAgeCheckins[ageCheckInKey] == null) {
                averageAgeCheckins[ageCheckInKey] = []
            }
            var averageAgeCheckIn = dataPoint.averageAgeCheckIns[ageCheckInKey]
            averageAgeCheckins[ageCheckInKey].push(averageAgeCheckIn.average)
        }

        for (var genderCheckInKey in dataPoint.averageGenderCheckIns) {
            if (averageGenderCheckins[genderCheckInKey] == null) {
                averageGenderCheckins[genderCheckInKey] = []
            }
            var averageGenderCheckIn = dataPoint.averageGenderCheckIns[genderCheckInKey]
            averageGenderCheckins[genderCheckInKey].push(averageGenderCheckIn.average)
        }

        totalCheckIns["Total Check Ins"].push(dataPoint.totalCheckInsAllTime)
        totalGroups["Total Groups"].push(dataPoint.totalGroups)
        totalUsers["Total Users"].push(dataPoint.totalUsers)
        totalCheckInsToday["Total CheckIns Today"].push(dataPoint.todaysCheckIns)
    }

    generateChart(dates, totalCheckInsToday, 'todaysCheckIns')
    generateChart(dates, ageAmounts, 'ages')
    generateChart(dates, genderAmounts, 'genders')
    generateChart(dates, ageAndGenderAmounts, 'ageAndGenders')
    generateChart(dates, averageAgeCheckins, 'averageAgeCheckins')
    generateChart(dates, averageGenderCheckins, 'averageGenderCheckins')

    generateChart(dates, totalCheckIns, 'totalCheckIns')
    generateChart(dates, totalGroups, 'totalGroups')
    generateChart(dates, totalUsers, 'totalUsers')
    

}


function generateChart(labels, dataPoints, chartName) {
    colors = ['red', 'blue', 'green', 'pink', 'yellow', 'orange', 'brown', 'violet', 'indigo', 'aqua', 'gray', 'black', 'lime']
    datasets = []
    color = 0
    for (key in dataPoints) {
        currColor = colors[color]
        datasets.push({
            label: key,
            backgroundColor: currColor,
            borderColor: currColor,
            data: dataPoints[key],
        })
        color += 1
    }
    const data = {
        labels: labels,
        datasets: datasets
    }
      
    const config = {
        type: 'line',
        data,
        options: {}
    };    
    designChart(config, chartName)
}

function designChart(config, chartName) {
    var myChart = new Chart(
        document.getElementById(chartName),
        config
    );
}

// const labels = [
//     'January',
//     'February',
//     'March',
//     'April',
//     'May',
//     'June',
// ];

// const data = {
//     labels: labels,
//     datasets: [{
//         label: 'My First dataset',
//         backgroundColor: 'rgb(255, 99, 132)',
//         borderColor: 'rgb(255, 99, 132)',
//         data: [0, 10, 5, 2, 20, 30, 45],
//     }]
// };
    

                    

